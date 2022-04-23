// Project: enocean-core
// File: Gateway.ts
//
// Copyright 2020 Henning Kerstan
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { SerialPort } from 'serialport'
import { DeviceId } from '../device/DeviceId'

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')

import { RORGs } from '../erp1/RORGs'
import { ResponseTelegram } from '../esp3/response/ResponseTelegram'
import { ESP3Packet } from '../esp3/ESP3Packet'
import { ESP3PacketTypes } from '../esp3/ESP3PacketTypes'
import { CommonCommandTelegram } from '../esp3/common-command/CommonCommandTelegram'
import { VersionResponseTelegram } from '../esp3/response/VersionResponseTelegram'
import { ERP1Telegram } from '../erp1/ERP1Telegram'
import { UTEMessage } from '../ute/UTEMessage'
import { CommonCommandCode } from '../esp3/common-command/CommonCommandCode'
import { ResponseReturnCode } from '../esp3/response/ResponseReturnCode'
import { DeviceInfoMap } from '../device/DeviceInfoMap'
import { DeviceInfo } from '../device/DeviceInfo'
import { EventEmitter } from 'events'
import { UTEQueryRequestType } from '../ute/UTEQueryRequestType'
import { UTEResponseRequestType } from '../ute/UTEResponseRequestType'
import { Byte } from '@henningkerstan/byte'
import { Manufacturers } from '../device/Manufacturers'

import { ESP3PacketUnfamiliarityReasons } from '../esp3/ESP3PacketUnfamiliarityReasons'
import { ERP1TelegramUnfamiliarityReasons } from '../erp1/ERP1TelegramUnfamiliarityReasons'

import { ESP3PacketUnfamiliarListener } from '../esp3/ESP3PacketUnfamiliarListener'
import { ESP3PacketListener } from '../esp3/ESP3PacketListener'
import { ERP1TelegramUnfamiliarListener } from '../erp1/ERP1TelegramUnfamiliarListener'
import { ERP1TelegramListener } from '../erp1/ERP1TelegramListener'
import { TeachInMethods } from './TeachInMethods'

import { DeviceTeachInListener } from '../device/DeviceTeachInListener'
import { SendingResults } from './SendingResults'

import { EEPId, EEPParser, EEPMessage, EEPMessageListener } from '../eep'
import { JSONFileDeviceInfoMap } from '../device/JSONFileDeviceInfoMap'

/**
 * This class implements the core functionality of an EnOcean gateway.
 * Currently it has only been tested with an EnOcean TCM310 module.
 *
 * ## Initialization
 * The constructor of this class is private. To obtain an instance, the only
 * currently available option is to use the static function {@link connectToSerialPort}.
 *
 * ## Automatic interpretation of incoming data
 * This class automatically interprets all incoming data as far as possible. The
 * receiving chain is outlined below.
 *
 * Trigger: Data is received on the serial port.
 *
 * 1. Try to interpret the received data as ESP3 packet:
 *    - on failure: do nothing and stop,
 *    - on success: call all listeners registered by {@link onReceivedESP3Packet} and
 *      proceed to step 2.
 *
 * 2. Try to interpret the ESP3 packet:
 *    - on failure: call all listeners registered by
 *      {@link onReceivedESP3PacketUnfamiliar} and stop,
 *    - on successful interpretation of a response telegram: process response
 *      internally and stop,
 *    - on successful interpretation as ERP1 telegram: call all listeners
 *      registered by {@link onReceivedERP1Telegram} and
 *      proceed to step 3.
 *
 * 3. Try to interpret the ERP1 telegram:
 *    - on failure: call all listeners registered by
 *      {@link onReceivedERP1TelegramUnfamiliar} and stop,
 *    - on successful interpretation of a teach in message (UTE / 4BS): handle
 *      teach in internally (if learn mode is enabled) or discard message (if
 *      learn mode is disabled) and stop,
 *    - on recognition of a data telegram (RPS/1BS/4BS/VLD), proceed to step 4
 *
 * 4. Identify the sender (check if the device is known):
 *    - on failure: call all listeners registered by
 *      {@link onReceivedERP1TelegramUnfamiliar} with reason
 *      {@link ERP1TelegramParsingErrors.DeviceUnknown} and stop,
 *    - on success, proceed to step 5.
 *
 * 5. Get the EEP:
 *    - on failure: call all listeners registered by
 *      {@link onReceivedERP1TelegramUnfamiliar} with reason
 *      {@link ERP1TelegramParsingErrors.EEPUnknown} and stop,
 *    - on success, proceed to step 6.
 *
 * 6. Get a parser for the EEP:
 *    - on failure: call all listeners registered by
 *      {@link onReceivedERP1TelegramUnfamiliar} with reason
 *      {@link ERP1TelegramParsingErrors.EEPUnsupported} and stop,
 *    - on success, proceed to step 7.
 *
 * 7. Parse the data:
 *    - on failure: call all listeners registered by
 *      {@link onReceivedERP1TelegramUnfamiliar} with reason
 *      {@link ERP1TelegramParsingErrors.EEPParsingError} and stop,
 *    - on success, call all listeners registered by {@link onReceivedEEPMessage}.
 *
 * As you can see above, for all types of involved data structures
 * ({@link ESP3Packet}, {@link ERP1Telegram}, {@link EEPMessage}) the gateway
 * _always_ notifies the sucessful parsing. For the first two, it is possible
 * that further processing fails in which case the respective *unfamiliar* event
 * will be triggered. This way, you can implement your own functionality either
 * for all data or only for data, which cannot be interpreted (yet) by built-in
 * functionality.
 */

export class Gateway {
  private constructor() {
    // nothing to be done
  }

  /**
   * Return a new instance using the supplied serial port.
   * @param portString A string identifying the serial port to which the TCM310 module is connected; this might e.g. be "/dev/ttyAMA0" (for the EnOceanPi module on a Raspberry Pi) or "COM3" (for a USB300 module in Windows).
   * @param deviceInfoMap A {@link DeviceInfoMap} implementation to be used for storing and retreiving information about the EnOcean devices with which this gateway can communicate. Default is a {@link JSONFileDeviceInfoMap} using the default file '.known_enocean_devices'.
   */
  static connectToSerialPort(
    portString: string,
    deviceInfoMap: DeviceInfoMap = JSONFileDeviceInfoMap.defaultFile()
  ): Gateway {
    const gateway = new Gateway()
    gateway.port = new SerialPort({ path: portString, baudRate: 57600 })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    gateway.parser = gateway.port.pipe(new InterByteTimeout({ interval: 50 }))
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    gateway.parser.on('data', (data: Buffer) => {
      gateway.parseData(data)
    })
    gateway.knownDevices = deviceInfoMap
    return gateway
  }

  /**
   * Get the status of the gateway's learn mode.
   */
  get isLearning(): boolean {
    return this._learning
  }

  /**
   *  Internal storage for the DeviceId to be used for the learning process
   *  when the gateway is in learn mode.
   */
  private senderForLearning: DeviceId = DeviceId.gatewaySelectsSender

  /**
   * A simple delay function.
   * @param ms Delay time in milliseconds.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /** The built in eep parsers. */
  private eepParsers: Map<string, EEPParser> = new Map()

  /**
   * Get the EEPParser for the supplied EEP.
   * @param eep The eep for which the parser is requested.
   * @returns Returns the EEPParser registered for the supplied EEP or
   * `undefined` if no parser is found.
   */
  getEEPParser(eep: EEPId): EEPParser | undefined {
    return this.eepParsers.get(eep.toString())
  }

  /**
   * Registers a parser for the given EEP. This parser is used to interpret
   * received telegrams for devices with this EEP.
   * @param eep
   * @param parser
   */
  setEEPParser(eep: EEPId, parser: EEPParser): void {
    this.eepParsers.set(eep.toString(), parser)
  }

  /**
   * Checks if there is a parser for the given EEP.
   * @param eep
   */
  hasEEPParser(eep: EEPId): boolean {
    return this.eepParsers.has(eep.toString())
  }

  /**
   * Get a list of EEPs for which a parser is registered.
   */
  getSupportedEEPs(): EEPId[] {
    const eeps: EEPId[] = []
    this.eepParsers.forEach((value, key) => {
      eeps.push(EEPId.fromString(key))
    })
    eeps.sort()
    return eeps
  }

  /**
   * Get the (teach-in) meta data associated to the supplied device.
   * @param device The device to be queried.
   */
  getDeviceInfo(device: DeviceId): DeviceInfo | undefined {
    return this.knownDevices.get(device)
  }

  /**
   *  Known devices are those EnOcean devices, which have been learned while
   *  the gateway was in learn mode. For simple sensors (switches etc.),
   *  which only send data to the gateway, the gateway needs to know
   *  about the actuator but not the other way around. For actuators or more
   *  complex devices, which accept commands from the gateway, learning requires
   *  also that the gateway is known to the device.
   */
  private knownDevices: DeviceInfoMap

  /**
   * Manual teach in of a device. Use with care: might overwrite existing info.
   * @param device The device id of the device to be taught in.
   * @param eep The device's EEP.
   * @param manufacturer  The device's manufacturer.
   * @param localId The local id which shall be used when sending to the device.
   * Defaults to the gateway's chip id.
   */
  async teachDevice(
    device: DeviceId,
    eep: EEPId,
    manufacturer: Manufacturers = Manufacturers.Reserved,
    localId: DeviceId = DeviceId.gatewaySelectsSender
  ): Promise<void> {
    const info = new DeviceInfo()
    info.teachInMethod = TeachInMethods.Manual
    info.eep = eep
    info.manufacturer = manufacturer
    info.deviceId = device

    if (localId.toNumber() === 0) {
      info.localId = await this.getChipId()
    } else {
      info.localId = localId
    }

    this.knownDevices.set(info)
    this.emitDeviceTeachIn(info)
  }

  /**
   * Register a listener to be called when a device was successfully taught in.
   * @param listener This function will be called once a device was successfully
   * taught in.
   */
  onDeviceTeachIn(listener: DeviceTeachInListener): void {
    this.emitter.on('deviceTeachIn', listener)
  }

  /**
   * Register a listener to be called when a device was successfully taught in.
   * @param listener This function will be called once a device was successfully
   * taught in.
   */
  // TODO
  private onUTE(listener: DeviceTeachInListener): void {
    this.emitter.on('deviceTeachIn', listener)
  }

  // private onDeviceTeachOut(callback: (info: DeviceInfo) => void) {
  //   // TODO for future version
  // }

  private startListening(): void {
    // TODO for future version
  }

  private stopListening(): void {
    // TODO for future version
  }

  private handle4BSLearn(telegram: ERP1Telegram): void {
    if (!this.isLearning) {
      return
    }

    // in learning mode get device info and store/update known devices
    const db0 = Byte.fromUInt8LSB(telegram.getDB(0))
    const containsEEPandManufacturer = db0.getBit(7) === 1 ? true : false

    const deviceInfo = new DeviceInfo()
    deviceInfo.localId = this.senderForLearning

    if (containsEEPandManufacturer) {
      const db3 = Byte.fromUInt8LSB(telegram.getDB(3))
      const db2 = Byte.fromUInt8LSB(telegram.getDB(2))
      const db1 = Byte.fromUInt8LSB(telegram.getDB(1))

      const func = db3.readUIntLSB(2, 6)
      let type = db2.readUIntLSB(3, 5)
      type += db3.readUIntLSB(0, 2) << 5
      deviceInfo.eep = EEPId.fromTriple(telegram.rorg, func, type)

      deviceInfo.manufacturer = db1.readUIntLSB()
      deviceInfo.manufacturer += db2.readUIntLSB(0, 3) << 8
    }

    // update known devices with information
    deviceInfo.teachInMethod = TeachInMethods.Learn4BS
    deviceInfo.deviceId = telegram.sender
    this.knownDevices.set(deviceInfo)
    this.emitDeviceTeachIn(deviceInfo)
  }

  // TODO: improve the ute query handling
  private async handleUTEQuery(query: UTEMessage, sender: DeviceId) {
    // assertion: we are in learning mode and query is indeed a query (must be checked before calling this function!)

    // console.log(
    //   'Received UTE query: ' +
    //     query.toString() +
    //     'from device ' +
    //     sender.toString,
    // )

    // copy the query into response and modify the response before sending
    const response = query
    response.isResponse = true

    // further processing depends on whether this device is known or not
    // if it is known, we can only delete the teach in
    if (this.knownDevices.has(sender)) {
      // ignore teach-in; TODO: IS THIS REALLY A GOOD IDEA? SHALL WE JUST RESPOND 'ok' ALTERNATIVELY? YES -> TODO!
      if (query.requestType === UTEQueryRequestType.TeachIn) {
        console.warn(
          'Ignoring UTE teach in from EnOcean device ' +
            sender.toString() +
            ' because device is already known.'
        )
        return
      }

      if (this.knownDevices.delete(sender)) {
        response.requestType = UTEResponseRequestType.AcceptedDeletionOfTeachIn
      } else {
        response.requestType = UTEResponseRequestType.NotAcceptedGeneralReason
      }
    }

    // ignore teach-in deletion (cannot delete if device is unknown)
    if (query.requestType === UTEQueryRequestType.TeachInDeletion) {
      return
    }

    const deviceInfo = new DeviceInfo()
    deviceInfo.eep = query.eep
    deviceInfo.localId = this.senderForLearning
    deviceInfo.manufacturer = query.manufacturerId
    deviceInfo.teachInMethod = TeachInMethods.UTE
    deviceInfo.deviceId = sender

    this.knownDevices.set(deviceInfo)
    if (this.knownDevices.has(sender)) {
      response.requestType = UTEResponseRequestType.AcceptedTeachIn
    } else {
      response.requestType = UTEResponseRequestType.NotAcceptedGeneralReason
    }

    // send to device (must be an adressed telegram!!!)
    const erp1 = response.toERP1Telegram(this.senderForLearning, sender)

    const res: SendingResults = await this.sendERP1Telegram(erp1)

    if (res > 0) {
      return
    }

    this.emitDeviceTeachIn(deviceInfo)
  }

  /**
   * Parses the given UTE message.
   * @param message
   * @param sender
   */
  private parseUTEMessage(message: UTEMessage, sender: DeviceId) {
    this.emitter.emit('UTEMessage', message)

    // stop processing if not in learning mode
    if (!this.isLearning) {
      return
    }

    // ignore responses
    if (message.isResponse) {
      return
    }

    // handle query
    void this.handleUTEQuery(message, sender)
  }

  private parseERP1Telegram(telegram: ERP1Telegram) {
    this.emitReceivedERP1Telegram(telegram)

    // Universal Teach-In (UTE) message
    if (telegram.rorg === RORGs.UTE) {
      try {
        const ute = UTEMessage.fromERP1Telegram(telegram)
        this.parseUTEMessage(ute, telegram.sender)
      } catch (error) {
        this.emitReceivedERP1TelegramUnfamiliar(
          telegram,
          ERP1TelegramUnfamiliarityReasons.UTEParsingError,
          error
        )
      }
      return
    }

    // 4BS teach in
    if (telegram.rorg === RORGs.FOURBS) {
      const db0 = Byte.fromUInt8LSB(telegram.getDB(0))
      const learn = db0.getBit(3) === 0 ? true : false

      if (learn) {
        this.handle4BSLearn(telegram)
        return
      }
    }

    // Data telegrams
    if (
      telegram.rorg === RORGs.RPS ||
      telegram.rorg === RORGs.ONEBS ||
      telegram.rorg === RORGs.FOURBS ||
      telegram.rorg === RORGs.VLD
    ) {
      // get device info
      let deviceInfo: DeviceInfo | undefined = undefined

      if (this.knownDevices.has(telegram.sender)) {
        // sender is known
        deviceInfo = this.knownDevices.get(telegram.sender)
      } else {
        // destination is known, hence sender might be a gateway
        if (this.knownDevices.has(telegram.destination)) {
          deviceInfo = this.knownDevices.get(telegram.destination)
          // console.log(
          //   'DESTINATION ' +
          //     telegram.destination.toString() +
          //     ': ' +
          //     deviceInfo.toString(),
          // )
        }
      }

      // no further processing if device is still unknown
      if (!deviceInfo) {
        this.emitReceivedERP1TelegramUnfamiliar(
          telegram,
          ERP1TelegramUnfamiliarityReasons.DeviceUnknown
        )
        return
      }

      // no further processing if EEP is unknown
      if (!deviceInfo.eep) {
        this.emitReceivedERP1TelegramUnfamiliar(
          telegram,
          ERP1TelegramUnfamiliarityReasons.EEPUnknown
        )
        return
      }

      if (!this.hasEEPParser(deviceInfo.eep)) {
        this.emitReceivedERP1TelegramUnfamiliar(
          telegram,
          ERP1TelegramUnfamiliarityReasons.EEPUnsupported
        )
        return
      }

      try {
        const eepParser = this.getEEPParser(deviceInfo.eep)
        //console.log('PARSER for ' + deviceInfo.eep.toString())
        //console.log('PARSER IS: ' + eepParser)
        const eepMessage = eepParser(telegram)
        this.emitReceivedEEPMessage(eepMessage, telegram)
      } catch (error) {
        this.emitReceivedERP1TelegramUnfamiliar(
          telegram,
          ERP1TelegramUnfamiliarityReasons.EEPParsingError,
          error
        )
      }
    }
  }

  private parseESP3Packet(packet: ESP3Packet) {
    this.emitReceivedESP3Packet(packet)

    // parsing depends on packet type
    switch (packet.packetType) {
      case ESP3PacketTypes.Response:
        try {
          this.latestResponse = ResponseTelegram.fromESP3Packet(packet)
        } catch (error) {
          this.emitReceivedESP3PacketUnfamiliar(
            packet,
            ESP3PacketUnfamiliarityReasons.ResponseParsingError,
            error
          )
        }
        break

      case ESP3PacketTypes.RadioERP1:
        try {
          const telegram = ERP1Telegram.fromESP3Packet(packet)
          this.parseERP1Telegram(telegram)
        } catch (error) {
          // TODO: improve
          this.emitReceivedESP3PacketUnfamiliar(
            packet,
            ESP3PacketUnfamiliarityReasons.ERP1ParsingError,
            error
          )
        }
        break

      default:
        this.emitReceivedESP3PacketUnfamiliar(
          packet,
          ESP3PacketUnfamiliarityReasons.PacketTypeUnsupported
        )
    }
  }

  // parse incoming data
  private parseData(data: Buffer) {
    this.emitter.emit('data', data)

    try {
      // convert to ESP3 Packet and emit corresponding event
      const packet = ESP3Packet.fromBuffer(data)
      this.parseESP3Packet(packet)
    } catch (error) {
      // could not parse packet; this will be ignored
      this.emitter.emit('unknownData', data)
    }
  }

  /**
   * Register a listener to be called when an ESP3 packet is received. The
   * listener will be called *before any further internal processing* of the
   * ESP3 packet.
   * @param listener This function will be called whenever an ESP3 packet is
   * received.
   */
  onReceivedESP3Packet(listener: ESP3PacketListener): void {
    this.emitter.on('receivedESP3Packet', listener)
  }

  /**
   * Register a listener to be called when a received ESP3 packet was classified
   * as *unfamiliar*. This is the case if and only if the further internal
   * processing of the packet was unsuccessful.
   *
   * @param listener This function will be called when when a received ESP3
   * packet was classified as *unfamiliar*.
   *
   */
  onReceivedESP3PacketUnfamiliar(listener: ESP3PacketUnfamiliarListener): void {
    this.emitter.on('receivedESP3PacketUnfamiliar', listener)
  }

  /**
   * Register a listener to be called when an ERP1 telegram is received. The
   * listener will be called *before any further internal processing* of the
   * ERP1 telegram.
   * @param listener This function will be called whenever an ERP1 telegram is
   * received.
   */
  onReceivedERP1Telegram(listener: ERP1TelegramListener): void {
    this.emitter.on('receivedERP1Telegram', listener)
  }

  /**
   * Register a listener to be called when a received ERP1 telegram was
   * classified as *unfamiliar*. This is the case if and only if the further
   * internal processing of the telegram was unsuccessful.
   *
   * @param listener This function will be called when when a received ERP1
   * telegram was classified as *unfamiliar*.
   *
   */
  onReceivedERP1TelegramUnfamiliar(
    listener: ERP1TelegramUnfamiliarListener
  ): void {
    this.emitter.on('receivedERP1TelegramUnfamiliar', listener)
  }

  /**
   * Register a listener to be called when an EEP message is received.
   * @param listener This function will be called whenever an EEP message is
   * received.
   */
  onReceivedEEPMessage(listener: EEPMessageListener): void {
    this.emitter.on('receivedEEPMessage', listener)
  }

  private emitDeviceTeachIn(info: DeviceInfo): void {
    this.emitter.emit('deviceTeachIn', info)
  }

  private emitReceivedESP3Packet(packet: ESP3Packet): void {
    this.emitter.emit('receivedESP3Packet', packet)
  }

  private emitReceivedESP3PacketUnfamiliar(
    packet: ESP3Packet,
    reason: ESP3PacketUnfamiliarityReasons,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any
  ): void {
    this.emitter.emit('receivedESP3PacketUnfamiliar', packet, reason, error)
  }

  private emitReceivedERP1Telegram(telegram: ERP1Telegram): void {
    this.emitter.emit('receivedERP1Telegram', telegram)
  }

  private emitReceivedERP1TelegramUnfamiliar(
    telegram: ERP1Telegram,
    reason: ERP1TelegramUnfamiliarityReasons,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any
  ): void {
    this.emitter.emit('receivedERP1TelegramUnfamiliar', telegram, reason, error)
  }

  private emitReceivedEEPMessage(message: EEPMessage, telegram: ERP1Telegram) {
    this.emitter.emit('receivedEEPMessage', message, telegram)
  }

  /**
   * Get the gateway's chip ID. This ID is the unique EnOcean ID of the
   * connected transceiver and cannot be changed.
   */
  async getChipId(): Promise<DeviceId | undefined> {
    const ver = await this.getVersionInfo()
    if (!ver) {
      return undefined
    }
    return ver.chipId
  }

  /**
   * Get the gateways's base ID. This ID can be changed a limited number of
   * times.
   */
  async getBaseId(): Promise<DeviceId | undefined> {
    if (this.baseId) {
      return this.baseId
    }

    await this.getBaseIdInformation()
    return this.baseId
  }

  /**
   * Get the number of available resets for the base ID. The base ID of a
   * TCM310 transceiver can be reset up to 10 times.
   */
  async getBaseIdResetCounter(): Promise<number | undefined> {
    if (this.baseIdResetCounter !== undefined) {
      return this.baseIdResetCounter
    }

    await this.getBaseIdInformation()
    return this.baseIdResetCounter
  }

  private async getBaseIdInformation() {
    const cmd = new CommonCommandTelegram(CommonCommandCode.CO_RD_IDBASE)
    const res = await this.sendBuffer(cmd.toESP3Packet().toBuffer())

    if (!res) {
      throw new Error('no response received')
    }

    if (res.returnCode !== ResponseReturnCode.Ok) {
      throw new Error('response is not ok')
    }

    let id = 0
    if (res.responseData !== undefined && res.responseData.length === 4) {
      id = res.responseData.readUIntBE(0, 4)
    }
    this.baseId = DeviceId.fromNumber(id)

    if (res.optionalData.length === 1) {
      // todo: improve this
      this.baseIdResetCounter = res.optionalData.readUInt8(0)
    }
  }

  // todo: Implement and make public
  private async setBaseId(baseId: DeviceId): Promise<void> {
    console.error(
      'setBaseId not yet implemented - will only check if id is possible'
    )

    if (baseId.toNumber() < 0xff800000 || baseId.toNumber() > 0xffffff80) {
      throw new Error(
        baseId.toString() +
          ' is not a valid base id. Allowed range is: FF800000 to FFFFFF80.'
      )
    }

    //  WARNING: base id may only be changed 10 times!!!!!!!!

    //  see https://www.enocean.com/en/support/knowledge-base/knowledge-base-doku/enoceansystemspecification:issue:what_is_a_base_id/

    // reset internal cache
    this.baseId = undefined
    this.baseIdResetCounter = undefined

    return Promise.resolve()
  }

  private versionInfo: VersionResponseTelegram = undefined
  private baseId: DeviceId = undefined
  private baseIdResetCounter: number = undefined

  // TODO: implement publically in future version
  private async getVersionInfo(): Promise<VersionResponseTelegram | undefined> {
    if (this.versionInfo) {
      return this.versionInfo
    }

    const cmd = new CommonCommandTelegram(CommonCommandCode.CO_RD_VERSION)
    const res = await this.sendBuffer(cmd.toESP3Packet().toBuffer())

    if (!res) {
      return undefined
    }

    this.versionInfo = VersionResponseTelegram.fromResponseTelegram(res)

    return this.versionInfo
  }

  /**
   * Set the gateway into learning mode.
   *
   * - Universal Teach-In (UTE): The gateway will respond to Universal Teach-In (UTE) queries and add the respective device to the list of known devices.
   * - 4BS teach in: The gateway will interpret 4BS telegrams, whose learn bit
   * is set, and add the device and its EEP to the list of known devices.
   * - RPS: Upon receipt of RPS (data) telegrams from yet unknown devices also these will be added to the list of known devices. As RPS communication has no teach-in telegram, the correct EEP has to be added manually afterwards.
   *
   * @param timeout The timeout (in seconds) after which the learning mode will be disabled automatically.
   * @param sender The sender ID to be used for the learning process. Can be either the sender's chip id or one of the 128 consecutive adresses starting at the sender's base id. Defaults to the sender's chip id.
   */
  async startLearning(
    timeout = 60,
    sender: DeviceId = DeviceId.gatewaySelectsSender
  ): Promise<void> {
    if (timeout < 1) {
      throw new Error('cannot learn for < 1 seconds')
    }

    if (sender.toNumber() === 0) {
      sender = await this.getChipId()
    }

    this.senderForLearning = sender
    this._learning = true

    // automatically stop learning when timeout
    setTimeout(() => {
      this._learning = false
      this.emitter.emit('stopLearning', false)
    }, timeout * 1000)

    //console.log('Started learn mode for the next ' + timeout + ' seconds')
  }

  /**
   * Manually stop the learning mode.
   */
  stopLearning(): void {
    this._learning = false
    this.emitter.emit('stopLearning', true)
  }

  /**
   * Check if the supplied device id can be used for sending with this gateway.
   * This is the case if (and only if) the supplied id is
   * - the gateway's chip id,
   * - the gateway's base id or one of the 127 subsequent ids.
   * @param sender The device id to be checked.
   */
  async isValidSender(sender: DeviceId): Promise<boolean> {
    // absolute IDs can be converted to number
    const senderAsNumber = sender.toNumber()

    // 0 is an invalid sender
    if (senderAsNumber === 0) {
      return false
    }

    // the chip ID is a valid sender ID
    const chipId = await this.getChipId()
    if (senderAsNumber === chipId.toNumber()) {
      return true
    }

    // base id, ... base ID + 127 are valid sender IDs
    const baseId = await this.getBaseId()
    const baseIdAsNumber = baseId.toNumber()
    if (senderAsNumber < baseIdAsNumber) {
      return false
    }

    if (senderAsNumber > baseIdAsNumber + 127) {
      return false
    }

    return true
  }

  /**
   * Send the EEPMessage
   * @param msg
   */
  // private sendEEPMessage(msg: EEPMessage) {
  //   throw new Error('NOT YET IMPLEMENTED') //TODO
  // }

  /**
   * Send a telegram via radio.
   * @param telegram The telegram to be sent. If this telegram contains an invalid sender address, the telegram will be sent using:
   * - the address found in the knownDevices for the destination, or
   * - the chip id.
   */
  async sendERP1Telegram(telegram: ERP1Telegram): Promise<SendingResults> {
    let isValid = await this.isValidSender(telegram.sender)
    if (isValid === false) {
      if (this.knownDevices.has(telegram.destination)) {
        telegram.sender = this.knownDevices.get(telegram.destination).localId

        isValid = await this.isValidSender(telegram.sender)
        if (isValid === false) {
          telegram.sender = await this.getChipId()
        }
      } else {
        telegram.sender = await this.getChipId()
      }
    }

    // try to send
    try {
      const packet = telegram.toESP3Packet()
      const res = await this.sendESP3Packet(packet)
      return res
    } catch (error) {
      return SendingResults.ErrorTransformingToESP3
    }
  }

  /**
   * Send the supplied ESP3 packet. Note: this low level method does not
   * perform any checks/replacements on the sender id for ERP1 telegrams.
   * @param packet The packet to be sent.
   */
  async sendESP3Packet(packet: ESP3Packet): Promise<SendingResults> {
    try {
      const buffer = packet.toBuffer()
      const res = await this.sendBuffer(buffer, true)
      return <number>res.returnCode
    } catch (error) {
      return SendingResults.ErrorTransformingToBuffer
    }
  }

  /**
   * Send a buffer via the serial port. This function ensures, that sending is properly serialized, i.e. the function needs to complete (and this might include waiting for a response) before it can be called again.
   * @param buffer The buffer to be sent.
   * @param waitForResponse Waiting for response is defined in ENOCEAN SERIAL PROTOCOL (ESP3) - SPECIFICATION, 1.9:

    Case 1 : ESP3 packets of the type RADIO_ERP1, RADIO_SUB_TEL or REMOTE_MAN are bidirectional, that is, after sending a packet (host -> module) it is mandatory to wait for the RESPONSE message, to confirm the telegram has been processed and will subsequently be transmitted.
    After receiving (module -> host) a packet no RESPONSE is required (see RADIO_ERP1 no. <3> and <4>).

    Case 2 : Only a host sends a ESP3 COMMAND (COMMON, SMART ACK) to an EnOcean module. Each REQUEST is answered with a RESPONSE message (OK, error, etc.). The reverse direction module-to-host is not possible.

    Case 3 : Only an EnOcean module sends an EVENT to a host. The type of the EVENT defines whether a RESPONSE message is required or not.    
  */
  private async sendBuffer(
    buffer: Buffer,
    waitForResponse = true
  ): Promise<ResponseTelegram | undefined> {
    // wait until previous sending is complete; forced timeout after two seconds
    for (let ms = 10; ms < 2010; ms += 10) {
      if (this.isSending === true) {
        await this.delay(10)
      }
    }

    // could not send after two seconds
    if (this.isSending === true) {
      throw new Error('cannot send while previous sending is unfinished')
    }

    // prevent concurrent sending (mutex)
    this.isSending = true

    // clear latest response
    this.latestResponse = undefined

    // send data
    this.port.write(buffer)

    // return undefined if waiting is not necessary
    if (waitForResponse === false) {
      this.isSending = false
      return undefined
    }

    // wait (asynchronously) for response; TODO: determine appropriate interval
    for (let ms = 10; ms < 510; ms += 10) {
      if (this.latestResponse !== undefined) {
        this.isSending = false
        return this.latestResponse
      } else {
        await this.delay(10)
      }
    }

    // timeout occured
    this.isSending = false
    throw new Error('sending failed - response timeout (500ms)')
  }

  /**
   * Get a list of all available serial ports. Note that this function returns
   * all ports - it does not check whether a suitable transceiver module is
   * connected to the port!
   */
  static async getAvailableSerialPorts(): Promise<string[]> {
    const ports: string[] = []
    const portInfo = await SerialPort.list()
    portInfo.forEach((value) => {
      ports.push(value.path)
    })
    return ports
  }

  /**
   * Register a listener to be called when learning mode ended.
   * @param listener This function will be called whenever the learning mode
   * ended.
   */
  onStopLearning(listener: (stoppedManually: boolean) => void): void {
    this.emitter.on('stopLearning', listener)
  }

  /** The serial port to which the transceiver is connected. */
  private port: SerialPort

  /** The parser used to parse incoming serial data. */
  private parser: typeof InterByteTimeout // TODO: check type

  /**
   * The emitter is used to notify received data. Possible events:
   * - "ESP3Packet": Received an ESP3Packet
   * - "ERP1Telegram": Received an ERP1 telegram
   */
  private emitter: EventEmitter = new EventEmitter()

  /** Internal storage for latest response telegram. */
  private latestResponse: ResponseTelegram | undefined = undefined

  /** Mutex to prevent simultaneous sending. */
  private isSending = false

  /** Internal storage to determine if learning mode is active. */
  private _learning = false
}

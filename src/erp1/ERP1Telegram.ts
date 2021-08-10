// Project: enocean-core
// File: ERP1Telegram.ts
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

import { ESP3Packet } from '../esp3/ESP3Packet'
import { DeviceId } from '../device/DeviceId'
import { ESP3PacketTypes } from '../esp3/ESP3PacketTypes'
import { RORGs } from './RORGs'

/**
 * The ERP1Telegram is one of the central telegram structures. It encompasses e.g. the four data telegrams (RPS, 1BS, 4BS, VLD) and also the Universal Teach-In (UTE) telegrams.
 */
export class ERP1Telegram {
  /** The telegram's RORG (= its type). */
  rorg: RORGs = RORGs.RPS

  /** The sender of the telegram. */
  sender: DeviceId = DeviceId.gatewaySelectsSender

  /** The destination of the telegram. */
  destination: DeviceId = DeviceId.broadcast

  /** The user data of the telegram. */
  userData: Buffer

  /** Telegram control bits, according to ESP3 specification used in case of repeating, switch telegram encapsulation, checksum type identification */
  status = 0

  /** Number of subtelegrams (send: 3 / receive: 0). */
  subTelNum = 3

  /**
   * The signal strength.
   * - Send case: 0xFF.
   * - Receive case: best RSSI value of all received subtelegrams (value decimal without minus; unit: dBm).
   */
  signalStrength = 0xff

  /**
   * The packet's security level.
   * - Send case: will be ignored (security is selected by link table entries).
   * - Receive case:
   *   - 0 = telegram not processed
   *   - 1 = obsolete (old security concept)
   *   - 2 = telegram decrypted
   */
  securityLevel = 0

  /**
   * Encapsulate the ERP1 Telegram in an ESP3Packet.
   */
  toESP3Packet(): ESP3Packet {
    // first byte of data is rorg ...
    const data = Buffer.alloc(6 + this.userData.length)
    data.writeUIntBE(this.rorg, 0, 1)

    // ... followed by user data ...
    this.userData.copy(data, 1)

    // ... and finally by sender id and status
    const senderOffset = 1 + this.userData.length
    data.writeUIntBE(this.sender.toNumber(), senderOffset, 4)
    data.writeUInt8(this.status, senderOffset + 4)

    // optional data is fixed
    const optionalData = Buffer.alloc(7)
    optionalData.writeUIntBE(this.subTelNum, 0, 1)
    optionalData.writeUIntBE(this.destination.toNumber(), 1, 4)
    optionalData.writeUIntBE(this.signalStrength, 5, 1)
    optionalData.writeUIntBE(this.securityLevel, 6, 1)

    return new ESP3Packet(ESP3PacketTypes.RadioERP1, data, optionalData)
  }

  /**
   * Set all telegram properties by parsing the data in the provided ESP3 packet. Throws an error if the provided packet does not contain a valid ERP1 telegram. This happens if
   *
   * - the packet type is wrong,
   * - the packet's optional data size is not equal to seven (7) bytes, or
   * - the packet's data size is too small (minimal content is six (6) bytes containing the rorg byte, four bytes with the sender id, and the status byte).
   *
   * @param packet The ESP3Packet to be interpreted as ERP1 telegram.
   */
  fromESP3Packet(packet: ESP3Packet): void {
    if (packet.packetType !== ESP3PacketTypes.RadioERP1) {
      throw new Error('ESP3Packet is not an ERP1 telegram')
    }

    if (packet.optionalData.length !== 7) {
      // must contain subTelNum (1 byte), destination (4 bytes), signal strength (1 byte), security level (1 byte)
      throw new Error(
        'ESP3Packet is not a valid ERP1 Telegram; optional data is wrong',
      )
    }

    if (packet.data.length < 6) {
      // must contain at least rorg (1 byte), sender id (4 bytes) and status (1 byte)
      throw new Error(
        'ESP3Packet is not a valid ERP1 Telegram; not enough data',
      )
    }

    // first byte of data is rorg ...
    this.rorg = packet.data.readUIntBE(0, 1)

    // ... followed by user data ...
    const senderOffset = packet.data.length - 5
    this.userData = packet.data.slice(1, senderOffset)

    // ... followed by sender id and status
    this.sender = DeviceId.fromNumber(packet.data.readUIntBE(senderOffset, 4))
    this.status = packet.data.readUInt8(senderOffset + 4)

    // decode optional data (fixed 7 bytes)
    this.subTelNum = packet.optionalData.readUIntBE(0, 1)
    this.destination = DeviceId.fromNumber(packet.optionalData.readUIntBE(1, 4))
    this.signalStrength = packet.optionalData.readUIntBE(5, 1)
    this.securityLevel = packet.optionalData.readUIntBE(6, 1)
  }

  /**
   * Create new telegram by parsing the data in the provided ESP3 packet. Throws an error if the provided packet does not contain a valid ERP1 telegram. This happens if
   *
   * - the packet type is wrong,
   * - the packet's optional data size is not equal to seven (7) bytes, or
   * - the packet's data size is too small (minimal content is six (6) bytes containing the rorg byte, four bytes with the sender id, and the status byte).
   *
   * @param packet The ESP3Packet to be interpreted as ERP1 telegram.
   */
  static fromESP3Packet(packet: ESP3Packet): ERP1Telegram {
    const telegram = new ERP1Telegram()
    telegram.fromESP3Packet(packet)
    return telegram
  }

  static fromBuffer(buffer: Buffer): ERP1Telegram {
    const packet = ESP3Packet.fromBuffer(buffer)
    return this.fromESP3Packet(packet)
  }

  static fromHexString(string: string): ERP1Telegram {
    const buffer = Buffer.from(string, 'hex')
    return this.fromBuffer(buffer)
  }

  /** Constructs a new telegram with empty user data.  */
  constructor(
    options: { rorg: number; userDataSize?: number } = {
      rorg: RORGs.RPS,
      userDataSize: 1,
    },
  ) {
    this.rorg = options.rorg

    switch (this.rorg) {
      case (RORGs.ONEBS, RORGs.RPS):
        this.userData = Buffer.alloc(1)
        break

      case RORGs.FOURBS:
        this.userData = Buffer.alloc(4)
        break

      default:
        this.userData = Buffer.alloc(
          options.userDataSize ? options.userDataSize : 0,
        )
    }
  }

  /**
   * Converts the telegram to a (multiline) string to be used as output for
   * debugging.
   *
   * Example output:
   * ```
   * ERP1Telegram {
   *   rorg / type:   RPS (F6)
   *   sender:        00:35:95:A8
   *   destination:   <broadcast>
   *   sig. strength: -45 dBm
   *   security lvl.: 0
   *   status:        32
   *   user data:     00
   * }
   * ```
   */
  toString(): string {
    let msg = 'ERP1Telegram {' + '\n'
    ;(msg +=
      '  rorg / type:   ' +
      RORGs[this.rorg] +
      ' (' +
      this.rorg.toString(16).toUpperCase() +
      ')'),
      +'\n'
    msg += '  sender:        ' + this.sender.toString() + '\n'
    msg += '  destination:   ' + this.destination.toString() + '\n'
    msg += '  sig. strength: '
    if (this.signalStrength === 0xff) {
      msg += '<max>\n'
    } else {
      msg += '-' + this.signalStrength + ' dBm\n'
    }

    msg += '  security lvl.: ' + this.securityLevel + '\n'
    msg += '  status:        ' + this.status + '\n'
    msg += '  user data:     ' + this.userData.toString('hex') + '\n'
    msg += '}'
    return msg
  }

  toBuffer(): Buffer {
    return this.toESP3Packet().toBuffer()
  }

  /**
   * Converts the telegram to a hex string (corresponding to the esp3 packet.)
   * @returns A string.
   */
  toHexString(): string {
    return this.toBuffer().toString('hex')
  }

  /**
   * Convenience wrapper to get the byte with the supplied ID.
   * @param byteId The byte's ID as given in the EnOcean documentation (e.g. 6 for "DB_6", also written as "DB6")
   * @returns The byte's value interpreted with least significant bit first (LSB0).
   */
  getDB(byteId: number): number {
    if (!Number.isInteger(byteId)) {
      throw new Error('byteId must be an integer')
    }

    if (byteId < 0) {
      throw new Error('byteId must be non-negative')
    }

    // determine the size of the user data
    const maxId = this.userData.length - 1
    if (byteId > maxId) {
      throw new Error('byteId must be less than or equal to ' + maxId)
    }

    return this.userData.readUInt8(maxId - byteId)
  }

  /**
   * Convenience wrapper to set the byte with the supplied ID.
   * @param byteId The byte's ID as given in the EnOcean documentation (e.g. 6 for "DB_6", also written as "DB6")
   * @param value The value to be written.
   */
  setDB(byteId: number, value: number): void {
    if (!Number.isInteger(byteId)) {
      throw new Error('byteId must be an integer')
    }

    if (byteId < 0) {
      throw new Error('byteId must be non-negative')
    }

    // determine the maxId of the user data
    const maxId = this.userData.length - 1
    if (byteId > maxId) {
      throw new Error('byteId must be less than or equal to ' + maxId)
    }

    this.userData.writeUInt8(value, maxId - byteId)
  }
}

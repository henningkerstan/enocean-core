// Project: enocean-core
// File: UTEMessage.ts
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

import { DeviceId } from '../device/DeviceId'
import { ERP1Telegram } from '../erp1/ERP1Telegram'
import { Byte } from '@henningkerstan/byte'
import { Manufacturers } from '../device/Manufacturers'
import { EEPId } from '../eep/EEPId'
import { RORGs } from '../erp1/RORGs'
import { UTEResponseRequestType } from './UTEResponseRequestType'
import { UTEQueryRequestType } from './UTEQueryRequestType'

/**
 * @internal
 * A universal teach-in (UTE) message.
 */
export class UTEMessage {
  /** Determines if this message is a response (there are two types of UTE messages: queries and responses). */
  public isResponse = false

  /** Determines if this message is a query (there are two types of UTE messages: queries and responses). */
  public get isQuery(): boolean {
    return !this.isResponse
  }
  public set isQuery(value: boolean) {
    this.isResponse = !value
  }

  /** The number of channels. */
  public channels = 0

  /** The manufacturerId (see {@link Manufacturers} for a list of IDs) */
  public manufacturerId = 0

  /** The equipment profile of the device. */
  public eep: EEPId = EEPId.fromTriple(0, 0, 0)

  /** Determines if communication is bidirectional or unidirectional. */
  public bidirectional = false

  /** Determines if a response is expected. */
  public responseExpected = false

  /** Determines the type of the request. */
  public requestType = 0

  /** Convert UTE message to an ERP1 telegram using supplied sender and destination.
   * @param sender The sender's EnOcean ID.
   * @param destination The destination's EnOcean ID.
   */
  toERP1Telegram(
    sender: DeviceId,
    destination: DeviceId = DeviceId.broadcast,
  ): ERP1Telegram {
    const buffer = Buffer.alloc(7)

    // construct DB_6 (this is too complicated if cmd is only 0 or 1)
    const db6 = Byte.allZero()
    const cmd = this.isResponse ? 1 : 0
    const cmdByte = Byte.fromUInt8LSB(cmd)
    db6.setBit(0, cmdByte.getBit(0))
    db6.setBit(1, cmdByte.getBit(1))
    db6.setBit(2, cmdByte.getBit(2))
    db6.setBit(3, cmdByte.getBit(3))

    const requestTypeByte = Byte.fromUInt8LSB(this.requestType)
    db6.setBit(4, requestTypeByte.getBit(0))
    db6.setBit(5, requestTypeByte.getBit(1))

    db6.setBit(6, this.responseExpected ? 0 : 1) // responseExpected = 0
    db6.setBit(7, this.bidirectional ? 1 : 0)

    buffer.writeUInt8(db6.readUIntLSB(), 0)

    // DB_5 is the channel number
    buffer.writeUInt8(this.channels, 1)

    // // DB_4 and DB_3 contain the manufacturerId;  TODO: check if calc is right!
    buffer.writeUInt8(this.manufacturerId & 0xff, 2)
    buffer.writeUInt8(this.manufacturerId >> 8, 3)

    // DB_2 ... DB_0
    buffer.writeUInt8(this.eep.type, 4) // DB_2
    buffer.writeUInt8(this.eep.func, 5) // DB_1
    buffer.writeUInt8(this.eep.rorg, 6) // DB_0

    const telegram = new ERP1Telegram()
    telegram.rorg = RORGs.UTE
    telegram.sender = sender
    telegram.destination = destination
    telegram.userData = buffer

    return telegram
  }

  static fromERP1Telegram(telegram: ERP1Telegram): UTEMessage {
    if (telegram.rorg !== RORGs.UTE) {
      throw new Error('ERP1 telegram is not a UTE telegram')
    }

    if (telegram.userData.length !== 7) {
      console.log(telegram.userData.length)
      console.log(telegram)
      throw new Error(
        'ERP1 telegram is not a valid UTE telegram; wrong size - must be 7 bytes',
      )
    }

    const ute = new UTEMessage()

    // DB_6 contains several parameters
    const db6 = Byte.fromUInt8LSB(telegram.getDB(6))

    // bits 0 thru 3 are the command
    ute.isResponse = db6.readUIntLSB(0, 4) > 0 ? true : false

    // bits 4 and 5 determine the request type
    ute.requestType = db6.readUIntLSB(4, 1)

    ute.responseExpected = db6.getBit(6) === 0 ? true : false

    ute.bidirectional = db6.getBit(7) === 1 ? true : false

    // DB_5 is the channel number
    ute.channels = telegram.getDB(5)

    // DB_4 and DB_3 contain the manufacturerId;  TODO: check if calc is right!
    const manufacturerIdLSB = Byte.fromUInt8LSB(telegram.userData.readUInt8(2))
    //console.log('manuf. lsb: ' + manufacturerIdLSB)
    const manufacturerIdMSB = Byte.allZero()
    //console.log('manuf. msb: ' + manufacturerIdMSB)
    ute.manufacturerId = manufacturerIdLSB.readUIntLSB()
    ute.manufacturerId += manufacturerIdMSB.getBit(0) << 8
    ute.manufacturerId += manufacturerIdMSB.getBit(1) << 9
    ute.manufacturerId += manufacturerIdMSB.getBit(2) << 10

    // DB_2 ... DB_0
    ute.eep = EEPId.fromTriple(
      telegram.getDB(0),
      telegram.getDB(1),
      telegram.getDB(2),
    )

    return ute
  }

  get manufacturerName(): string {
    return Manufacturers[this.manufacturerId]
  }

  toString(): string {
    let msg = 'UTEMessage {' + '\n'
    msg +=
      '  type:              ' +
      (this.isResponse ? 'teach-in response' : 'teach-in query') +
      '\n'

    if (this.isQuery) {
      msg +=
        '  request type:      ' + UTEQueryRequestType[this.requestType] + '\n'
      msg +=
        '  response expected: ' + (this.responseExpected ? 'yes' : 'no') + '\n'
    } else {
      msg +=
        '  request type:      ' +
        UTEResponseRequestType[this.requestType] +
        '\n'
    }

    msg += '  eep:               ' + this.eep.toString() + '\n'
    msg += '  channels:          ' + this.channels + '\n'

    msg +=
      '  communication:     ' +
      (this.bidirectional ? 'bidirectional' : 'unidirectional') +
      '\n'
    msg +=
      '  manufacturer:      ' +
      Manufacturers[this.manufacturerId] +
      ' (    ' +
      this.manufacturerId +
      ')    ' +
      '\n'
    msg += '}'
    return msg
  }
}

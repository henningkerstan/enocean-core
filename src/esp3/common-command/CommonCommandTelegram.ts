// Project: enocean-core
// File: CommonCommandTelegram.ts
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

import { ESP3PacketTypes } from '../ESP3PacketTypes'
import { ESP3Packet } from '../ESP3Packet'
import { CommonCommandCode } from './CommonCommandCode'

/** @internal */
export class CommonCommandTelegram {
  // TODO : FINISH THIS CLASS - NOT YET IMPLEMENTED / TESTED
  readonly commonCommandCode: CommonCommandCode
  readonly commonCommandData: Buffer
  readonly optionalData: Buffer

  constructor(
    commonCommandCode: CommonCommandCode,
    commonCommandData?: Buffer,
    optionalData?: Buffer,
  ) {
    this.commonCommandCode = commonCommandCode
    this.commonCommandData = commonCommandData
    this.optionalData = optionalData

    if (this.optionalData === undefined) {
      this.optionalData = Buffer.alloc(0)
    }
  }

  toESP3Packet(): ESP3Packet {
    const dataSize =
      this.commonCommandData === undefined
        ? 1
        : this.commonCommandData.length + 1
    const data = Buffer.alloc(dataSize)
    data.writeUIntBE(this.commonCommandCode, 0, 1)

    if (this.commonCommandData !== undefined) {
      this.commonCommandData.copy(data, 1)
    }

    return new ESP3Packet(
      ESP3PacketTypes.CommonCommand,
      data,
      this.optionalData,
    )
  }

  static fromESP3Packet(packet: ESP3Packet): CommonCommandTelegram {
    if (packet.packetType !== ESP3PacketTypes.CommonCommand) {
      throw new Error('ESP3Packet is not a commond command telegram')
    }

    if (packet.optionalData.length > 0) {
      throw new Error(
        'ESP3Packet is not a valid common command; optional data is present',
      )
    }

    if (packet.data.length < 1) {
      throw new Error('ESP3Packet is not a valid response; no data')
    }

    const returnCode = packet.data.readUIntBE(0, 1)
    const commonCommandData = packet.data.slice(1)

    return new CommonCommandTelegram(returnCode, commonCommandData)
  }
}

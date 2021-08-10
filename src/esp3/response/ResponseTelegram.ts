// Project: enocean-core
// File: ResponseTelegram.ts
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
import { ResponseReturnCode } from './ResponseReturnCode'

/**
 * @internal
 * A response is a special form of telegram usually sent by an EnOcean module to the host.
 * 
 * The cases are defined in ENOCEAN SERIAL PROTOCOL (ESP3) - SPECIFICATION, Section 1.9:

  > Case 1 : ESP3 packets of the type RADIO_ERP1, RADIO_SUB_TEL or REMOTE_MAN are bidirectional, that is, after sending a packet (host -> module) it is mandatory to wait for the RESPONSE message, to confirm the telegram has been processed and will subsequently be transmitted.
  After receiving (module -> host) a packet no RESPONSE is required (see RADIO_ERP1 no. <3> and <4>).

  > Case 2 : Only a host sends a ESP3 COMMAND (COMMON, SMART ACK) to an EnOcean module. Each REQUEST is answered with a RESPONSE message (OK, error, etc.). The reverse direction module-to-host is not possible.

  > Case 3 : Only an EnOcean module sends an EVENT to a host.The type of the EVENT defines whether a RESPONSE message is required or not.
 */
export class ResponseTelegram {
  /** Determines the type of the response. Refer to {@link ResponseReturnCode} for the possible return codes. */
  returnCode: ResponseReturnCode

  /** Depending on the type of the response it can include data. */
  responseData: Buffer

  /** Depending on the type of the response it can include optional data. */
  optionalData: Buffer

  /**
   * Construct a new telegram, either with supplied data or defaults.
   * @param returnCode The return code, default is 0 ("ok").
   * @param responseData Data of the response, default is an empty buffer.
   * @param optionalData Optional data of the response, default is an empty buffer.
   */
  constructor(
    returnCode: ResponseReturnCode = ResponseReturnCode.Ok,
    responseData: Buffer = Buffer.alloc(0),
    optionalData: Buffer = Buffer.alloc(0),
  ) {
    this.returnCode = returnCode
    this.responseData = responseData
    this.optionalData = optionalData
  }

  /** Interprets the supplied ESP3 packet as version response telegram. */
  static fromESP3Packet(packet: ESP3Packet): ResponseTelegram {
    if (packet.packetType !== ESP3PacketTypes.Response) {
      throw new Error('ESP3Packet is not a response telegram')
    }

    // if(packet.optionalData.length > 0){ e.g. baseID response to RD_ID_BASE has optional data!
    //   throw new Error('ESP3Packet is not a valid response; optional data is present')
    // }

    if (packet.data.length < 1) {
      throw new Error('ESP3Packet is not a valid response; no data')
    }

    const returnCode = packet.data.readUIntBE(0, 1)
    const responseData = packet.data.slice(1)

    return new ResponseTelegram(returnCode, responseData, packet.optionalData)
  }

  get responseReturnString(): string {
    switch (this.returnCode) {
      case 0:
        return 'ok (RET_OK)'

      case 1:
        return 'an error occured (RET_ERROR)'

      case 2:
        return 'not supported (RET_NOT_SUPPORTED)'

      case 3:
        return 'wrong parameter (RET_WRONG_PARAM)'

      case 4:
        return 'operation denied (RET_OPERATION_DENIED)'

      case 5:
        return 'duty cycle lock (RET_LOCK_SET)'

      case 6:
        return 'internal ESP3 buffer of devices is too small to handle this telegram (RET_BUFFER_TO_SMALL)'

      case 7:
        return 'currently all internal buffers are used (RET_NO_FREE_BUFFER)'

      default:
        return 'unknown code ' + this.returnCode
    }
  }
}

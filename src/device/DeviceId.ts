// Project: enocean-core
// File: DeviceId.ts
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

/**
 * EnOcean uses four byte (32 bit) addresses to identify devices. This class
 * implements these addresses.
 *
 * ## Allowed adresses for sending
 * Each EnOcean device has a unique ID (called *chip ID*) which it can use
 * for sending telegrams. Alternatively, EnOcean gateways can also use a range
 * of 128 consecutive addresses for sending, starting at the so-called
 * _base ID_ of the gateway. A gateway's *base ID* is a four byte address in
 * the range FF:80:00:00 to FF:FF:FF:80. The base ID is a predefined address,
 * which can be changed by the user only a few times (at most 10 times for the
 * TCM310 chip). The allowed addresses for sending a telegram are thus the
 * following 129 addresses:
 *
 * - chip ID (= device ID),
 * - base ID,
 * - base ID + 1,
 * - base ID + 2,
 * - ...
 * - base ID + 126, and
 * - base ID + 127.
 *
 * All other addresses must not be used for sending (and will be rejected by
 * official EnOcean modules). This is meant as a basic security feature. Have a
 * look at the EnOcean [knowledge base](https://www.enocean.com/en/support/knowledge-base/knowledge-base-doku/enoceansystemspecification:issue:what_is_a_base_id/) for the official explanation of the differences between chip ID and base IDs.
 *
 * ## Relative IDs
 * Relative IDs are placeholders for one of the allowed sending addresses. They
 * can be used to implement something like "when sending this telegram, use the
 * sender's chip id" or "when sending this telegram, use the sender's base id +
 * 17". Thus they do not correspond to an actual address but are relative to
 * the sender's chip ID/base ID. Prior to sending the telegram (or to
 * converting it to an ESP3 packet), it must be transformed to the actual four
 * byte address.
 *
 */
export class DeviceId {
  /**
   * Construct a DeviceId from the supplied number.
   * @param id An integer to be interpreted as DeviceId. Valid range 0-4294967295 (=0xFFFFFFFF). Note that 0 (=0x00000000) has a special meaning if used as sender address: it will be replaced by the gateway with a valid address.
   */
  static fromNumber(id: number): DeviceId {
    if (!Number.isInteger(id)) {
      throw new Error('ID is not an integer')
    }

    if (id < 0) {
      throw new Error('ID out of bounds (must be at least 0).')
    }

    if (id > 0xffffffff) {
      throw new Error(
        'ID out of bounds (must be smaller than 0xFFFFFFFF = 4294967295).'
      )
    }

    return new DeviceId(id)
  }

  /**
   * Construct a DeviceId. Interprets the supplied string as id. Currently only
   * one format is allowed: "X:X:X:X" with each X being one or two hexadecimal
   * digits.
   * @param idString
   */
  static fromString(idString: string): DeviceId {
    if (!idString) {
      throw new Error('fromString called with undefined argument')
    }
    idString = idString.trim()

    const parts: string[] = idString.split(':')

    if (parts.length !== 4) {
      throw new Error('Wrong format.')
    }

    let hexString = '0x'
    for (let i = 0; i < 4; i++) {
      if (parts[i].length > 2) {
        throw new Error('Wrong format.')
      }

      hexString += parts[i].padStart(2, '0')
    }

    return this.fromNumber(Number(hexString))
  }

  /** Shortcut for the broadcast address FF:FF:FF:FF. */
  static get broadcast(): DeviceId {
    return new DeviceId(0xffffffff)
  }

  /** Adress used to indicate that the sending gateway shall select the appropriate sender id. */
  static get gatewaySelectsSender(): DeviceId {
    return new DeviceId(0)
  }

  /**
   * Interprets the four bytes as number using big-endian ordering.
   */
  toNumber(): number {
    return this._id
  }

  /**
   * A string representation of the EnOcean ID. IDs are represented as
   * string of the form `XX:XX:XX:XX` with colons separating the four bytes in
   * big-endian ordering. Each of the bytes is given as 2-digit upper case
   * hexadecimal string.
   */
  toString(): string {
    const s = this._id.toString(16).padStart(8, '0').toUpperCase()
    let idString = s.substr(0, 2) + ':'
    idString += s.substr(2, 2) + ':'
    idString += s.substr(4, 2) + ':'
    idString += s.substr(6, 2)
    return idString
  }

  /**
   * A string representation of the EnOcean ID. IDs are represented as
   * string of the form `XX:XX:XX:XX` with colons separating the four bytes in
   * big-endian ordering. Each of the bytes is given as 2-digit upper case
   * hexadecimal string.
   */
  toJSON(): string {
    return this.toString()
  }

  /**
   * Internally, an EnOcean ID is encoded as integer, where:
   * - any positive integer (range 1 to 4294967295) corresponds to the actual (absolute) EnOcean id (range 00:00:00:01 to FF:FF:FF:FF),
   * - the number zero (0) will not be interpreted as id 00:00:00:00 but as placeholder value; if this id is used as sender, it will be replaced by the sending gateway's chip or one of its base ids.
   */
  private _id: number

  private constructor(id: number) {
    this._id = id
  }
}

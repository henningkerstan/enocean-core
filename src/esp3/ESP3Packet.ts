// Project: enocean-core
// File: ESP3Packet.ts
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

import { ESP3PacketTypes } from './ESP3PacketTypes'

/**
 * The *EnOcean Serial Protocol 3 (ESP3)* uses the *ESP3 packet* as main (outer) data structure. This class implements this data structure as a wrapper from/to a buffer (containing the serialization received/to be sent a serial port).
 *
 * An ESP3 packet consists of three major parts:
 *
 * - a header (only partly accessible in this class, see below for an explanation),
 * - a data part, and
 * - an optional data part.
 *
 * The header and the two data part's integrity is safeguarded by an 8-bit cyclic redundancy check (CRC8).
 *
 * The byte-wise representation of the ESP3 packet structure is given in the following table.
 *
 * Offset | Byte(s) | Content
 * ------|---|---
 * 0     | 1 | sync byte (= 0x55)
 * 1     | 2 | header: length (x) in bytes of subsequent data
 * 3     | 1 | header: length (y) in bytes of subsequent optional data
 * 4     | 1 | header: packet type
 * 5     | 1 | CRC8 of header (i.e. of preceeding four bytes)
 * 6     | x | data
 * 6+x   | y | optional data
 * 6+x+y | 1 | CRC8 of data and optional data (i.e. of preceeding x+y bytes)
 *
 * Note that the (internal) byte order is big-endian; this needs to be taken into account to decode/encode multibyte fields like e.g. the two byte field *length (x) of subsequent data* mentioned in the table above.
 *
 * This class only stores the truly variable parts of this data structure, i.e. it only stores
 * - header: packet type,
 * - data, and
 * - optional data.
 *
 * All other data is either fixed (sync byte) or can (and will) be computed from these values on demand. This happens when constructing this class from a buffer or when transforming the class to a buffer.
 *
 */
export class ESP3Packet {
  /* eslint-disable */
  /** This table is used internally to compute the CRC8 checksum. */
  private static readonly u8CRC8Table: Uint8Array = new Uint8Array([
    0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31,
    0x24, 0x23, 0x2a, 0x2d, 0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65,
    0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d, 0xe0, 0xe7, 0xee, 0xe9,
    0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd,
    0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1,
    0xb4, 0xb3, 0xba, 0xbd, 0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2,
    0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 0xb7, 0xb0, 0xb9, 0xbe,
    0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a,
    0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16,
    0x03, 0x04, 0x0d, 0x0a, 0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42,
    0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a, 0x89, 0x8e, 0x87, 0x80,
    0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4,
    0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8,
    0xdd, 0xda, 0xd3, 0xd4, 0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c,
    0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 0x19, 0x1e, 0x17, 0x10,
    0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34,
    0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f,
    0x6a, 0x6d, 0x64, 0x63, 0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b,
    0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13, 0xae, 0xa9, 0xa0, 0xa7,
    0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83,
    0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef,
    0xfa, 0xfd, 0xf4, 0xf3,
  ])
  /* eslint-enable */

  /**
   * Compute the ESP3 packet's CRC8.
   * @param u8Data The data for which the CRC8 shall be computed.
   */
  private static calculateCRC8(u8Data: Buffer): number {
    let u8CRC = 0
    for (let i = 0; i < u8Data.length; i++) {
      u8CRC = this.u8CRC8Table[u8CRC ^ u8Data.readUIntBE(i, 1)]
    }
    return u8CRC
  }

  /** The data part of the packet as Node.js [Buffer](https://nodejs.org/api/buffer.html). */
  readonly data: Buffer

  /** The optional data part of the packet as Node.js [Buffer](https://nodejs.org/api/buffer.html). */
  readonly optionalData: Buffer

  /** The packet's type (see {@link ESP3PacketTypes} for a list of supported types.) */
  readonly packetType: ESP3PacketTypes = ESP3PacketTypes.RadioERP1

  /**
   * Construct an ESP3 packet from the minimally required data.
   * @param data The data as Node.js [Buffer](https://nodejs.org/api/buffer.html).
   * @param optionalData The optional data as Node.js [Buffer](https://nodejs.org/api/buffer.html).
   * @param packetType The packet type.
   */
  public constructor(
    packetType: ESP3PacketTypes,
    data: Buffer,
    optionalData: Buffer
  ) {
    this.packetType = packetType
    this.data = data
    this.optionalData = optionalData
  }

  /**
   * Convert data to a Node.js buffer. Automatically adds all required parts
   * (sync byte and checksums).
   */
  toBuffer(): Buffer {
    // determine buffer size:
    // 1 sync byte + 4 header bytes + 1 header crc8 + 1 data crc8 (=7 bytes)
    // + x data bytes
    // + y optional bytes
    let size = 7
    size += this.data.length
    size += this.optionalData.length
    const buffer = Buffer.alloc(size)

    // write sync byte
    buffer.writeUIntBE(0x55, 0, 1)

    // construct + write header
    buffer.writeUIntBE(this.data.length, 1, 2)
    buffer.writeUIntBE(this.optionalData.length, 3, 1)
    buffer.writeUIntBE(this.packetType, 4, 1)
    const header = buffer.slice(1, 5)
    const crc8h = ESP3Packet.calculateCRC8(header)
    buffer.writeUIntBE(crc8h, 5, 1)

    // write data incl. checksum
    this.data.copy(buffer, 6)
    const optOffset = 6 + this.data.length
    this.optionalData.copy(buffer, optOffset)
    const allData = buffer.slice(6, optOffset + this.optionalData.length)
    const crc8d = ESP3Packet.calculateCRC8(allData)
    buffer.writeUIntBE(crc8d, optOffset + this.optionalData.length, 1)

    return buffer
  }

  /**
   * Interpret the supplied buffer as an ESP3 packet.
   *
   * This will fail and throw an error if:
   *
   * - the buffer is too short (< 8 bytes),
   * - the first byte is not the sync byte (0x55),
   * - the header checksum is wrong,
   * - the buffer is too small to contain the data and optional data specified in the header, or
   * - the data checksum is wrong.
   */
  static fromBuffer(buffer: Buffer): ESP3Packet {
    // constructs a telegram from buffer content, if possible
    if (buffer.length < 8) {
      throw new Error(
        'Buffer does not contain valid ESP3Packet; not enough data'
      )
    }

    // read and verify sync byte
    const syncByte = buffer.readUIntBE(0, 1)
    if (syncByte !== 0x55) {
      throw new Error(
        'Buffer does not contain valid ESP3Packet; wrong sync byte (!= 0x55)'
      )
    }

    // read header data
    const dataLength = buffer.readUIntBE(1, 2)
    const optionalLength = buffer.readUIntBE(3, 1)
    const packetType = buffer.readUIntBE(4, 1)

    // read and verify header checksum
    const header = buffer.slice(1, 5)
    const calculatedCRC8H = ESP3Packet.calculateCRC8(header)
    const receivedCRC8H = buffer.readUIntBE(5, 1)
    if (calculatedCRC8H !== receivedCRC8H) {
      throw new Error(
        'Buffer does not contain valid ESP3Packet; CRC8H (header checksum) mismatch'
      )
    }

    // verify packet is big enough
    const calculatedPacketSize = 6 + dataLength + optionalLength + 1
    if (buffer.length < calculatedPacketSize) {
      const msg =
        'Buffer does not contain valid ESP3Packet; size mismatch (calc: ' +
        calculatedPacketSize.toString() +
        ', actual: ' +
        buffer.length +
        ')'
      throw new Error(msg)
    }

    // read data
    const data = buffer.slice(6, 6 + dataLength)
    const optOffset = 6 + dataLength
    const optional = buffer.slice(optOffset, optOffset + optionalLength)

    // verify data checksum
    const allData = buffer.slice(6, optOffset + optionalLength)
    const calculatedCRC8D = ESP3Packet.calculateCRC8(allData)
    const receivedCRC8D = buffer.readUIntBE(optOffset + optionalLength, 1)
    if (calculatedCRC8D !== receivedCRC8D) {
      throw new Error(
        'Buffer does not contain valid ESP3Packet; CRC8D (data checksum) mismatch'
      )
    }

    return new ESP3Packet(packetType, data, optional)
  }

  /**
   * Returns a one-line string of the form "ESP3Packet (TYPE): DATA;OPTIONAL." where
   * - TYPE is the name of the packet type,
   * - DATA is a hexadecimal representation of the packet's data, and
   * - OPTIONAL is a hexadecimal representation of the packet's optional data.
   */
  toString(): string {
    let msg = 'ESP3Packet (' + ESP3PacketTypes[this.packetType] + '): '
    msg += this.data.toString('hex').toUpperCase() + ';'
    msg += this.optionalData.toString('hex').toUpperCase() + '.'
    return msg
  }

  // TODO
  toBase64(): string {
    return this.toBuffer().toString('base64')
  }
}

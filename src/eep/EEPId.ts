// Project: enocean-core
// File: EEPId.ts
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

import { RORGs } from '../erp1/RORGs'

/**
 * This class implements the organizational description of an EEP. As specified
 * in the official documents, it consists of
 * - the ERP radio telegram type (RORG, 8 bits),
 * - the basic functionality of the data content (FUNC, 6 bits), and
 * - the type of device in its individual characteristics (TYPE, 7 bits).
 */
export class EEPId {
  private _rorg = 0
  private _func = 0
  private _type = 0

  /**
   * Construct an EEP ID from the given parameters.
   * @param rorg The ERP radio telegram type (8 bits, valid range 0-255).
   * @param func The basic functionality of the data content (6 bits, valid
   * range 0-63)
   * @param type The type of device in its individual characteristics (7 bits,
   * valid range 0-127).
   */
  static fromTriple(rorg: number, func: number, type: number): EEPId {
    const eep = new EEPId()

    eep.rorg = rorg
    eep.func = func
    eep.type = type
    return eep
  }

  /**
   * Construct an EEP ID from a string.
   * @param eepString A string of the form 'RR-FF-TT' where
   * - RR represents a valid RORG (one or two hexadecimal digits),
   * - FF represents a valid FUNC (one or two hexadecimal digits), and
   * - TT represents a valid TYPE (one or two hexadecimal digits).
   */
  static fromString(eepString: string): EEPId {
    const parts = eepString.split('-')

    if (parts.length !== 3) {
      throw new Error('EEP string must have exactly two hyphens.')
    }

    const eep = new EEPId()
    eep.rorg = Number.parseInt(parts[0], 16)
    eep.func = Number.parseInt(parts[1], 16)
    eep.type = Number.parseInt(parts[2], 16)

    return eep
  }

  /** Get/set the ERP radio telegram type (8 bits, valid range: 0-255). */
  get rorg(): number {
    return this._rorg
  }

  set rorg(rorg: number) {
    if (!Number.isInteger(rorg)) {
      throw new Error('RORG must be an integer')
    }

    if (rorg < 0 || rorg > 255) {
      throw new Error('RORG out of range (must be an integer in [0, 255])')
    }

    this._rorg = rorg
  }

  /** Get/set the basic functionality of the data content (6 bits, valid range
   *  0-63). */
  get func(): number {
    return this._func
  }

  set func(func: number) {
    if (!Number.isInteger(func)) {
      throw new Error('FUNC must be an integer')
    }

    if (func < 0 || func > 0x3f) {
      throw new Error(
        'FUNC = ' +
          func.toString() +
          ' is out of range (must be an integer in [0, 0x3F])'
      )
    }

    this._func = func
  }

  /**
   * Get/set the type of device in its individual characteristics (7 bits,
   * valid range 0-127).
   */
  get type(): number {
    return this._type
  }

  set type(type: number) {
    if (!Number.isInteger(type)) {
      throw new Error('TYPE must be an integer')
    }

    if (type < 0 || type > 0x7f) {
      throw new Error('TYPE out of range (must be an integer in [0, 0x7F])')
    }

    this._type = type
  }

  /**
   * Convert to string representation.
   * @returns An eight character string of the form 'RR-FF-TT' where
   * - RR represents the RORG (two upper case hexadecimal digits),
   * - FF represents the FUNC (two upper case hexadecimal digits), and
   * - TT represents the TYPE (two upper case hexadecimal digits).
   */
  toString(): string {
    let s = this.rorg.toString(16).toUpperCase().padStart(2, '0') + '-'
    s += this.func.toString(16).toUpperCase().padStart(2, '0') + '-'
    s += this.type.toString(16).toUpperCase().padStart(2, '0')
    return s
  }

  /**
   * Convert to string representation.
   * @returns An eight character string of the form 'RR-FF-TT' where
   * - RR represents the RORG (two upper case hexadecimal digits),
   * - FF represents the FUNC (two upper case hexadecimal digits), and
   * - TT represents the TYPE (two upper case hexadecimal digits).
   */
  toJSON(): string {
    return this.toString()
  }

  // TODO: complete + make public
  private description(): string {
    let s = this.toString() + ': '

    switch (this.rorg) {
      case RORGs.RPS:
        s += this.descriptionRPS()
        break

      case RORGs.ONEBS:
        s += this.description1BS()
        break

      case RORGs.FOURBS:
        s += this.description4BS()
        break

      case RORGs.VLD:
        s += this.descriptionVLD()
        break

      default:
        s += 'Unknown RORG'
    }

    return s
  }

  private descriptionRPS(): string {
    switch (this.func) {
      case 2: // rocker switch, 2 rocker
        if (this.type === 1) {
          return 'Light and Blind Control - Application Style 1'
        }

        if (this.type === 2) {
          return 'Light and Blind Control - Application Style 2'
        }

        if (this.type === 3) {
          return 'Light Control - Application Style 1'
        }

        if (this.type === 4) {
          return 'Light and blind control ERP2'
        }

        return 'F6-02 Rocker Switch, 2 Rocker - type unknown'

      case 3: // rocker switch, 4 rocker
        return 'rocker switch, 4 rocker' // TODO
      case 4: // position switch, home and office application
        return 'position switch, home and office application' // TODO
      case 5: // detectors
        if (this.type === 1) {
          return 'Liquid Leakage Sensor (mechanic harvester)'
        }
        return 'F6-05 Detectors - TYPE unknown'

      case 10: // mechanical handle
        if (this.type === 0) {
          return 'Window Handle'
        }
        if (this.type === 1) {
          return 'Window Handle ERP2'
        }
        return 'F6-10 Mechanical Handle - type unknown'
      default:
        return 'FUNC unknown'
    }
  }

  private description1BS(): string {
    if (this.func === 0xd5 && this.type === 1) {
      return 'Single Input Contact'
    }
    return 'Unknown EEP (1BS Telegram)'
  }

  private description4BS(): string {
    // TODO: implement
    return '4BS description not available'
  }

  private descriptionVLD(): string {
    // todo: implement
    return 'VLD description not available'
  }

  private constructor() {
    // nothing to be done
  }
}

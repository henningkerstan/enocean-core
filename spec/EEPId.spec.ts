// Project: enocean-core
// File: EEPId.spec.ts
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

// class test for Byte class
import { EEPId } from '../src/eep/EEPId'

describe('An EEPId', () => {
  it('must accept any valid EEP and properly convert to/from string', () => {
    for (let i = 0; i <= 5000; i++) {
      const rorg = Math.round(Math.random() * 255)
      const func = Math.round(Math.random() * 0x3f)
      const type = Math.round(Math.random() * 0x7f)

      const eepId = EEPId.fromTriple(rorg, func, type)
      expect(eepId.rorg).toBe(rorg)
      expect(eepId.func).toBe(func)
      expect(eepId.type).toBe(type)

      const eepIdFromString = EEPId.fromString(eepId.toString())
      expect(eepIdFromString.rorg).toBe(rorg)
      expect(eepIdFromString.func).toBe(func)
      expect(eepIdFromString.type).toBe(type)
    }
  })

  it('must not accept negative rorg values', () => {
    const eepId = EEPId.fromTriple(0, 0, 0)
    expect(function () {
      eepId.rorg = -1
    }).toThrowError
  })

  it('must not accept rorg values > 255', () => {
    const eepId = EEPId.fromTriple(0, 0, 0)
    expect(function () {
      eepId.rorg = 256
    }).toThrowError
  })

  it('must not accept negative func values', () => {
    const eepId = EEPId.fromTriple(0, 0, 0)
    expect(function () {
      eepId.func = -1
    }).toThrowError
  })

  it('must not accept func values > 0x3f', () => {
    const eepId = EEPId.fromTriple(0, 0, 0)
    expect(function () {
      eepId.func = 0x3f + 1
    }).toThrowError
  })

  it('must not accept strings with less than two hyphens', () => {
    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const eepId = EEPId.fromString('A50102')
    }).toThrowError

    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const eepId = EEPId.fromString('A5-0102')
    }).toThrowError
  })

  it('must not accept strings with more than two hyphens', () => {
    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const eepId = EEPId.fromString('A5-01-02-')
    }).toThrowError
  })
})

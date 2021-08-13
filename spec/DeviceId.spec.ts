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
import { DeviceId } from '../src/device/DeviceId'

describe('A DeviceId', () => {
  it('must accept any number between 0 and 0xFFFFFFFF', () => {
    // randomly test some numbers
    for (let i = 0; i <= 5000; i++) {
      const id = Math.round(Math.random() * 0xffffffff)
      const devId = DeviceId.fromNumber(id)
      expect(devId.toNumber()).toBe(id)

      const devIdHexString = '0x' + devId.toString().split(':').join('')
      expect(Number(devIdHexString)).toBe(id)

      const devId2 = DeviceId.fromString(devId.toString())
      expect(devId2.toNumber()).toBe(id)
    }
  })

  it('must not accept negative numbers', () => {
    expect(function () {
      const devId = DeviceId.fromNumber(-1)
    }).toThrowError
  })

  it('must not accept numbers > 0xFFFFFFFF', () => {
    expect(function () {
      const devId = DeviceId.fromNumber(0xffffffff + 1)
    }).toThrowError
  })

  it('must not accept strings with less than three colons', () => {
    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const devId = DeviceId.fromString('0102:03:04')
    }).toThrowError

    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const devId = DeviceId.fromString('010203:04')
    }).toThrowError

    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const devId = DeviceId.fromString('01020304')
    }).toThrowError
  })

  it('must not accept strings with more than two colons', () => {
    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const devId = DeviceId.fromString(':01:02:03:04')
    }).toThrowError
  })

  it('must not accept colon separated strings whose parts do not contain valid hex', () => {
    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const devId = DeviceId.fromString('010:42:12:33')
    }).toThrowError

    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const devId = DeviceId.fromString('01:Z3:03:04')
    }).toThrowError
  })
})

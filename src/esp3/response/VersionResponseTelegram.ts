// Project: enocean-core
// File: VersionResponseTelegram.ts
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

import { ResponseTelegram } from './ResponseTelegram'
import { DeviceId } from '../../device/DeviceId'
import { ResponseReturnCode } from './ResponseReturnCode'
import { VersionIdentifier } from './VersionIdentifier'

/**
 * @internal
 * The version response telegram is a special form of the {@link ResponseTelegram} which is expected from the module following a CO_RD_VERSION {@link CommonCommandTelegram}.
 */

export class VersionResponseTelegram {
  appVersion: VersionIdentifier = new VersionIdentifier()
  apiVersion: VersionIdentifier = new VersionIdentifier()
  chipId: DeviceId = DeviceId.gatewaySelectsSender
  chipVersion = 0
  appDescription = ''

  static fromResponseTelegram(res: ResponseTelegram): VersionResponseTelegram {
    const vrt = new VersionResponseTelegram()

    if (res.returnCode !== ResponseReturnCode.Ok) {
      throw new Error('not a RET_OK response')
    }

    if (res.responseData === undefined) {
      throw new Error('no response data')
    }

    if (res.responseData.length < 32) {
      throw new Error('not enough response data')
    }

    vrt.appVersion.main = res.responseData.readUInt8(0)
    vrt.appVersion.beta = res.responseData.readUInt8(1)
    vrt.appVersion.alpha = res.responseData.readUInt8(2)
    vrt.appVersion.build = res.responseData.readUInt8(3)

    vrt.apiVersion.main = res.responseData.readUInt8(4)
    vrt.apiVersion.beta = res.responseData.readUInt8(5)
    vrt.apiVersion.alpha = res.responseData.readUInt8(6)
    vrt.apiVersion.build = res.responseData.readUInt8(7)

    vrt.chipId = DeviceId.fromNumber(res.responseData.readUIntBE(8, 4))
    vrt.chipVersion = res.responseData.readUIntBE(12, 4)

    // TODO: fix/improve the decoding of the app description
    vrt.appDescription = res.responseData.toString('utf8', 13, 32).trim()
    vrt.appDescription = vrt.appDescription.replace(/\0.*$/g, '')
    // vrt.appDescription = vrt.appDescription.replace('\u0001', '')
    // vrt.appDescription = vrt.appDescription.replace('\u0003', '')

    return vrt
  }
}

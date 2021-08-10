// Project: enocean-core
// File: DeviceInfo.ts
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

import { DeviceId } from './DeviceId'
import { EEPId } from '../eep/EEPId'
import { Manufacturers } from './Manufacturers'
import { TeachInMethods } from '../gateway/TeachInMethods'

/**
 * The EnOcean teach-in process collects some information on learned EnOcean devices that needs to be kept by the gateway. This class implements this basic information consisting of
 *
 * - the devices EnOcean id
 * - the teach-in method,
 * - the learned devices's EEP (note that this might have to be selected by the user during the teach-in process for simple RPS devices),
 * - the local (sender) id used for the teach-in process,
 * - the manufacturer id, and
 * - an (optional) label for the device.
 *
 * The local id is necessary if addressed sending (i.e. sending telegrams to a devices's unique id instead of broadcasting) is not supported by a device. In this case the gateway can select a suitable unique sender id (based on its base id) for the targetted device. [TODO: better explanation]
 *
 */
export class DeviceInfo {
  public deviceId: DeviceId = DeviceId.gatewaySelectsSender

  /** The EEP of the learned device. */
  public eep: EEPId

  /** The local (sender) id used during the teach-in process. */
  public localId: DeviceId = DeviceId.gatewaySelectsSender

  /** The manufacturer id supplied by the device during teach-in. */
  public manufacturer: Manufacturers = 0

  /** The teach-in method used. */
  public teachInMethod: TeachInMethods = TeachInMethods.Unknown

  public label = ''

  /** Convert the data structure into a human-readable string output to be used in console log messages. Its structure / presentation is always subject to change and should not be relied on for further processing! */
  toString(): string {
    let s = 'DeviceInfo {\n'
    s += '  ID:        ' + this.deviceId.toString() + '\n'
    s += '  label:     ' + this.label + '\n'
    s += '  eep:       ' + this.eep.toString() + '\n'
    s += '  local ID:  ' + this.localId.toString() + '\n'
    s += '  teach-in:  ' + TeachInMethods[this.teachInMethod] + '\n'
    s += '  manuf.  :  ' + Manufacturers[this.manufacturer] + '\n'
    s += '}'
    return s
  }
}

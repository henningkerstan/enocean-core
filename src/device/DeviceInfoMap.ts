// Project: enocean-core
// File: DeviceInfoMap.ts
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
import { DeviceInfo } from './DeviceInfo'

/**
 * Since EnOcean devices need to be taught-in, they must be stored along with
 * some basic meta data like (at least)
 * - their equipment profile (EEP) and
 * - the sender id which was used for the teach in.
 * This interface defines how to implement this minimal information as a result of a successful teach-in process. As the name suggests, it is intended to represent a map from an {@link DeviceId} to an {@link DeviceInfo}.
 */
export interface DeviceInfoMap {
  /**
   * Get the DeviceInfo associated to the device.
   * @param device The device id.
   * @returns The DeviceInfo associated with the device (if found) or *undefined* (if not found).
   */
  get(device: DeviceId): DeviceInfo | undefined

  /**
   * Add the info to the list of known devices.
   * @param info
   */
  set(info: DeviceInfo): void

  /**
   * Check if the device has an associated DeviceInfo.
   * @param device
   */
  has(device: DeviceId): boolean

  /**
   * Delete the device and its associated DeviceInfo from the mapping.
   * @param device
   */
  delete(device: DeviceId): boolean

  /**
   * Calls the provided callbackFn once for each key-value pair present in the DeviceInfoMap, in insertion order.
   * @param callbackFn
   */
  forEach(callbackFn: (info: DeviceInfo, device: DeviceId) => void): void

  /**
   * Clears the map, i.e. deletes all device infos.
   */
  clear(): void
}

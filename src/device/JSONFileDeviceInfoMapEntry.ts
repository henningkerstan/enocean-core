// Project: enocean-core
// File: JSONFileDeviceInfoMapEntry.ts
//
// Copyright 2021 Henning Kerstan
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

export interface JSONFileDeviceInfoMapEntry {
  deviceId: string
  /** The EEP of the learned device. */
  eep: string

  /** The local (sender) id used during the teach-in process. */
  localId: string

  /** The manufacturer id supplied by the device during teach-in. */
  manufacturer: number

  /** The teach-in method used. */
  teachInMethod: number

  label: string
}

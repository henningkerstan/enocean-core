// Project: enocean-core
// File: ERP1TelegramUnfamiliarityReasons.ts
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
 * Possible reasons why an ERP1 telegram might be classified as _unfamiliar_.
 */
export enum ERP1TelegramUnfamiliarityReasons {
  /** Telegram is a UTE message but parsing failed. */
  UTEParsingError = 1,

  /** Telegram is an EEP message but the device (and hence it's EEP) is unknown. */
  DeviceUnknown = 2,

  /** Telegram is an EEP message and the device is known but the current device information does not contain the device's EEP. */
  EEPUnknown = 3,

  /**
   * Telegram is an EEP message of a known device with known EEP but no parser
   * for this EEP is available.
   */
  EEPUnsupported = 4,

  /** Telegram is an EEP message of a known device with known EEP, a parser for that telegram is available but parsing failed. */
  EEPParsingError = 5,
}

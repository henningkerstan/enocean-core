// Project: enocean-core
// File: RORGs.ts
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
 * The different types of radio telegrams of the EnOcean Radio Protocol.
 */
export enum RORGs {
  /** Repeated switch communication */
  RPS = 0xf6,

  /** One byte communication (1BS) */
  ONEBS = 0xd5,

  /** Four byte communication (4BS) */
  FOURBS = 0xa5,

  /** Variable length data */
  VLD = 0xd2,

  /** Manufacturer specific communication */
  MSC = 0xd1,

  /** Addressing Destination Telegram */
  ADT = 0xa6,

  /** SMART ACK learn request */
  SmartAckLearnRequest = 0xc6,

  /** SMART ACK learn answer */
  SmartAckLearnAnswer = 0xc7,

  /** SMART ACK reclaim */
  SmartAckReclaim = 0xa7,

  /** Remote management */
  SysEx = 0xc5,

  /** Secure telegram */
  SEC = 0x30,

  /** Secure telegram with RORG encapsulation */
  SecEncaps = 0x31,

  /** Maintenance security message */
  SecMan = 0x34,

  /** Signal telegram */
  SIGNAL = 0xd0,

  /** Universal teach in */
  UTE = 0xd4,
}

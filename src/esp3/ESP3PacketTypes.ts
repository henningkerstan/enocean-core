// Project: enocean-core
// File: ESP3PacketType.ts
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
 * The packet types as defined in the EnOcean Serial Protocol 3 (ESP3).
 */
export enum ESP3PacketTypes {
  RadioERP1 = 1,
  Response = 2,
  RadioSubTel = 3,
  Event = 4,
  CommonCommand = 5,
  SmartAckCommand = 6,
  RadioMessage = 9,
  RadioERP2 = 10,
  ConfigCommand = 11,
  CommandAccepted = 12,
  Radio802155 = 16,
  Command24 = 17,
}

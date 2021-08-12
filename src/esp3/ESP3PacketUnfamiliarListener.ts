// Project: enocean-core
// File: UnknownESP3PacketCallback.ts
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

import { ESP3Packet } from '..'
import { ESP3PacketUnfamiliarityReasons } from './ESP3PacketUnfamiliarityReasons'

/**
 * Function to be called when a received ESP3 packet was classified as
 * _unfamiliar_. This is the case whenever further processing of the packet was
 * unsuccessful.
 */
export interface ESP3PacketUnfamiliarListener {
  /**
   * @param packet The ESP3 packet which could not be processed any further.
   * @param reason The reason why further processing was impossible.
   * @param error The error (optional). Only available when reason for unafmiliarity is an error (e.g. {@link ESP3PacketUnfamiliarityReasons.ERP1ParsingError}).
   */
  (
    packet: ESP3Packet,
    reason: ESP3PacketUnfamiliarityReasons,
    error?: Error
  ): void
}

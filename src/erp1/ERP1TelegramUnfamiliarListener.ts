// Project: enocean-core
// File: ERP1TelegramUnfamiliarListener.ts
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

import { ERP1Telegram } from './ERP1Telegram'
import { ERP1TelegramUnfamiliarityReasons } from './ERP1TelegramUnfamiliarityReasons'

/**
 * A function to be called when a received ERP1 telegram was classified as
 * _unfamiliar_. This is the case whenever further processing of the telegram
 * was unsuccessful.
 */
export interface ERP1TelegramUnfamiliarListener {
  /**
   * @param telegram The ERP1 telegram which could not be processed any further.
   * @param reason The reason why further processing was impossible.
   * @param error The error (optional). Only available when reason for unafmiliarity is an error (e.g. {@link ERP1TelegramUnfamiliarityReasons.UTEParsingError}).
   */
  (
    telegram: ERP1Telegram,
    reason: ERP1TelegramUnfamiliarityReasons,
    error?: Error,
  ): void
}

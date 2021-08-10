// Project: enocean-core
// File: EEPMessageListener.ts
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

import { ERP1Telegram } from '..'
import { EEPMessage } from './EEPMessage'

/**
 * Function to be called when an EEP message was received.
 */
export interface EEPMessageListener {
  /**
   * @param message The received EEP message.
   * @param telegram The received ERP1 telegram containing this message.
   */
  (message: EEPMessage, telegram: ERP1Telegram): void
}

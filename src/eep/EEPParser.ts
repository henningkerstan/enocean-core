// Project: enocean-core
// File: EEPParser.ts
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
 * A function which converts an ERP1 telegram to an EEP message by parsing the
 * telegram's user data.
 */
export interface EEPParser {
  /**
   * @param telegram The telegram to be parsed.
   * @returns The EEP message contained in the telegram.
   * @throws Must throw an error if the telegram cannot be parsed.
   */
  (telegram: ERP1Telegram): EEPMessage
}

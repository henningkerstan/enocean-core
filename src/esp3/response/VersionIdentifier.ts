// Project: enocean-core
// File: VersionIdentifier.ts
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
 * @internal
 * Class used to identify the versions of the application and the API of an
 * EnOcean chip.
 */
export class VersionIdentifier {
  main = 0
  beta = 0
  alpha = 0
  build = 0

  toString(): string {
    let msg = this.main.toString(10) + '.'
    msg += this.beta.toString(10) + '.'
    msg += this.alpha.toString(10) + '.'
    msg += this.build.toString(10)
    return msg
  }
}

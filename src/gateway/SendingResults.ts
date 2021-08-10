// Project: enocean-core
// File: SendingResults.ts
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

/** The results of a send operation. Superset of {@link ResponseReturnCode} (codes 0 to 7 are identical). */
export enum SendingResults {
  Success = 0,

  /** An error occured*/
  Error = 1,

  /** The functionality is not supported by that implementation.*/
  NotSupported = 2,

  /** There was a wrong parameter in the command. */
  WrongParameter = 3,

  /** The operation was denied. E.g.: memory access denied (code-protected). */
  OperationDenied = 4,

  /** Duty cycle lock. */
  DutyCycleLock = 5,

  /** The internal ESP3 buffer of the device is too small, to handle this telegram. */
  BufferTooSmall = 6,
  NoFreeBuffer = 7,
  ErrorSenderInvalid = 8,
  ErrorTransformingToESP3 = 9,
  ErrorTransformingToBuffer = 10,
}

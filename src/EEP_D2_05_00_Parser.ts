// Project: @enocean-core/eep-d2-05-00
// File: EEP_D2_05_00_Parser.ts
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

import * as EnOcean from 'enocean-core'
import { EEP_D2_05_00_Message } from './EEP_D2_05_00_Message'

export const EEP_D2_05_00_Parser: EnOcean.EEPParser = function (
  telegram: EnOcean.ERP1Telegram,
): EEP_D2_05_00_Message {
  const msg = new EEP_D2_05_00_Message()
  msg.fromERP1Telegram(telegram)
  return msg
}

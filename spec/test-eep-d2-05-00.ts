// Project: @enocean-core/eep-d2-05-00
// File: test-eep-d2-05-00.ts
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

/** @internal */

import * as EEP_D2_05_00 from '../lib/eep/EEP_D2_05_00'


let eep = new EEP_D2_05_00.default()
eep.command = EEP_D2_05_00.EEP_D2_05_00_Commands.GoToPositionAndAngle
eep.position = 42
eep.angle = 127

console.log('Original eep: ' + eep.toString())

const erp = eep.toERP1Telegram(DeviceId.zero, DeviceId.broadcast)

console.log('resulting ERP: ' + erp.toString())

eep = EEP_D2_05_00.default.fromERP1Telegram(erp)

console.log('Reconstructed eep: ' + eep.toString())

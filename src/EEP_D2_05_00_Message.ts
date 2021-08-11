// Project: @enocean-core/eep-d2-05-00
// File: EEP_D2_05_00_Message.ts
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
import { Byte } from '@henningkerstan/byte'

import { EEP_D2_05_00_Commands } from './EEP_D2_05_00_Commands'
import { EEP_D2_05_00_RepositioningMode } from './EEP_D2_05_00_RepositioningMode'
import { EEP_D2_05_00_SetLockingMode } from './EEP_D2_00_SetLockingMode'
import { EEP_D2_05_00_LockingMode } from './EEP_D2_05_00_LockingMode'

/**
 * EEP D2-05-00: Blinds Control for Position and Angle - Type 0x00
 */
export class EEP_D2_05_00_Message implements EnOcean.EEPMessage {
  command: EEP_D2_05_00_Commands
  position = 127
  angle = 127
  lockingMode = 0
  repositioningMode: number = EEP_D2_05_00_RepositioningMode.Direct

  toERP1Telegram(sender: EnOcean.DeviceId, destination: EnOcean.DeviceId): EnOcean.ERP1Telegram {
    // set up VLD telegram
    const erp = new EnOcean.ERP1Telegram()
    erp.rorg = EnOcean.RORGs.VLD
    erp.sender = sender
    erp.destination = destination

    // DB0 always contains channel info and command id
    const db0 = Byte.allZero()
    db0.writeUIntLSB(this.command, 0, 4)
    db0.writeUIntLSB(0, 4, 4) // channel is always zero
    //console.log('db0: ' + db0.toString())

    // for query and stop command, only DB0 is required
    if (
      this.command === EEP_D2_05_00_Commands.QueryPositionAndAngle ||
      this.command === EEP_D2_05_00_Commands.Stop
    ) {
      erp.userData = Buffer.alloc(1)
      erp.setDB(0, db0.readUIntLSB())
      return erp
    }

    // for goto/reply position/angle we need 4 bytes
    if (
      this.command === EEP_D2_05_00_Commands.GoToPositionAndAngle ||
      this.command === EEP_D2_05_00_Commands.ReplyPositionAndAngle
    ) {
      erp.userData = Buffer.alloc(4)
      erp.setDB(3, this.position)
      erp.setDB(2, this.angle)

      const db1 = Byte.allZero()
      db1.writeUIntLSB(this.lockingMode, 0, 3)

      if (this.command === EEP_D2_05_00_Commands.GoToPositionAndAngle) {
        db1.writeUIntLSB(this.repositioningMode, 4, 3)
      }

      erp.setDB(1, db1.readUIntLSB())
      erp.setDB(0, db0.readUIntLSB())

      return erp
    }

    if (this.command !== EEP_D2_05_00_Commands.SetParameters) {
      throw new Error('Unknown command')
    }

    throw new Error('CMD "Set parameters" not yet implemented')
    // command is "set parameter"

    erp.userData = Buffer.alloc(5)
    // TODO: DB4/5 contain measurement

    erp.setDB(0, db0.readUIntLSB())

    return erp
  }

  fromERP1Telegram(telegram: EnOcean.ERP1Telegram): void {
    if (telegram.rorg !== EnOcean.RORGs.VLD) {
      throw new Error('Not a D2-05-00 message (not a VLD telegram)')
    }

    if (telegram.userData.length < 1) {
      throw new Error('Not a D2-05-00 message (no data)')
    }

    // DB0 always contains channel info and command id
    const db0 = Byte.fromUInt8LSB(telegram.getDB(0))
    //console.log('db0: ' + db0.toString())
    const cmd = db0.readUIntLSB(0, 4)
    const channel = db0.readUIntLSB(4, 4)

    // channel info (this is an enum; 0 corresponds to channel 1)
    if (channel > 0) {
      console.log('channels: ' + channel)
      //throw new Error('Not a D2-05-00 message (channel must be 1)')
    }

    // processing is complete for commands "stop" and "query position and angle"
    if (
      cmd === EEP_D2_05_00_Commands.Stop ||
      cmd === EEP_D2_05_00_Commands.QueryPositionAndAngle
    ) {
      this.command = cmd
      return
    }

    if (
      cmd === EEP_D2_05_00_Commands.GoToPositionAndAngle ||
      cmd === EEP_D2_05_00_Commands.ReplyPositionAndAngle
    ) {
      if (telegram.userData.length !== 4) {
        throw new Error('User data size must be 4 for CMD 1/4')
      }

      this.command = cmd

      // todo: check if the following code is ok
      this.position = telegram.getDB(3)
      this.angle = telegram.getDB(2)

      // db 1 contains locking info and repo info (for goto only)
      const db1 = Byte.fromUInt8LSB(telegram.getDB(1))
      this.lockingMode = db1.readUIntLSB(0, 3)

      if (cmd === EEP_D2_05_00_Commands.GoToPositionAndAngle) {
        this.repositioningMode = db1.readUIntLSB(4, 3)
      }

      return
    }

    // remaining is only cmd 5 (TO BE IMPLEMENTED!°!!
    throw new Error('UNKNOWN CMD')
  }

  static fromERP1Telegram(telegram: EnOcean.ERP1Telegram): EEP_D2_05_00_Message {
    const eep = new EEP_D2_05_00_Message()
    eep.fromERP1Telegram(telegram)
    return eep
  }

  private cmdToString(cmd: EEP_D2_05_00_Commands) {
    return EEP_D2_05_00_Commands[cmd] + ' (' + cmd + ')'
  }

  private repositioningModeToString(mode: EEP_D2_05_00_RepositioningMode) {
    return EEP_D2_05_00_RepositioningMode[mode] + ' (' + mode + ')'
  }

  private setLockingModeToString(mode: EEP_D2_05_00_SetLockingMode) {
    return EEP_D2_05_00_SetLockingMode[mode] + ' (' + mode + ')'
  }

  private lockingModeToString(mode: EEP_D2_05_00_LockingMode) {
    return EEP_D2_05_00_LockingMode[mode] + ' (' + mode + ')'
  }

  private angleToString() {
    if (this.angle > 127) {
      return 'Error (> 127)'
    }

    if (this.angle === 127) {
      return 'keep'
    }

    if (this.angle < 0) {
      return 'Error (< 0)'
    }

    return this.angle.toString(10)
  }

  toString(): string {
    let s = 'EEP D2-05-00 {\n'
    s += '  Command:       ' + this.cmdToString(this.command) + '\n'

    if (
      this.command === EEP_D2_05_00_Commands.Stop ||
      this.command === EEP_D2_05_00_Commands.QueryPositionAndAngle
    ) {
      s += '}'
      return s
    }

    if (this.command === EEP_D2_05_00_Commands.GoToPositionAndAngle) {
      s += '  Position:      ' + this.position + '% closed\n'
      s += '  Angle:         ' + this.angleToString() + '\n'
      s +=
        '  Locking mode:  ' +
        this.setLockingModeToString(this.lockingMode) +
        '\n'
    }

    if (this.command === EEP_D2_05_00_Commands.ReplyPositionAndAngle) {
      s += '  Position:      ' + this.position + '% closed\n'
      s += '  Angle:         ' + this.angleToString() + '\n'
      s +=
        '  Locking mode:  ' + this.lockingModeToString(this.lockingMode) + '\n'
    }

    s += '}'
    return s
  }
}

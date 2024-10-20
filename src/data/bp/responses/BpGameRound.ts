import GameRoundData from '../../GameRoundData.js'
import { RoundWinCondition } from '@prisma/client'
import { CtlRoundWinType, SndRoundWinType } from '../types.js'

const commonWinConditions = ['pre_plant_kills', 'post_plant_kills', 'time', 'kills', 'ticks'] as const

export default class BpGameRound extends GameRoundData {
  constructor(
    protected _winCondition: SndRoundWinType | CtlRoundWinType,
    protected winnerId: number | null,
  ) {
    super()
  }

  winCondition(): RoundWinCondition | null {
    switch (this._winCondition) {
      case 'bomb_defuse':
        return 'DEFUSE'
      default:
        if (commonWinConditions.includes(this._winCondition)) {
          return this._winCondition.toUpperCase() as Uppercase<(typeof commonWinConditions)[number]>
        }

        throw new Error(`Unknown round win condition "${this._winCondition}".`)
    }
  }

  winner(): number | null {
    return this.winnerId
  }
}

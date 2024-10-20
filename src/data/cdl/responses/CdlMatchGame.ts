import GameData from '../../GameData.js'
import GameRoundData from '../../GameRoundData.js'
import { Match, MatchGame, MatchGameResult } from '../types.js'
import CdlMatchPlayerGame from './CdlMatchPlayerGame.js'
import { GameMode, IdType } from '../../../lib/prisma/index.js'

export default class CdlMatchGame extends GameData {
  protected _players: CdlMatchPlayerGame[] = []

  constructor(
    protected data: MatchGame,
    protected matchData: Match,
    protected result?: MatchGameResult,
  ) {
    super()
  }

  id(): number | null {
    return this.data.id
  }

  idType(): IdType {
    return undefined
  }

  map(): string | null {
    return this.data.map || this.data.gameMap?.displayName || null
  }

  mode(): GameMode {
    const { mode } = this.data

    if (!mode) {
      // For some reason it's missing on the odd series. Try to determine based on the winning score.
      if (this.result?.winnerTeamId) {
        const score = Math.max(this.result.hostGameScore, this.result.guestGameScore)

        switch (score) {
          case 250:
            return 'HP'
          case 6:
            return 'SND'
          case 3:
            return 'CTRL'
        }
      }

      // Have to assume BO5 here so hopefully this will never be encountered for another format...
      switch (this.order()) {
        case 1:
        case 4:
          return 'HP'
        case 2:
        case 5:
          return 'SND'
        case 3:
          return 'CTRL'
      }

      throw new Error('Unable to determine game mode.')
    } else {
      switch (this.data.mode) {
        case 'CDL Hardpoint':
          return 'HP'
        case 'CDL SnD':
        case 'CDL Search & Destroy':
          return 'SND'
        case 'CDL Control':
          return 'CTRL'
      }
    }
  }

  order(): number {
    return this.data.number + 1
  }

  players(): CdlMatchPlayerGame[] {
    return this._players
  }

  rounds(): GameRoundData[] {
    // No round data available from cdl.
    return []
  }

  team1(): number | null {
    return this.matchData.homeTeamCard?.id
  }

  team2(): number | null {
    return this.matchData.awayTeamCard?.id
  }

  team1Score(): number {
    return this.result?.hostGameScore || 0
  }

  team2Score(): number {
    return this.result?.guestGameScore || 0
  }

  winner(): number | null {
    return this.result?.winnerTeamId
  }

  gametime(): number | null {
    return null
  }

  team1CtrlAttackingRounds(): number | null {
    return null
  }

  team1CtrlTicks(): number | null {
    return null
  }

  team1HpHillScores(): number[] {
    return []
  }

  team2CtrlAttackingRounds(): number | null {
    return null
  }

  team2CtrlTicks(): number | null {
    return null
  }

  team2HpHillScores(): number[] {
    return []
  }

  addPlayer(player: CdlMatchPlayerGame): void {
    this._players.push(player)
  }
}

import GameData from '../../GameData.js'
import { IdType } from '../../../lib/prisma/index.js'
import PlayerResultData from '../../PlayerResultData.js'
import GameRoundData from '../../GameRoundData.js'
import { Game, GameMode, TeamGameStats } from '../types.js'
import he from 'he'
import BpPlayerStats from './BpPlayerStats.js'
import { GameMode as DbGameMode } from '../../../lib/prisma/index.js'
import BpGameRound from './BpGameRound.js'

export default class BpGame extends GameData {
  protected _players: BpPlayerStats[] = []
  protected _rounds: BpGameRound[] = []
  protected team1Stats: TeamGameStats | null = null
  protected team2Stats: TeamGameStats | null = null

  constructor(protected data: Game) {
    super()

    for (const playerStats of data.player_stats) {
      this._players.push(new BpPlayerStats(playerStats))
    }

    if (data.team_game_stats && data.team_game_stats.length) {
      this.team1Stats = data.team_game_stats.find((stats) => stats.team_id === data.team_1_id)
      this.team2Stats = data.team_game_stats.find((stats) => stats.team_id === data.team_2_id)

      if (this.mode() === 'SND' || this.mode() === 'CTRL') {
        const numRounds = this.mode() === 'SND' ? 11 : 5

        for (let i = 1; i <= numRounds; i++) {
          const winnerKey = `${this.mode() === 'SND' ? 'snd' : 'ctl'}_round_${i}_win`
          const winConditionKey = `${this.mode() === 'SND' ? 'snd' : 'ctl'}_round_${i}_win_type`
          let winnerId: number | null = null

          if (this.team1Stats[winnerKey]) {
            winnerId = this.team1Stats.team_id
          } else if (this.team2Stats[winnerKey]) {
            winnerId = this.team2Stats.team_id
          }

          this._rounds.push(new BpGameRound(this.team1Stats[winConditionKey], winnerId))
        }
      }
    }
  }

  gametime(): number | null {
    return undefined
  }

  id(): string | null {
    return this.data.id
  }

  idType(): IdType {
    return 'BP'
  }

  map(): string | null {
    return this.data.maps ? he.decode(this.data.maps.name) : null
  }

  mode(): DbGameMode {
    const mode: GameMode = he.decode(this.data.modes.name) as GameMode

    switch (mode) {
      case 'Control':
        return 'CTRL'
      case 'Search & Destroy':
        return 'SND'
      case 'Hardpoint':
        return 'HP'
    }
  }

  order(): number {
    return this.data.game_num
  }

  players(): PlayerResultData[] {
    return this._players
  }

  rounds(): GameRoundData[] {
    return this._rounds
  }

  team1(): number | null {
    return this.data.team_1_id
  }

  team1CtrlAttackingRounds(): number | null {
    return this.team1Stats?.ctl_total_attacking_rounds
  }

  team1CtrlTicks(): number | null {
    return this.team1Stats?.ctl_total_ticks
  }

  team1HpHillScores(): number[] {
    return this.getAllHillScores('team1Stats')
  }

  team1Score(): number {
    return this.data.team_1_score || 0
  }

  team2(): number | null {
    return this.data.team_2_id
  }

  team2CtrlAttackingRounds(): number | null {
    return this.team2Stats?.ctl_total_attacking_rounds
  }

  team2CtrlTicks(): number | null {
    return this.team2Stats?.ctl_total_ticks
  }

  team2HpHillScores(): number[] {
    return this.getAllHillScores('team2Stats')
  }

  team2Score(): number {
    return this.data.team_2_score || 0
  }

  winner(): number | null {
    return this.data.winner_id
  }

  getAllHillScores(property: 'team1Stats' | 'team2Stats'): number[] {
    const scores = Array.from(Array(15))

    return scores.map((_score, index) => {
      return this[property]?.[`hp_hill_${index + 1}_score`]
    })
  }
}

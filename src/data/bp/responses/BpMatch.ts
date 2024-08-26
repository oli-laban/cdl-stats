import MatchData from '../../MatchData.js'
import GameData from '../../GameData.js'
import TeamData from '../../TeamData.js'
import PlayerResultData from '../../PlayerResultData.js'
import { Match } from '../types.js'
import BpTeam from './BpTeam.js'

export default class BpMatch extends MatchData {
  protected _team1: BpTeam | null = null
  protected _team2: BpTeam | null = null

  constructor(protected data: Match) {
    super()

    if (data.team1) {
      this._team1 = new BpTeam(data.team1)
    }

    if (data.team2) {
      this._team2 = new BpTeam(data.team2)
    }
  }

  bpUrl(): string | null {
    return `https://www.breakingpoint.gg/match/${this.data.id}`
  }

  cdlUrl(): string | null {
    return null
  }

  date(): Date {
    return new Date(this.data.datetime)
  }

  format(): "BEST_OF_3" | "BEST_OF_5" | "BEST_OF_7" | "BEST_OF_9" {
    const formats = [3, 5, 7, 9]

    if (formats.includes(this.data.best_of)) {
      return `BEST_OF_${this.data.best_of as (3 | 5 | 7 | 9)}`
    }

    return 'BEST_OF_5'
  }

  /** TODO */
  games(): GameData[] {
    return []
  }

  id(): number | null {
    return this.data.id
  }

  idType(): "CDL" | "BP" {
    return 'BP'
  }

  /** TODO */
  players(): PlayerResultData[] {
    return []
  }

  status(): "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" {
    switch (this.data.status) {
      case 'complete':
        return 'COMPLETED'
      case 'upcoming':
        return 'SCHEDULED'
      default:
        return 'SCHEDULED'
    }
  }

  streamUrl(): string | null {
    return null
  }

  team1(): TeamData | null {
    return this._team1
  }

  team1Score(): number {
    return this.data.team_1_score || 0
  }

  team2(): TeamData | null {
    return this._team2
  }

  team2Score(): number {
    return this.data.team_2_score || 0
  }

  vodUrl(): string | null {
    return this.data.vod || null
  }

  winner(): TeamData | null {
    if (!this.data.winner_id) {
      return null
    }

    return this.data.winner_id === this.team1().id()
      ? this.team1()
      : this.data.winner_id === this.team2().id()
        ? this.team2()
        : null
  }

  getData(): Match {
    return this.data
  }
}

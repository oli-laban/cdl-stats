import MatchData from '../../MatchData.js'
import GameData from '../../GameData.js'
import TeamData from '../../TeamData.js'
import PlayerResultData from '../../PlayerResultData.js'
import { Match, MatchWithGames, PlayerStats } from '../types.js'
import BpTeam from './BpTeam.js'
import { MatchFormat, MatchStatus } from '@prisma/client'
import { IdType } from '../../../lib/prisma/index.js'
import BpGame from './BpGame.js'
import BpMatchStats from './BpMatchStats.js'

export default class BpMatch extends MatchData {
  protected _team1: BpTeam | null = null
  protected _team2: BpTeam | null = null
  protected _games: BpGame[] = []
  protected _players: BpMatchStats[] = []

  constructor(protected data: Match | MatchWithGames) {
    super()

    if (data.team1) {
      this._team1 = new BpTeam(data.team1)
    }

    if (data.team2) {
      this._team2 = new BpTeam(data.team2)
    }

    if ('games' in data) {
      for (const game of data.games) {
        this._games.push(new BpGame(game))
      }

      const playerStats: { [tag: string]: PlayerStats[] } = {}

      for (const game of data.games) {
        for (const gamePlayerStats of game.player_stats) {
          playerStats[gamePlayerStats.player_tag] ??= []

          playerStats[gamePlayerStats.player_tag].push(gamePlayerStats)
        }
      }

      for (const [tag, stats] of Object.entries(playerStats)) {
        const { player_id, team_id } = playerStats[tag][0]

        this._players.push(new BpMatchStats(player_id, tag, team_id, stats))
      }
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

  format(): MatchFormat {
    const formats = [3, 5, 7, 9]

    if (formats.includes(this.data.best_of)) {
      return `BEST_OF_${this.data.best_of as 3 | 5 | 7 | 9}`
    }

    return 'BEST_OF_5'
  }

  games(): GameData[] {
    return this._games
  }

  id(): number | null {
    return this.data.id
  }

  idType(): IdType {
    return 'BP'
  }

  players(): PlayerResultData[] {
    return this._players
  }

  status(): MatchStatus {
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

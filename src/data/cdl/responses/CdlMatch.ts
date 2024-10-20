import { Match as MatchType, MatchStatus } from '../types.js'
import MatchData from '../../MatchData.js'
import CdlTeam from './CdlTeam.js'
import { MappedBracketMatch } from './CdlBracket.js'
import CdlMatchGame from './CdlMatchGame.js'
import CdlMatchPlayerOverall from './CdlMatchPlayerOverall.js'
import CdlMatchPlayerGame from './CdlMatchPlayerGame.js'
import { MatchFormat, MatchStatus as DbMatchStatus } from '@prisma/client'
import { IdType } from '../../../lib/prisma/index.js'

export default class CdlMatch extends MatchData {
  protected _date: Date
  protected _team1: CdlTeam | null = null
  protected _team2: CdlTeam | null = null
  protected _games: CdlMatchGame[] = []
  protected _players: CdlMatchPlayerOverall[] = []

  constructor(protected data: MatchType) {
    super()

    const date = data.startDate || data.match.playTime

    this._date = new Date(
      // Timestamps can be in either seconds or milliseconds...
      data.startDate > 1e10 ? date : date * 1000,
    )

    if (data.homeTeamCard) {
      this._team1 = CdlTeam.fromTeamCard(data.homeTeamCard)
    }

    if (data.awayTeamCard) {
      this._team2 = CdlTeam.fromTeamCard(data.awayTeamCard)
    }
  }

  id(): number {
    return this.data.match.id
  }

  bpUrl(): string | null {
    return null
  }

  cdlUrl(): string | null {
    return `https://callofdutyleague.com/en-us/match/${this.id()}`
  }

  date(): Date {
    return this._date
  }

  format(): MatchFormat {
    // No way to determine without the final score so default to BO5.
    if (this.data.match.status !== 'COMPLETED') {
      return 'BEST_OF_5'
    }

    const winningScore = Math.max(this.team1Score(), this.team2Score())

    switch (winningScore) {
      case 2:
        return 'BEST_OF_3'
      case 3:
        return 'BEST_OF_5'
      case 4:
        return 'BEST_OF_7'
      case 5:
        return 'BEST_OF_9'
      default:
        return 'BEST_OF_5'
    }
  }

  idType(): IdType {
    return 'CDL'
  }

  status(): DbMatchStatus {
    if (this.data.match.status === 'PRESCHEDULED' || this.data.match.status === 'PENDING') {
      return 'SCHEDULED'
    }

    return this.data.match.status
  }

  streamUrl(): string | null {
    return this.data.broadcastLinks.find((link) => link.isDefault)?.url
  }

  team1(): CdlTeam | null {
    return this._team1
  }

  team2(): CdlTeam | null {
    return this._team2
  }

  winner(): CdlTeam | null {
    if (this.data.match.status !== 'COMPLETED') {
      return null
    }

    const id = (this.data as MatchType<MatchStatus.Completed>).result.winnerTeamId

    if (id === this.team1().id()) {
      return this.team1()
    }

    if (id === this.team2().id()) {
      return this.team2()
    }

    return null
  }

  team1Score(): number {
    return this.data.result.homeTeamGamesWon
  }

  team2Score(): number {
    return this.data.result.awayTeamGamesWon
  }

  vodUrl(): string | null {
    return this.data.match.vodLink || null
  }

  games(): CdlMatchGame[] {
    return this._games
  }

  players(): CdlMatchPlayerOverall[] {
    return this._players
  }

  calculatePlayerOveralls(team: number): void {
    const allPlayerGames = this.games().flatMap((game) => game.players())
    const groupedPlayerGames: { [name: string]: CdlMatchPlayerGame[] } = {}

    for (const playerGame of allPlayerGames) {
      const name = playerGame.player().name()

      groupedPlayerGames[name] ??= []
      groupedPlayerGames[name].push(playerGame)
    }

    for (const [, playerGames] of Object.entries(groupedPlayerGames)) {
      this._players.push(new CdlMatchPlayerOverall(playerGames, team))
    }
  }

  addGame(game: CdlMatchGame): void {
    this._games.push(game)
  }

  getData(): MatchType {
    return this.data
  }

  public static createFromBracketMatch(match: MappedBracketMatch): CdlMatch {
    return new CdlMatch({
      startDate: match.startDate,
      startTime: match.startDate,
      match: {
        id: match.id,
        status: match.status,
      },
      result: {
        homeTeamGamesWon: match.team1Score,
        awayTeamGamesWon: match.team2Score,
        winnerTeamId:
          match.status === 'COMPLETED'
            ? match.team1Score > match.team2Score
              ? match.team1.id
              : match.team2.id
            : undefined,
      },
      homeTeamCard: match.team1?.id
        ? {
            id: match.team1.id,
            name: match.team1.name,
            abbreviation: match.team1.abbreviation,
          }
        : undefined,
      awayTeamCard: match.team2?.id
        ? {
            id: match.team2.id,
            name: match.team2.name,
            abbreviation: match.team2.abbreviation,
          }
        : undefined,
      broadcastLinks: [],
    })
  }
}

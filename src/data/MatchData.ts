import TeamData from './TeamData.js'
import GameData from './GameData.js'
import PlayerResultData from './PlayerResultData.js'
import { MatchFormat, MatchStatus } from '@prisma/client'
import { IdType } from '../lib/prisma/index.js'

export default abstract class MatchData {
  abstract idType(): IdType

  abstract team1(): TeamData | null

  abstract team2(): TeamData | null

  abstract winner(): TeamData | null

  abstract team1Score(): number

  abstract team2Score(): number

  abstract date(): Date

  abstract format(): MatchFormat

  abstract status(): MatchStatus

  abstract cdlUrl(): string | null

  abstract bpUrl(): string | null

  abstract streamUrl(): string | null

  abstract vodUrl(): string | null

  abstract games(): GameData[]

  abstract players(): PlayerResultData[]

  abstract id(): number | null

  forfeited(): boolean {
    return false
  }
}

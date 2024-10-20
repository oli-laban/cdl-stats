import BracketSlotData from './BracketSlotData.js'
import MatchData from './MatchData.js'
import { BracketType, SplitType, TournamentFormat } from '@prisma/client'
import { IdType } from '../lib/prisma/index.js'

export default abstract class TournamentData {
  abstract idType(): IdType

  abstract id(): number | null

  abstract name(): string

  abstract startDate(): Date | null

  abstract endDate(): Date | null

  abstract splitType(): SplitType | null

  abstract format(): TournamentFormat

  abstract matches(): MatchData[]

  abstract bracketType(): BracketType | null

  abstract bracketSlots(): BracketSlotData[]

  abstract bracketMapFile(): string | null

  abstract hasGroupPlay(): boolean

  abstract isGroupPlay(): boolean

  abstract groups(): TournamentData[]

  abstract release(): string | null
}

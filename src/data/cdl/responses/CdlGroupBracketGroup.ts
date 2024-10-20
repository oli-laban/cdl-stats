import TournamentData from '../../TournamentData.js'
import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import CdlBracketSlot from './CdlBracketSlot.js'
import { BracketType, SplitType, TournamentFormat } from '@prisma/client'
import { IdType } from '../../../lib/prisma/index.js'

export default class CdlGroupBracketGroup extends TournamentData {
  protected slots: CdlBracketSlot[]

  constructor(protected data: { groupName: string; slots: CdlBracketSlot[] }) {
    super()

    this.slots = data.slots.sort((a, b) => a.match().date().getTime() - b.match().date().getTime())
  }

  id(): number | null {
    return null
  }

  idType(): IdType {
    return 'CDL'
  }

  bracketSlots(): BracketSlotData[] {
    return this.data.slots
  }

  bracketType(): BracketType | null {
    return 'DOUBLE_ELIMINATION'
  }

  bracketMapFile(): string | null {
    return 'group_qualifier.json'
  }

  endDate(): Date {
    return this.slots[this.slots.length - 1].match().date()
  }

  format(): TournamentFormat {
    return 'BRACKET'
  }

  groups(): TournamentData[] {
    return []
  }

  hasGroupPlay(): boolean {
    return false
  }

  isGroupPlay(): boolean {
    return true
  }

  matches(): MatchData[] {
    return []
  }

  name(): string {
    return this.data.groupName
  }

  splitType(): SplitType | null {
    return null
  }

  startDate(): Date {
    return this.slots[0].match().date()
  }

  release(): string | null {
    return null
  }
}

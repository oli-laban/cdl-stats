import TournamentData from '../../TournamentData.js'
import BpBracketSlot from './BpBracketSlot.js'
import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import he from 'he'
import { BracketType, SplitType, TournamentFormat } from '@prisma/client'
import { IdType } from '../../../lib/prisma/index.js'

export default class BpGroup extends TournamentData {
  protected _bracketSlots: BpBracketSlot[] = []

  constructor(protected _name: string) {
    super()
  }

  id(): number | null {
    return null
  }

  idType(): IdType {
    return 'BP'
  }

  addSlot(slot: BpBracketSlot): void {
    this._bracketSlots.push(slot)
  }

  bracketMapFile(): string | null {
    return 'group_qualifier.json'
  }

  bracketSlots(): BracketSlotData[] {
    return this._bracketSlots
  }

  bracketType(): BracketType | null {
    const hasLosers = this._bracketSlots.some((slot) => {
      slot.roundName().includes('Losers')
    })

    return hasLosers ? 'DOUBLE_ELIMINATION' : 'SINGLE_ELIMINATION'
  }

  endDate(): Date | null {
    return this._bracketSlots.length ? this._bracketSlots[this._bracketSlots.length - 1].match().date() : null
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
    return he.decode(this._name)
  }

  release(): string | null {
    return null
  }

  splitType(): SplitType | null {
    return null
  }

  startDate(): Date | null {
    return this._bracketSlots.length ? this._bracketSlots[0].match().date() : null
  }
}

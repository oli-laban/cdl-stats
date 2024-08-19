import TournamentData from '../../TournamentData.js'
import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import CdlBracketSlot from './CdlBracketSlot.js'

export default class CdlGroupBracketGroup extends TournamentData {
  protected slots: CdlBracketSlot[]

  constructor(protected data: { groupName: string; slots: CdlBracketSlot[] }) {
    super()

    this.slots = data.slots.sort(
      (a, b) => a.match().date().getTime() - b.match().date().getTime(),
    )
  }

  bracketSlots(): BracketSlotData[] {
    return this.data.slots
  }

  bracketType(): 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | null {
    return 'DOUBLE_ELIMINATION'
  }

  bracketMapFile(): string | null {
    return 'group_qualifier.json'
  }

  endDate(): Date {
    return this.slots[this.slots.length - 1].match().date()
  }

  format(): 'BRACKET' | 'ROUND' {
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

  splitType(): 'QUALIFIERS' | 'FINAL' | null {
    return null
  }

  startDate(): Date {
    return this.slots[0].match().date()
  }

  release(): string | null {
    return null
  }
}

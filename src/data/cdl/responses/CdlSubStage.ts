import { CdlWeekHeaderBlock, StageSubTab } from '../types.js'
import CdlMatch from './CdlMatch.js'
import CdlBracket from './CdlBracket.js'
import TournamentData from '../../TournamentData.js'
import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import CdlBracketSlot from './CdlBracketSlot.js'
import CdlGroupBracket from './CdlGroupBracket.js'
import CdlGroupBracketGroup from './CdlGroupBracketGroup.js'
import CdlStandardBracket from './CdlStandardBracket.js'

export default class CdlSubStage extends TournamentData {
  public tournamentTitle: string
  public _allMatches: CdlMatch[] = []
  protected nonBracketMatches: CdlMatch[] = []
  protected brackets: CdlBracket[] = []
  protected _bracketSlots: CdlBracketSlot[] = []
  protected _groups: TournamentData[] = []
  protected _release: string | null = null

  constructor(public data: StageSubTab<true>) {
    super()

    this.tournamentTitle = this.getTournamentTitle()
  }

  protected getTournamentTitle(): string {
    const headerBlock = this.data.blocks.find(
      (block): block is CdlWeekHeaderBlock =>
        Object.hasOwn(block, 'cdlWeekHeader'),
    )

    return headerBlock?.cdlWeekHeader.primaryTitle || this.data.title
  }

  title(): string {
    return this.data.title
  }

  name(): string {
    return this.tournamentTitle
  }

  startDate(): Date | null {
    if (!this.sortedMatches().length) {
      return null
    }

    return this.sortedMatches()[0].date()
  }

  endDate(): Date | null {
    if (!this.sortedMatches().length) {
      return null
    }

    return this.sortedMatches()[this._allMatches.length - 1].date()
  }

  format(): 'BRACKET' | 'ROUND' {
    return this.brackets.length ? 'BRACKET' : 'ROUND'
  }

  matches(): MatchData[] {
    return this.nonBracketMatches
  }

  allMatches(): CdlMatch[] {
    return this._allMatches
  }

  bracketType(): 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | null {
    if (this.format() === 'ROUND') {
      return null
    }

    return this.bracketSlots().find((slot) => slot.type() === 'LOWER')
      ? 'DOUBLE_ELIMINATION'
      : 'SINGLE_ELIMINATION'
  }

  bracketSlots(): BracketSlotData[] {
    return this._bracketSlots
  }

  bracketMapFile(): string | null {
    const bracketTitle = this.getStandardBrackets()?.[0]?.title()

    if (bracketTitle === 'Kickoff Classic Bracket') {
      return '2022_kickoff_classic.json'
    }

    return null
  }

  groups(): TournamentData[] {
    return this._groups
  }

  hasGroupPlay(): boolean {
    return !!this.brackets.find((bracket) => bracket instanceof CdlGroupBracket)
  }

  isGroupPlay(): boolean {
    return false
  }

  splitType(): 'QUALIFIERS' | 'FINAL' | null {
    return this.brackets.length ? 'FINAL' : 'QUALIFIERS'
  }

  setRelease(release: string): void {
    this._release = release
  }

  release(): string | null {
    return this._release
  }

  addMatch(match: CdlMatch): void {
    this._allMatches.push(match)
  }

  addBracket(bracket: CdlBracket): void {
    if (this.brackets.findIndex((_bracket) => _bracket.title() === bracket.title()) !== -1) {
      return
    }

    this.brackets.push(bracket)
  }

  applyBrackets(): void {
    const matches = [ ...this._allMatches ]

    this.brackets.forEach((bracket) => {
      const slots = bracket
        .getMappedMatches()
        .map((bracketMatch) => {
          const index = matches.findIndex(
            (match) => match.id() === bracketMatch.id,
          )
          let match: CdlMatch;

          if (index !== -1) {
            match = matches.splice(index, 1)[0]
          } else {
            // For some reason, some matches aren't in the schedule, so we can create a basic CdlMatch
            // from the data available on the bracket.
            match = CdlMatch.createFromBracketMatch(bracketMatch)
          }

          return new CdlBracketSlot({
            match,
            roundName: bracketMatch.round,
            position: bracketMatch.position,
            group: bracketMatch.group,
            roundNumber: bracketMatch.roundNumber,
            positionNumber: bracketMatch.positionNumber,
          })
        })
        .filter((match) => !!match)

      if (bracket instanceof CdlGroupBracket) {
        const groupedSlots = this.splitBracketSlotsIntoGroups(slots)

        for (const groupName in groupedSlots) {
          this._groups.push(
            new CdlGroupBracketGroup({
              groupName,
              slots: groupedSlots[groupName],
            }),
          )
        }
      } else {
        this._bracketSlots = slots
      }
    })

    this.nonBracketMatches = matches
  }

  protected sortedMatches(): CdlMatch[] {
    return this._allMatches.sort(
      (a, b) => a.date().getTime() - b.date().getTime(),
    )
  }

  protected splitBracketSlotsIntoGroups(
    slots: CdlBracketSlot[],
  ): Record<string, CdlBracketSlot[]> {
    return slots.reduce((accumulator, slot) => {
      const group = slot.groupName()

      if (!accumulator[group]) {
        accumulator[group] = []
      }

      accumulator[group].push(slot)

      return accumulator
    }, {})
  }

  getData(): StageSubTab {
    return this.data
  }

  getStandardBrackets(): CdlStandardBracket[] {
    return this.brackets.filter<CdlStandardBracket>(
      (bracket): bracket is CdlStandardBracket => bracket instanceof CdlStandardBracket,
    )
  }

  getGroupBrackets(): CdlGroupBracket[] {
    return this.brackets.filter<CdlGroupBracket>(
      (bracket): bracket is CdlGroupBracket => bracket instanceof CdlGroupBracket,
    )
  }
}

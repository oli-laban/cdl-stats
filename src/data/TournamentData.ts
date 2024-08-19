import BracketSlotData from './BracketSlotData.js'
import MatchData from './MatchData.js'

export default abstract class TournamentData {
  abstract name(): string

  abstract startDate(): Date | null

  abstract endDate(): Date | null

  abstract splitType(): 'QUALIFIERS' | 'FINAL' | null

  abstract format(): 'BRACKET' | 'ROUND'

  abstract matches(): MatchData[]

  abstract bracketType(): 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | null

  abstract bracketSlots(): BracketSlotData[]

  abstract bracketMapFile(): string | null

  abstract hasGroupPlay(): boolean

  abstract isGroupPlay(): boolean

  abstract groups(): TournamentData[]

  abstract release(): string | null

  tier(): 'CDL' | 'CHALLENGERS' {
    return 'CDL'
  }
}

import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import BpMatch from './BpMatch.js'
import he from 'he'

export default class BpBracketSlot extends BracketSlotData {
  constructor(protected _match: BpMatch, protected _round: number, protected _position: number) {
    super()
  }

  match(): MatchData {
    return this._match
  }

  position(): number {
    return this._position
  }

  round(): number {
    return this._round
  }

  roundName(): string {
    return he.decode(this._match.getData().round.name)
  }

  shortRoundName(): string {
    // Strip "GP X" from group play round names.
    const roundName = this._match.getData().round.name_short
      .match(/(?:GP \S+?)?\b(.*)/)[1]
      .trim()

    if (roundName === 'WQR') {
      return `WR${this.round()}`
    }

    if (roundName === 'LQR') {
      return `LR${this.round()}`
    }

    return roundName
  }

  type(): "UPPER" | "LOWER" {
    const round = this.roundName().toLowerCase()

    return round.includes('loser') || round.includes('elimination') ? 'LOWER' : 'UPPER'
  }

}

import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import CdlMatch from './CdlMatch.js'

interface Data {
  match: CdlMatch
  roundName: string
  position: string
  group?: string
  roundNumber: number
  positionNumber: number
}

export default class CdlBracketSlot extends BracketSlotData {
  constructor(public data: Data) {
    super()
  }

  match(): MatchData {
    return this.data.match
  }

  position(): number {
    return this.data.positionNumber
  }

  round(): number {
    return this.data.roundNumber
  }

  roundName(): string {
    return this.data.roundName
  }

  shortRoundName(): string {
    return this.data.position.split('-')[0]
  }

  groupName(): string {
    return this.data.group
  }

  type(): 'UPPER' | 'LOWER' {
    return this.data.position.startsWith('W') || this.data.position.startsWith('GF') ? 'UPPER' : 'LOWER'
  }
}

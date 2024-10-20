import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import CdlMatch from './CdlMatch.js'
import { BracketSlotType } from '@prisma/client'

interface Data {
  match: CdlMatch
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
    if (this.shortRoundName().startsWith('WR')) {
      return `Winners Round ${this.round()}`
    }

    if (this.shortRoundName().startsWith('LR')) {
      return `Elimination Round ${this.round()}`
    }

    if (this.shortRoundName() === 'WF') {
      return 'Winners Finals'
    }

    if (this.shortRoundName() === 'LF') {
      return 'Elimination Finals'
    }

    if (this.shortRoundName() === 'GF') {
      return 'Grand Finals'
    }

    return ''
  }

  shortRoundName(): string {
    return this.data.position.split('-')[0]
  }

  groupName(): string {
    return this.data.group
  }

  type(): BracketSlotType {
    return this.data.position.startsWith('W') || this.data.position.startsWith('GF') ? 'UPPER' : 'LOWER'
  }
}

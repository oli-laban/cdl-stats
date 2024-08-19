import MatchData from './MatchData.js'

export default abstract class BracketSlotData {
  abstract match(): MatchData

  abstract round(): number

  abstract roundName(): string

  abstract shortRoundName(): string

  abstract position(): number

  abstract type(): 'UPPER' | 'LOWER'

  isBye(): boolean {
    return false
  }
}

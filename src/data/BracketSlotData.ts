import MatchData from './MatchData.js'
import { BracketSlotType } from '@prisma/client'

export default abstract class BracketSlotData {
  abstract match(): MatchData

  abstract round(): number

  abstract roundName(): string

  abstract shortRoundName(): string

  abstract position(): number

  abstract type(): BracketSlotType

  isBye(): boolean {
    return false
  }
}

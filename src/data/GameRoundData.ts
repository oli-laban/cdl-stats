import { RoundWinCondition } from '@prisma/client'

export default abstract class GameRoundData {
  abstract winner(): number | null

  abstract winCondition(): RoundWinCondition | null
}

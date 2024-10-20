import GameRoundData from './GameRoundData.js'
import PlayerResultData from './PlayerResultData.js'
import { GameMode, IdType } from '../lib/prisma/index.js'

export default abstract class GameData {
  abstract id(): number | string | null

  abstract idType(): IdType

  abstract order(): number

  abstract mode(): GameMode

  abstract map(): string | null

  abstract winner(): number | null

  abstract gametime(): number | null

  abstract team1(): number | null

  abstract team2(): number | null

  abstract team1Score(): number

  abstract team2Score(): number

  abstract team1HpHillScores(): number[]

  abstract team2HpHillScores(): number[]

  abstract team1CtrlTicks(): number | null

  abstract team1CtrlAttackingRounds(): number | null

  abstract team2CtrlTicks(): number | null

  abstract team2CtrlAttackingRounds(): number | null

  abstract rounds(): GameRoundData[]

  abstract players(): PlayerResultData[]

  forfeited(): boolean {
    return false
  }
}

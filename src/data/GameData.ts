import GameRoundData from './GameRoundData.js'
import PlayerResultData from './PlayerResultData.js'

export default abstract class GameData {
  abstract matchId(): number

  abstract id(): number

  abstract idType(): 'CDL' | 'BP'

  abstract order(): number

  abstract mode(): 'HP' | 'SND' | 'CTRL'

  abstract map(): string | null

  abstract winner(): number | null

  abstract team1(): number | null

  abstract team2(): number | null

  abstract team1Score(): number

  abstract team2Score(): number

  abstract rounds(): GameRoundData[]

  abstract players(): PlayerResultData[]

  forfeited(): boolean {
    return false
  }
}

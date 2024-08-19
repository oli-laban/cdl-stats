import TeamData from './TeamData.js'
import GameData from './GameData.js'
import PlayerResultData from './PlayerResultData.js'

export default abstract class MatchData {
  abstract idType(): 'CDL' | 'BP'

  abstract team1(): TeamData | null

  abstract team2(): TeamData | null

  abstract winner(): TeamData | null

  abstract team1Score(): number

  abstract team2Score(): number

  abstract date(): Date

  abstract format(): 'BEST_OF_3' | 'BEST_OF_5' | 'BEST_OF_7' | 'BEST_OF_9'

  abstract status(): 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'

  abstract cdlUrl(): string | null

  abstract bpUrl(): string | null

  abstract streamUrl(): string | null

  abstract vodUrl(): string | null

  abstract games(): GameData[]

  abstract players(): PlayerResultData[]

  abstract id(): number | null

  forfeited(): boolean {
    return false
  }
}

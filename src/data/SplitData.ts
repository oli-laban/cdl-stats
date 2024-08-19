import TournamentData from './TournamentData.js'

export default abstract class SplitData {
  abstract name(): string

  abstract tournaments(): TournamentData[]
}

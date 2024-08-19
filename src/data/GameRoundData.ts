export default abstract class GameRoundData {
  abstract winner(): number | null

  abstract winCondition(): 'KILLS' | 'TIME' | 'DEFUSE' | 'BOMB' | 'TICKS' | null
}

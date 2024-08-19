import PlayerData from './PlayerData.js'

export default abstract class TeamData {
  abstract name(): string

  abstract abbreviation(): string | null

  abstract id(): number | null

  abstract idType(): 'CDL' | 'BP'

  abstract players(): PlayerData[]
}

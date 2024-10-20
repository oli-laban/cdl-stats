import PlayerData from './PlayerData.js'
import { IdType } from '../lib/prisma/index.js'

export default abstract class TeamData {
  abstract name(): string

  abstract abbreviation(): string | null

  abstract id(): number | null

  abstract idType(): IdType

  abstract players(): PlayerData[]
}

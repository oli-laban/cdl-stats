import TeamData from '../../TeamData.js'
import PlayerData from '../../PlayerData.js'
import { Team } from '../types.js'
import he from 'he'

export default class BpTeam extends TeamData {
  constructor(protected data: Team) {
    super()
  }

  abbreviation(): string | null {
    return this.data.name_short?.trim() || null
  }

  id(): number | null {
    return this.data.id
  }

  idType(): 'CDL' | 'BP' {
    return 'BP'
  }

  name(): string {
    return he.decode(this.data.name)
  }

  players(): PlayerData[] {
    return []
  }
}

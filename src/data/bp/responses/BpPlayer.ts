import PlayerData from '../../PlayerData.js'
import { IdType } from '../../../lib/prisma/index.js'
import { Player } from '../types.js'

export default class BpPlayer extends PlayerData {
  constructor(protected data: Player) {
    super()
  }

  country(): string | null {
    return null
  }

  firstName(): string | null {
    return null
  }

  fullName(): string | null {
    return null
  }

  id(): number | null {
    return this.data.id
  }

  idType(): IdType {
    return 'BP'
  }

  lastName(): string | null {
    return null
  }

  name(): string {
    return this.data.tag
  }

  syncUsing(): 'id' | 'name' {
    return 'name'
  }

  twitchUrl(): string | null {
    return null
  }

  twitterUrl(): string | null {
    return null
  }

  youtubeUrl(): string | null {
    return null
  }
}

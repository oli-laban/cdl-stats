import PlayerData from '../../PlayerData.js'
import { Player } from '../types.js'

export default class CdlPlayer extends PlayerData {
  constructor(protected data: Player, protected _syncUsingName: boolean = false) {
    super()
  }

  country(): string | null {
    return this.data.homeCountry
  }

  id(): number | null {
    return this.data.id
  }

  idType(): 'CDL' | 'BP' {
    return 'CDL'
  }

  firstName(): string | null {
    return this.data.firstName
  }

  lastName(): string | null {
    return this.data.lastName
  }

  fullName(): string | null {
    return (this.data.firstName + ' ' + this.data.lastName).trim()
  }

  name(): string {
    return this.data.alias
  }

  twitchUrl(): string | null {
    return this.data.socialNetworkHandles
      .find((handle) => handle.socialNetworkType === 'TWITTER')
      ?.handle
  }

  twitterUrl(): string | null {
    return null
  }

  youtubeUrl(): string | null {
    return null
  }

  syncUsing(): 'id' | 'name' {
    return this._syncUsingName ? 'name' : 'id'
  }
}

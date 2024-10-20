import PlayerResultData from '../../PlayerResultData.js'
import PlayerData from '../../PlayerData.js'
import { PlayerStats } from '../types.js'
import BpPlayer from './BpPlayer.js'

export default class BpPlayerStats extends PlayerResultData {
  protected _player: BpPlayer

  constructor(protected data: PlayerStats) {
    super()

    this._player = new BpPlayer({ id: data.player_id, tag: data.player_tag })
  }

  assists(): number | null {
    return this.data.assists
  }

  averageSpeed(): number | null {
    return null
  }

  ctrlCaptures(): number | null {
    return this.data.zone_capture_count
  }

  ctrlTicks(): number | null {
    return this.data.zone_tier_capture_count
  }

  damage(): number | null {
    return this.data.damage
  }

  damageTaken(): number | null {
    return null
  }

  deaths(): number | null {
    return this.data.deaths
  }

  distanceTraveled(): number | null {
    return undefined
  }

  firstBloods(): number | null {
    return this.data.first_blood_count
  }

  firstDeaths(): number | null {
    return this.data.first_death_count
  }

  headshots(): number | null {
    return null
  }

  highestMultikill(): number | null {
    return null
  }

  highestStreak(): number | null {
    return this.data.highest_streak
  }

  hpContestTime(): number | null {
    return this.data.contested_hill_time
  }

  hpHillTime(): number | null {
    return this.data.hill_time
  }

  killDeathRatio(): string | null {
    if (this.kills() !== null && this.deaths() !== null) {
      return (this.kills() / this.deaths()).toFixed(2)
    }

    return null
  }

  kills(): number | null {
    return this.data.kills
  }

  lethalsUsed(): number | null {
    return null
  }

  longshots(): number | null {
    return null
  }

  percentTimeMoving(): number | null {
    return null
  }

  player(): PlayerData {
    return this._player
  }

  score(): number | null {
    return null
  }

  shotsFired(): number | null {
    return null
  }

  shotsHit(): number | null {
    return null
  }

  snd1v1Wins(): number | null {
    return this.data.one_v_one_win_count
  }

  snd1v2Wins(): number | null {
    return this.data.one_v_two_win_count
  }

  snd1v3Wins(): number | null {
    return this.data.one_v_three_win_count
  }

  snd1v4Wins(): number | null {
    return this.data.one_v_four_win_count
  }

  sndAces(): number | null {
    return null
  }

  sndDefuserKills(): number | null {
    return null
  }

  sndDefuses(): number | null {
    return this.data.defuse_count
  }

  sndNinjaDefuses(): number | null {
    return null
  }

  sndPlanterKills(): number | null {
    return null
  }

  sndPlants(): number | null {
    return this.data.plant_count
  }

  sndSnipes(): number | null {
    return this.data.snipe_count
  }

  tacticalsUsed(): number | null {
    return null
  }

  team(): number {
    return this.data.team_id
  }

  teamDamage(): number | null {
    return null
  }

  tradedDeaths(): number | null {
    return null
  }

  tradedKills(): number | null {
    return null
  }

  untradedDeaths(): number | null {
    return null
  }

  untradedKills(): number | null {
    return this.data.non_traded_kills
  }

  victimFovKills(): number | null {
    return null
  }

  wallbangs(): number | null {
    return null
  }
}

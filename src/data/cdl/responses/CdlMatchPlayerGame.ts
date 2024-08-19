import PlayerResultData from '../../PlayerResultData.js'
import { MatchPlayerGame } from '../types.js'
import PlayerData from '../../PlayerData.js'
import CdlPlayer from './CdlPlayer.js'

export default class CdlMatchPlayerGame extends PlayerResultData {
  protected _player: PlayerData

  constructor(public data: MatchPlayerGame, protected _team: number) {
    super()

    this._player = new CdlPlayer({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      alias: data.alias,
      socialNetworkHandles: [],
    }, true)
  }

  player(): PlayerData {
    return this._player
  }

  team(): number {
    return this._team
  }

  assists(): number | null {
    return this.data.stats?.totalAssists ?? null
  }

  averageSpeed(): number | null {
    return this.data.stats?.averageSpeed ?? null
  }

  ctrlCaptures(): number | null {
    return this.data.gameMode === 'CDL Control' ? (this.data.stats?.totalObjectivesCaptured ?? null) : null
  }

  ctrlTicks(): number | null {
    return this.data.gameMode === 'CDL Control' ? (this.data.stats?.objectiveTiersContributed ?? null) : null
  }

  damage(): number | null {
    return this.data.stats?.totalDamageDealt ?? null
  }

  damageTaken(): number | null {
    return this.data.stats?.damageTaken ?? null
  }

  deaths(): number | null {
    return this.data.stats?.totalDeaths ?? null
  }

  distanceTraveled(): number | null {
    return this.data.stats?.totalDistanceTraveled ?? null
  }

  firstBloods(): number | null {
    return this.data.stats?.totalFirstBloodKills ?? null
  }

  headshots(): number | null {
    return this.data.stats?.totalShotsHead ?? null
  }

  highestMultikill(): number | null {
    // Stat exists in data but never has a value other than 0.
    return null
  }

  highestStreak(): number | null {
    return this.data.stats?.highestStreak ?? null
  }

  hpHill1Time(): number | null {
    // Stat exists in data as time string but is always "00:00".
    return null
  }

  hpHill2Time(): number | null {
    // Stat exists in data as time string but is always "00:00".
    return null
  }

  hpHill3Time(): number | null {
    // Stat exists in data as time string but is always "00:00".
    return null
  }

  hpHill4Time(): number | null {
    // Stat exists in data as time string but is always "00:00".
    return null
  }

  hpHill5Time(): number | null {
    // Stat exists in data as time string but is always "00:00".
    return null
  }

  hpHill6Time(): number | null {
    return null
  }

  hpHill7Time(): number | null {
    return null
  }

  hpHillTime(): number | null {
    return this.data.gameMode === 'CDL Hardpoint' ? (this.data.stats?.hillTime ?? null) : null
  }

  killDeathRatio(): string | null {
    if (this.kills() !== null && this.deaths() !== null) {
      return (this.kills() / this.deaths()).toFixed(2)
    }

    return null
  }

  kills(): number | null {
    return this.data.stats?.totalKills ?? null
  }

  lethalsUsed(): number | null {
    return this.data.stats?.lethalsUsed ?? null
  }

  longshots(): number | null {
    return this.data.stats?.totalLongshotKills ?? null
  }

  percentTimeMoving(): number | null {
    return this.data.stats?.percentTimeMoving ?? null
  }

  score(): number | null {
    return this.data.stats?.totalScore ?? null
  }

  shotsFired(): number | null {
    return this.data.stats?.totalShotsFired ?? null
  }

  shotsHit(): number | null {
    return this.data.stats?.totalShotsHit ?? null
  }

  sndAces(): number | null {
    return this.data.gameMode === 'CDL SnD' || this.data.gameMode === 'CDL Search & Destroy'
      ? (this.data.stats?.totalAces ?? null)
      : null
  }

  sndDefuserKills(): number | null {
    return this.data.gameMode === 'CDL SnD' || this.data.gameMode === 'CDL Search & Destroy'
      ? (this.data.stats?.totalDefuserKills ?? null)
      : null
  }

  sndPlanterKills(): number | null {
    return this.data.gameMode === 'CDL SnD' || this.data.gameMode === 'CDL Search & Destroy'
      ? (this.data.stats?.totalPlanterKills ?? null)
      : null
  }

  tacticalsUsed(): number | null {
    return this.data.stats?.tacticalsUsed ?? null
  }

  teamDamage(): number | null {
    return this.data.stats?.friendDamage ?? null
  }

  tradedDeaths(): number | null {
    return this.data.stats?.tradedDeaths ?? null
  }

  tradedKills(): number | null {
    return this.data.stats?.tradedKills ?? null
  }

  untradedDeaths(): number | null {
    return this.data.stats?.untradedDeaths ?? null
  }

  untradedKills(): number | null {
    return this.data.stats?.untradedKills ?? null
  }

  victimFovKills(): number | null {
    return this.data.stats?.totalInVictimFovKills ?? null
  }

  wallbangs(): number | null {
    return this.data.stats?.totalWallbangKills ?? null
  }

  hpContestTime(): number | null {
    return this.data.gameMode === 'CDL Hardpoint' ? (this.data.stats?.contestedHillTime ?? null) : null
  }

  sndDefuses(): number | null {
    return this.data.gameMode === 'CDL SnD' || this.data.gameMode === 'CDL Search & Destroy'
      ? (this.data.stats?.bombsDefused ?? null)
      : null
  }

  sndNinjaDefuses(): number | null {
    return this.data.gameMode === 'CDL SnD' || this.data.gameMode === 'CDL Search & Destroy'
      ? (this.data.stats?.sneakDefuses ?? null)
      : null
  }

  sndPlants(): number | null {
    return this.data.gameMode === 'CDL SnD' || this.data.gameMode === 'CDL Search & Destroy'
      ? (this.data.stats?.bombsPlanted ?? null)
      : null
  }
}

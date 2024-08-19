import PlayerResultData from '../../PlayerResultData.js'
import {
  ControlPlayerStats,
  GameMode,
  HpPlayerStats,
  SndPlayerStats,
} from '../types.js'
import CdlMatchPlayerGame from './CdlMatchPlayerGame.js'
import PlayerData from '../../PlayerData.js'
import CdlPlayer from './CdlPlayer.js'

type AllModesPlayerStats = HpPlayerStats & SndPlayerStats & ControlPlayerStats

export default class CdlMatchPlayerOverall extends PlayerResultData {
  protected _player: PlayerData

  constructor(protected games: CdlMatchPlayerGame[], protected _team: number) {
    super()

    this._player = new CdlPlayer({
      id: games[0].player().id(),
      firstName: games[0].player().firstName(),
      lastName: games[0].player().lastName(),
      alias: games[0].player().name(),
      socialNetworkHandles: [],
    }, true)
  }

  private sum(property: keyof AllModesPlayerStats, mode?: GameMode | GameMode[]): number | null {
    if (typeof mode === 'string') {
      mode = [mode]
    }

    return this.games
      .filter((game) => mode ? mode.includes(game.data.gameMode) : true)
      .reduce((accumulator: number, current) => {
        const value = current.data.stats?.[property]

        if (value === null || value === undefined || typeof value === 'string') {
          return accumulator
        }

        if (accumulator === null) {
          accumulator = 0
        }

        return accumulator + value
      }, null)
  }

  private average(property: keyof AllModesPlayerStats): number | null {
    const sum = this.sum(property)

    if (sum === null) {
      return null
    }

    const summed = this.games.filter(
      (game) => game.data.stats?.[property] !== null && game.data.stats?.[property] !== undefined,
    )

    return sum / summed.length
  }

  private max(property: keyof AllModesPlayerStats): number | null {
    const values: number[] = this.games
      .map((game) => game.data.stats?.[property])
      .filter((value) => value !== null && typeof value !== 'undefined' && typeof value !== 'string')

    if (!values.length) {
      return null
    }

    return Math.max(...values)
  }

  player(): PlayerData {
    return this._player
  }

  team(): number {
    return this._team
  }

  assists(): number | null {
    return this.sum('totalAssists')
  }

  averageSpeed(): number | null {
    return this.average('averageSpeed')
  }

  ctrlCaptures(): number | null {
    return this.sum('totalObjectivesCaptured', 'CDL Control')
  }

  ctrlTicks(): number | null {
    return this.sum('objectiveTiersContributed', 'CDL Control')
  }

  damage(): number | null {
    return this.sum('totalDamageDealt')
  }

  damageTaken(): number | null {
    return this.sum('damageTaken')
  }

  deaths(): number | null {
    return this.sum('totalDeaths')
  }

  distanceTraveled(): number | null {
    return this.sum('totalDistanceTraveled')
  }

  firstBloods(): number | null {
    return this.sum('totalFirstBloodKills')
  }

  headshots(): number | null {
    return this.sum('totalShotsHead')
  }

  highestMultikill(): number | null {
    // Stat exists in data but never has a value other than 0.
    return null
  }

  highestStreak(): number | null {
    return this.max('highestStreak')
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
    return this.sum('hillTime', 'CDL Hardpoint')
  }

  killDeathRatio(): string | null {
    if (this.kills() !== null && this.deaths() !== null) {
      return (this.kills() / this.deaths()).toFixed(2)
    }

    return null
  }

  kills(): number | null {
    return this.sum('totalKills')
  }

  lethalsUsed(): number | null {
    return this.sum('lethalsUsed')
  }

  longshots(): number | null {
    return this.sum('totalLongshotKills')
  }

  percentTimeMoving(): number | null {
    return null
  }

  score(): number | null {
    return this.sum('totalScore')
  }

  shotsFired(): number | null {
    return this.sum('totalShotsFired')
  }

  shotsHit(): number | null {
    return this.sum('totalShotsHit')
  }

  sndAces(): number | null {
    return this.sum('totalAces', ['CDL SnD', 'CDL Search & Destroy'])
  }

  sndDefuserKills(): number | null {
    return this.sum('totalDefuserKills', ['CDL SnD', 'CDL Search & Destroy'])
  }

  sndPlanterKills(): number | null {
    return this.sum('totalPlanterKills', ['CDL SnD', 'CDL Search & Destroy'])
  }

  tacticalsUsed(): number | null {
    return this.sum('tacticalsUsed')
  }

  teamDamage(): number | null {
    return this.sum('friendDamage')
  }

  tradedDeaths(): number | null {
    return this.sum('tradedDeaths')
  }

  tradedKills(): number | null {
    return this.sum('tradedKills')
  }

  untradedDeaths(): number | null {
    return this.sum('untradedDeaths')
  }

  untradedKills(): number | null {
    return this.sum('untradedKills')
  }

  victimFovKills(): number | null {
    return this.sum('totalInVictimFovKills')
  }

  wallbangs(): number | null {
    return this.sum('totalWallbangKills')
  }

  hpContestTime(): number | null {
    return this.sum('contestedHillTime', 'CDL Hardpoint')
  }

  sndDefuses(): number | null {
    return this.sum('bombsDefused', ['CDL SnD', 'CDL Search & Destroy'])
  }

  sndNinjaDefuses(): number | null {
    return this.sum('sneakDefuses', ['CDL SnD', 'CDL Search & Destroy'])
  }

  sndPlants(): number | null {
    return this.sum('bombsPlanted', ['CDL SnD', 'CDL Search & Destroy'])
  }
}

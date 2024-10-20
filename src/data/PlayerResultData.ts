import PlayerData from './PlayerData.js'

export default abstract class PlayerResultData {
  abstract player(): PlayerData

  abstract team(): number

  abstract kills(): number | null

  abstract deaths(): number | null

  abstract assists(): number | null

  abstract damage(): number | null

  abstract teamDamage(): number | null

  abstract damageTaken(): number | null

  abstract score(): number | null

  abstract killDeathRatio(): string | null

  abstract untradedKills(): number | null

  abstract tradedKills(): number | null

  abstract untradedDeaths(): number | null

  abstract tradedDeaths(): number | null

  abstract firstBloods(): number | null

  abstract firstDeaths(): number | null

  abstract victimFovKills(): number | null

  abstract highestStreak(): number | null

  abstract highestMultikill(): number | null

  abstract tacticalsUsed(): number | null

  abstract lethalsUsed(): number | null

  abstract shotsFired(): number | null

  abstract shotsHit(): number | null

  abstract headshots(): number | null

  abstract longshots(): number | null

  abstract wallbangs(): number | null

  abstract averageSpeed(): number | null

  abstract percentTimeMoving(): number | null

  abstract distanceTraveled(): number | null

  abstract ctrlCaptures(): number | null

  abstract ctrlTicks(): number | null

  abstract sndAces(): number | null

  abstract sndPlants(): number | null

  abstract sndDefuses(): number | null

  abstract sndNinjaDefuses(): number | null

  abstract sndDefuserKills(): number | null

  abstract sndPlanterKills(): number | null

  abstract sndSnipes(): number | null

  abstract snd1v1Wins(): number | null

  abstract snd1v2Wins(): number | null

  abstract snd1v3Wins(): number | null

  abstract snd1v4Wins(): number | null

  abstract hpHillTime(): number | null

  abstract hpContestTime(): number | null
}

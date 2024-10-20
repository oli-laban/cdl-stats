import MatchData from '../data/MatchData.js'
import { Game, Match, Tournament, Map, Mode } from '@prisma/client'
import { externalIdField, IdType, prisma } from '../lib/prisma/index.js'
import TeamData from '../data/TeamData.js'
import { syncPlayer, syncTeam } from './teams.js'
import GameData from '../data/GameData.js'
import PlayerResultData from '../data/PlayerResultData.js'
import { logInfo, logVerbose } from '../lib/logger.js'

let modes: Mode[] = []

const getMode = async (shortName: string): Promise<Mode> => {
  if (!modes.length) {
    modes = await prisma.mode.findMany()
  }

  return modes.find((mode) => mode.shortName === shortName)
}

function getTeamId(team: TeamData): Promise<number | null>
function getTeamId(team: number, idType: IdType): Promise<number | null>

async function getTeamId(team: TeamData | number, idType: IdType = null): Promise<number | null> {
  if (!team) {
    return null
  }

  let dbTeam = await prisma.team.findFirst({
    select: { id: true },
    where: {
      name: typeof team !== 'number' ? { equals: team.name(), mode: 'insensitive' } : undefined,
      ...(typeof team === 'number' ? externalIdField(idType, team) : externalIdField(team.idType(), team.id())),
    },
  })

  if (dbTeam) {
    if (typeof team !== 'number' && !dbTeam[team.idType() === 'CDL' ? 'cdl_id' : 'bp_id']) {
      dbTeam = await prisma.team.update({
        where: { id: dbTeam.id },
        data: externalIdField(team.idType(), team.id()),
      })
    }

    return dbTeam.id
  }

  if (typeof team === 'number') {
    throw new Error(`No team found with external id "${team}".`)
  }

  dbTeam = await syncTeam(team)

  return dbTeam.id
}

const syncPlayerResult = async (
  playerResult: PlayerResultData,
  idType: IdType,
  match: Match,
  game?: Game,
): Promise<void> => {
  logInfo(`Syncing result for player "${playerResult.player().name()}".`, true)
  logInfo(`- match ${match.id}${game ? ` / game ${game.id}` : ''}`, true)

  const teamId = await getTeamId(playerResult.team(), idType)
  const player = await syncPlayer(playerResult.player())

  const dbPlayerResult = await prisma.playerResult.findFirst({
    where: {
      playerId: player.id,
      matchId: match.id,
      gameId: game?.id || null,
    },
  })

  const commonData = {
    kills: playerResult.kills() ?? undefined,
    deaths: playerResult.deaths() ?? undefined,
    assists: playerResult.assists() ?? undefined,
    damage: playerResult.damage() ?? undefined,
    teamDamage: playerResult.teamDamage() ?? undefined,
    damageTaken: playerResult.damageTaken() ?? undefined,
    score: playerResult.score() ?? undefined,
    killDeathRatio: playerResult.killDeathRatio() ?? undefined,
    untradedKills: playerResult.untradedKills() ?? undefined,
    tradedKills: playerResult.tradedKills() ?? undefined,
    untradedDeaths: playerResult.untradedDeaths() ?? undefined,
    tradedDeaths: playerResult.tradedDeaths() ?? undefined,
    firstBloods: playerResult.firstBloods() ?? undefined,
    victimFovKills: playerResult.victimFovKills() ?? undefined,
    highestStreak: playerResult.highestStreak() ?? undefined,
    highestMultikill: playerResult.highestMultikill() ?? undefined,
    tacticalsUsed: playerResult.tacticalsUsed() ?? undefined,
    lethalsUsed: playerResult.lethalsUsed() ?? undefined,
    shotsFired: playerResult.shotsFired() ?? undefined,
    shotsHit: playerResult.shotsHit() ?? undefined,
    headshots: playerResult.headshots() ?? undefined,
    longshots: playerResult.longshots() ?? undefined,
    wallbangs: playerResult.wallbangs() ?? undefined,
    averageSpeed: playerResult.averageSpeed() ?? undefined,
    percentTimeMoving: playerResult.percentTimeMoving() ?? undefined,
    distanceTraveled: playerResult.distanceTraveled() ?? undefined,
    ctrlCaptures: playerResult.ctrlCaptures() ?? undefined,
    ctrlTicks: playerResult.ctrlTicks() ?? undefined,
    sndAces: playerResult.sndAces() ?? undefined,
    sndPlants: playerResult.sndPlants() ?? undefined,
    sndDefuses: playerResult.sndDefuses() ?? undefined,
    sndNinjaDefuses: playerResult.sndNinjaDefuses() ?? undefined,
    sndDefuserKills: playerResult.sndDefuserKills() ?? undefined,
    sndPlanterKills: playerResult.sndPlanterKills() ?? undefined,
    hpHillTime: playerResult.hpHillTime() ?? undefined,
    hpContestTime: playerResult.hpContestTime() ?? undefined,
  }

  if (dbPlayerResult) {
    logVerbose('Result found. Updating result details.')

    await prisma.playerResult.updateMany({
      where: {
        playerId: player.id,
        matchId: match.id,
        gameId: game?.id || null,
      },
      data: commonData,
    })
  } else {
    logVerbose('Result not found. Creating result.')

    await prisma.playerResult.create({
      data: {
        playerId: player.id,
        matchId: match.id,
        gameId: game?.id || null,
        teamId,
        ...commonData,
      },
    })
  }
}

const syncGameResult = async (gameId: number, team: number, score: number, idType: IdType): Promise<void> => {
  logInfo(`Syncing result for game ${gameId} / team id CDL ${team}.`, true)

  const teamId = await getTeamId(team, idType)
  const result = await prisma.gameResult.findFirst({
    where: { gameId, teamId },
  })

  if (result) {
    logVerbose('Result found. Updating Result score.')

    await prisma.gameResult.updateMany({
      where: { gameId, teamId },
      data: { score },
    })
  } else {
    logVerbose('Result not found. Creating result.')

    await prisma.gameResult.create({
      data: {
        gameId,
        teamId,
        score,
      },
    })
  }
}

export const syncGame = async (game: GameData, match: Match, releaseId: number): Promise<Game> => {
  logInfo(`Syncing game ${game.order()} (${game.mode()}).`, true)

  let map: Map | null = null

  if (game.map()) {
    map = await prisma.map.findFirst({ where: { name: game.map(), releaseId } })

    if (!map) {
      logVerbose(`Map "${map.name}" not found. Creating map.`)

      map = await prisma.map.create({ data: { name: game.map(), releaseId } })
    }
  }

  const mode = await getMode(game.mode())
  const commonData = {
    modeId: mode.id,
    mapId: map?.id || undefined,
    order: game.order(),
    winnerId: await getTeamId(game.winner(), game.idType()),
    forfeited: game.forfeited(),
  }

  const idField =
    game.idType() === 'CDL' ? ({ cdlId: game.id() } as { cdlId: number }) : ({ bpId: game.id() } as { bpId: string })

  const dbGame = await prisma.game.upsert({
    where: idField,
    create: {
      ...idField,
      matchId: match.id,
      ...commonData,
    },
    update: commonData,
  })

  if (game.team1()) {
    logVerbose('Syncing team 1 game result.')

    await syncGameResult(dbGame.id, game.team1(), game.team1Score(), game.idType())
  }

  if (game.team2()) {
    logVerbose('Syncing team 2 game result.')

    await syncGameResult(dbGame.id, game.team2(), game.team2Score(), game.idType())
  }

  for (const [index, player] of game.players().entries()) {
    logVerbose(`Syncing game player result ${index + 1} of ${game.players().length}.`)

    await syncPlayerResult(player, game.idType(), match, dbGame)
  }

  return dbGame
}

export const syncMatch = async (match: MatchData, tournament?: Tournament): Promise<Match> => {
  logInfo(`Syncing match ${match.team1().abbreviation()} vs ${match.team2().abbreviation()} (${match.date()})`, true)

  const idType = match.idType() === 'CDL' ? 'cdlId' : 'bpId'
  let dbMatch = await prisma.match.findFirst({
    where: { [idType]: match.id() },
  })

  const team1Id = await getTeamId(match.team1())
  const team2Id = await getTeamId(match.team2())
  const winnerId = await getTeamId(match.winner())

  const commonData = {
    team1Id,
    team2Id,
    winnerId,
    team1Score: match.team1Score(),
    team2Score: match.team2Score(),
    format: match.format(),
    status: match.status(),
    forfeited: match.forfeited(),
    date: match.date(),
    cdlUrl: match.idType() === 'CDL' ? match.cdlUrl() : undefined,
    bpUrl: match.idType() === 'BP' ? match.bpUrl() : undefined,
    vodUrl: match.vodUrl() || undefined,
    streamUrl: match.streamUrl() || undefined,
  }

  if (dbMatch) {
    logVerbose('Match found. Updating match details.')

    dbMatch = await prisma.match.update({
      where: externalIdField(match.idType(), match.id()),
      data: commonData,
    })
  } else {
    if (tournament) {
      logVerbose('Match not found. Creating match.')

      dbMatch = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          ...externalIdField(match.idType(), match.id()),
          ...commonData,
        },
      })
    } else {
      throw new Error('Cannot create match without tournament.')
    }
  }

  if (!tournament) {
    tournament = await prisma.tournament.findFirst({ where: { id: dbMatch.tournamentId } })
  }

  for (const [index, game] of match.games().entries()) {
    if (!tournament) {
      throw new Error('Cannot sync game without tournament.')
    }

    logVerbose(`Syncing game ${index + 1} of ${match.games().length}.`)

    await syncGame(game, dbMatch, tournament.releaseId)
  }

  for (const [index, player] of match.players().entries()) {
    logVerbose(`Syncing match player result ${index + 1} of ${match.players().length}.`)

    await syncPlayerResult(player, match.idType(), dbMatch)
  }

  return dbMatch
}

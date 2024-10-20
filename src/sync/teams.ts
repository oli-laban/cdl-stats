import TeamData from '../data/TeamData.js'
import { Player, PrismaClient, Team } from '@prisma/client'
import PlayerData from '../data/PlayerData.js'
import { externalIdField } from '../lib/prisma/index.js'
import { logInfo, logVerbose } from '../lib/logger.js'

const prisma = new PrismaClient()

export const syncPlayer = async (player: PlayerData, noUpdate: boolean = false): Promise<Player> => {
  logInfo(`Syncing player "${player.name()}".`, true)

  const externalId = externalIdField(player.idType(), player.id())
  const commonData = {
    name: player.name(),
    fullName: player.fullName() || undefined,
    country: player.country() || undefined,
    twitterUrl: player.twitterUrl() || undefined,
    twitchUrl: player.twitchUrl() || undefined,
    youtubeUrl: player.youtubeUrl() || undefined,
    ...externalId,
  }

  const syncUsing = player.syncUsing()
  let where: { cdlId: number } | { bpId: number } | { name: { mode: 'insensitive'; equals: string } }

  if (syncUsing === 'name') {
    logVerbose('Syncing player using name.')

    where = { name: { mode: 'insensitive', equals: player.name() } }
  } else {
    logVerbose(`Syncing player using external id ${player.idType()} ${player.id()}.`)

    where = externalId
  }

  let dbPlayer = await prisma.player.findFirst({ where })

  if (!dbPlayer) {
    logVerbose('Player not found. Creating player.')

    dbPlayer = await prisma.player.create({
      data: {
        ...externalId,
        ...commonData,
      },
    })
  } else if (!noUpdate) {
    logVerbose('Player found. Updating player details.')

    await prisma.player.updateMany({
      where,
      data: {
        ...commonData,
        ...(!dbPlayer[player.idType() === 'CDL' ? 'cdl_id' : 'bp_id']
          ? externalIdField(player.idType(), player.id())
          : {}),
      },
    })

    dbPlayer = await prisma.player.findFirst({ where })
  } else {
    logVerbose('Player found. Skipping update.')
  }

  return dbPlayer
}

export const syncTeam = async (team: TeamData): Promise<Team> => {
  logInfo(`Syncing team "${team.name()}"`, true)

  const commonData = {
    abbreviation: team.abbreviation() || undefined,
  }

  for (const [index, player] of team.players().entries()) {
    logVerbose(`Syncing player ${index + 1} of ${team.players().length}.`)

    await syncPlayer(player)
  }

  // Using name to find existing team as both the CDL and BP use the same id for teams that have changed names
  // e.g. Dallas Empire -> OpTic Texas.
  let dbTeam = await prisma.team.findFirst({
    where: { name: { equals: team.name(), mode: 'insensitive' } },
  })

  if (dbTeam) {
    logVerbose('Team found. Updating team details.')

    dbTeam = await prisma.team.update({
      where: { id: dbTeam.id },
      data: {
        ...commonData,
        ...(!dbTeam[team.idType() === 'CDL' ? 'cdl_id' : 'bp_id'] ? externalIdField(team.idType(), team.id()) : {}),
      },
    })
  } else {
    logVerbose('Team not found. Creating team.')

    dbTeam = await prisma.team.create({
      data: {
        name: team.name(),
        ...externalIdField(team.idType(), team.id()),
        ...commonData,
      },
    })
  }

  return dbTeam
}

export const syncTeams = async (teams: TeamData[]): Promise<void> => {
  for (const team of teams) {
    await syncTeam(team)
  }
}

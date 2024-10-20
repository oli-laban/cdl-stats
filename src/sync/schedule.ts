import { BracketSlot, Match, Prisma, PrismaClient, Release, Season, Split, Tournament } from '@prisma/client'
import SeasonData from '../data/SeasonData.js'
import SplitData from '../data/SplitData.js'
import TournamentData from '../data/TournamentData.js'
import BracketSlotData from '../data/BracketSlotData.js'
import { getJsonFromFile } from '../util.js'
import { syncMatch } from './match.js'
import { externalIdField } from '../lib/prisma/index.js'
import { logInfo, logVerbose } from '../lib/logger.js'

interface BracketMap {
  [position: string]: {
    W: string | null
    L: string | null
  }
}

const prisma = new PrismaClient()

let releases: Release[] = []

const getReleases = async (): Promise<Release[]> => {
  if (releases.length) {
    return releases
  }

  releases = await prisma.release.findMany()

  return releases
}

const getBracketMapKey = (slot: BracketSlot): string => {
  let key = slot.shortRoundName

  if (key !== 'WF' && key !== 'LF' && key !== 'GF') {
    key += `-${slot.position}`
  }

  return key
}

const createBracketHierarchyFromMap = async (slots: BracketSlot[], filename: string): Promise<void> => {
  logInfo(`Creating bracket hierarchy from map file "${filename}".`, true)

  const map = await getJsonFromFile<BracketMap>(`bracketMaps/${filename}`)

  for (const slot of slots) {
    const key = getBracketMapKey(slot)

    if (map[key]) {
      const nextWinnerSlotId = slots.find((_slot) => getBracketMapKey(_slot) === map[key].W)?.id
      const nextLoserSlotId = slots.find((_slot) => getBracketMapKey(_slot) === map[key].L)?.id

      logVerbose(`Matched slot ${slot.id} (${slot.shortRoundName} ${slot.position})`)
      logVerbose(`- Winner ${nextWinnerSlotId || 'N/A'} - Loser ${nextLoserSlotId || 'N/A'}`)

      await prisma.bracketSlot.update({
        where: { id: slot.id },
        data: {
          nextWinnerSlotId,
          nextLoserSlotId,
        },
      })
    } else {
      throw new Error(`No key "${key}" found in bracket map file "${filename}".`)
    }
  }
}

const createBracketHierarchy = async (slots: BracketSlot[]): Promise<void> => {
  logInfo('Creating bracket hierarchy.', true)

  const roundMap = slots.reduce(
    (accumulator, slot) => {
      const { type, shortRoundName } = slot

      if (!accumulator[type][shortRoundName]) accumulator[type][shortRoundName] = []

      accumulator[type][shortRoundName].push(slot)

      return accumulator
    },
    { UPPER: {}, LOWER: {} },
  )

  function getRoundSortValue(round: string): number {
    if (round === 'GF') {
      return Infinity
    }

    if (round === 'WF' || round === 'LF') {
      return 10000
    }

    const match = round.match(/[WL]R(\d+)/)

    return match ? parseInt(match[1]) : 0
  }

  const sortedUpperRounds = Object.keys(roundMap.UPPER).sort((a, b) => getRoundSortValue(a) - getRoundSortValue(b))

  const sortedLowerRounds = Object.keys(roundMap.LOWER).sort((a, b) => getRoundSortValue(a) - getRoundSortValue(b))

  const dropOffset = Math.max(1, sortedLowerRounds.length - sortedUpperRounds.length + 1)

  slots.forEach((slot) => {
    const round = slot.shortRoundName
    const rounds = slot.type === 'UPPER' ? sortedUpperRounds : sortedLowerRounds
    const currentRoundIndex = rounds.indexOf(round)

    if (round === 'GF') {
      slot.nextWinnerSlotId = null
    } else if (round === 'WF' || round === 'LF') {
      slot.nextWinnerSlotId = roundMap.UPPER['GF'][0].id
    } else {
      const nextRound = rounds[currentRoundIndex + 1]

      if (nextRound) {
        const nextRoundSlots = roundMap[slot.type][nextRound]
        let nextSlotIndex: number

        if (slot.type === 'LOWER') {
          const currentRoundSlots = roundMap['LOWER'][round]
          const numCurrentRoundSlots = currentRoundSlots.length
          const numNextRoundSlots = nextRoundSlots.length

          if (numCurrentRoundSlots === numNextRoundSlots) {
            nextSlotIndex = slot.position - 1
          } else if (numNextRoundSlots === numCurrentRoundSlots / 2) {
            nextSlotIndex = Math.floor((slot.position - 1) / 2)
          } else {
            nextSlotIndex = Math.floor(((slot.position - 1) * numNextRoundSlots) / numCurrentRoundSlots)
          }
        } else {
          nextSlotIndex = Math.floor((slot.position - 1) / 2)
        }

        slot.nextWinnerSlotId = nextRoundSlots[nextSlotIndex].id
      } else {
        slot.nextWinnerSlotId = roundMap[slot.type][slot.type === 'UPPER' ? 'WF' : 'LF'][0].id
      }
    }

    if (round === 'GF' || slot.type === 'LOWER' || !sortedLowerRounds.length) {
      slot.nextLoserSlotId = null
    } else {
      const lowerRoundIndex = Math.min(currentRoundIndex + dropOffset, sortedLowerRounds.length - 1)
      const lowerRound = sortedLowerRounds[lowerRoundIndex]

      if (lowerRound) {
        const lowerRoundSlots = roundMap.LOWER[lowerRound]
        const targetPosition = Math.floor(lowerRoundSlots.length / 2) + Math.floor((slot.position - 1) / 2)

        slot.nextLoserSlotId = lowerRoundSlots[Math.min(targetPosition, lowerRoundSlots.length - 1)].id
      } else {
        slot.nextLoserSlotId = roundMap.LOWER['LF'][0].id
      }
    }
  })

  for (const slot of slots) {
    logVerbose(`Matched slot ${slot.id} (${slot.shortRoundName} ${slot.position})`)
    logVerbose(`- Winner ${slot.nextWinnerSlotId || 'N/A'} - Loser ${slot.nextLoserSlotId || 'N/A'}`)

    await prisma.bracketSlot.update({
      where: { id: slot.id },
      data: {
        nextWinnerSlotId: slot.nextWinnerSlotId,
        nextLoserSlotId: slot.nextLoserSlotId,
      },
    })
  }
}

const createBracketSlot = async (slot: BracketSlotData, tournament: Tournament, match: Match): Promise<BracketSlot> => {
  console.log(`Slot: ${slot.shortRoundName()}-${slot.position()}, ${slot.match().id()} (CDL ID)`)
  logInfo(`Creating bracket slot ${slot.shortRoundName()} ${slot.position()}.`)

  return prisma.bracketSlot.create({
    data: {
      tournamentId: tournament.id,
      matchId: match.id,
      round: slot.round(),
      shortRoundName: slot.shortRoundName(),
      roundName: slot.roundName(),
      position: slot.position(),
      type: slot.type(),
    },
  })
}

export const syncTournament = async (
  tournament: TournamentData,
  split: Split = null,
  groupParent: Tournament = null,
): Promise<Tournament> => {
  logInfo(`Syncing${groupParent ? ' group ' : ' '}tournament "${tournament.name()}".`, true)

  const release = (await getReleases()).find((_release) => _release.abbreviation === tournament.release())

  let dbTournament: Prisma.TournamentGetPayload<{ include: { bracketSlots: true } }>

  if (tournament.id()) {
    logVerbose(`Tournament has id. Finding tournament by ${tournament.idType()} ${tournament.id()}.`)

    dbTournament = await prisma.tournament.findFirst({
      where: { ...externalIdField(tournament.idType(), tournament.id()) },
      include: { bracketSlots: true },
    })
  }

  if (!dbTournament) {
    logVerbose('Finding tournament by name.')

    dbTournament = await prisma.tournament.findFirst({
      where: {
        name: tournament.name(),
        splitId: split?.id || undefined,
        releaseId: groupParent ? groupParent.releaseId : release?.id || undefined,
        groupPlayParentId: groupParent ? groupParent.id : undefined,
      },
      include: { bracketSlots: true },
    })
  }

  const commonData = {
    startDate: tournament.startDate(),
    endDate: tournament.endDate(),
    splitType: tournament.splitType(),
    format: tournament.format(),
    bracketType: tournament.bracketType(),
    hasGroupPlay: tournament.hasGroupPlay(),
    ...externalIdField(tournament.idType(), tournament.id()),
  }

  if (dbTournament) {
    logVerbose('Tournament found. Updating tournament details.')

    dbTournament = await prisma.tournament.update({
      where: { id: dbTournament.id },
      data: commonData,
      include: { bracketSlots: true },
    })
  } else {
    logVerbose('Tournament not found. Creating tournament.')

    dbTournament = await prisma.tournament.create({
      data: {
        name: tournament.name(),
        splitId: split?.id || undefined,
        isGroupPlay: tournament.isGroupPlay(),
        groupPlayParentId: groupParent?.id || undefined,
        releaseId: groupParent ? groupParent.releaseId : release?.id || undefined,
        ...commonData,
      },
      include: { bracketSlots: true },
    })
  }

  for (const [index, match] of tournament.matches().entries()) {
    logVerbose(`Syncing match ${index + 1} of ${tournament.matches().length}.`)

    await syncMatch(match, dbTournament)
  }

  const alreadySyncedBracketSlots = !!dbTournament.bracketSlots.length
  const bracketSlots = []

  for (const [index, bracketSlot] of tournament.bracketSlots().entries()) {
    logVerbose(`Syncing bracket match ${index + 1} of ${tournament.bracketSlots().length}.`)

    const match = await syncMatch(bracketSlot.match(), dbTournament)

    if (!alreadySyncedBracketSlots) {
      bracketSlots.push(await createBracketSlot(bracketSlot, dbTournament, match))
    } else {
      logVerbose('Bracket slot already created.')
    }
  }

  if (!alreadySyncedBracketSlots && tournament.format() === 'BRACKET') {
    if (tournament.bracketMapFile()) {
      await createBracketHierarchyFromMap(bracketSlots, tournament.bracketMapFile())
    } else {
      await createBracketHierarchy(bracketSlots)
    }
  }

  for (const [index, group] of tournament.groups().entries()) {
    logVerbose(`Syncing group ${index + 1} of ${tournament.groups().length}.`)

    await syncTournament(group, split, dbTournament)
  }

  return dbTournament
}

const syncSplit = async (split: SplitData, season: Season): Promise<void> => {
  logInfo(`Syncing split "${split.name()}".`, true)

  let dbSplit = await prisma.split.findFirst({ where: { name: split.name() } })

  if (!dbSplit) {
    logVerbose('Split not found. Creating split.')

    dbSplit = await prisma.split.create({
      data: {
        name: split.name(),
        seasonId: season.id,
      },
    })
  }

  for (const [index, tournament] of split.tournaments().entries()) {
    logVerbose(`Syncing tournament ${index + 1} of ${split.tournaments().length}.`)

    await syncTournament(tournament, dbSplit)
  }
}

export const syncSeason = async (season: SeasonData): Promise<Season> => {
  logInfo(`Syncing season "${season.name()}".`, true)

  let dbSeason = await prisma.season.findFirst({ where: { name: season.name() } })

  if (!dbSeason) {
    logVerbose('Season not found. Creating season.')

    const release = (await getReleases()).find((_release) => _release.abbreviation === season.release())

    dbSeason = await prisma.season.create({
      data: {
        name: season.name(),
        year: season.year(),
        releaseId: release.id,
      },
    })
  }

  for (const [index, split] of season.splits().entries()) {
    logVerbose(`Syncing split ${index + 1} of ${season.splits().length}.`)

    await syncSplit(split, dbSeason)
  }

  return dbSeason
}

export const syncSchedule = async (seasons: SeasonData[]): Promise<Season[]> => {
  const dbSeasons: Season[] = []

  logInfo(`Syncing schedule with ${seasons.length} season(s).`, true)

  for (const [index, season] of seasons.entries()) {
    logVerbose(`Syncing season ${index + 1} of ${seasons.length}.`)

    dbSeasons.push(await syncSeason(season))
  }

  return dbSeasons
}

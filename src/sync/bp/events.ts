import { program } from 'commander'
import ProgressBar from 'cli-progress'
import { getEvents } from '../../data/bp/events.js'
import { logError, logInfo, logNewline, logVerbose, logWithoutNewline, setVerbose } from '../../lib/logger.js'
import { syncTournament } from '../schedule.js'
import { prisma } from '../../lib/prisma/index.js'
import { Prisma } from '@prisma/client'
import MatchData from '../../data/MatchData.js'
import TournamentData from '../../data/TournamentData.js'
import { parseIntArrayOption } from '../../util.js'
import { syncMatch } from '../match.js'

// There are two things happening here:
//
// 1. Fully sync any NON-CDL events. There is no reliable way to match BP events to CDL events as the titles
//    can be completely different such as in the 2021 season where the CDL have "X Home Series" and BP simply call them
//    "Major X Qualifiers". They also can't be matched using start time, even with a generous buffer as, again
//    with the 2021 season, the CDL split the qualifiers into 3 separate home series and BP combines these.
//
// 2. Add BP ids to CDL tournament matches so that the matches can be synced, even if the tournament can't.

program
  .option('-v --verbose', 'Enable verbose logging')
  .option('--bp-id [ids...]', 'Only process the provided BP ids', parseIntArrayOption)
  .option('--non-cdl-events-only', 'Sync non-CDL events without adding BP ids to CDL matches')
  .option('--cdl-matches-only', 'Add BP ids to CDL matches without syncing non-CDL events')

program.parse(process.argv)

const options = program.opts()

if (options.verbose) {
  setVerbose(true)
}

// Any CDL tournament matches missing from CDL data. These matches will be created from the BP data.
// There isn't a great way to identify the db tournaments other than narrowing down by name.
const cdlMissingMatches: { [bpId: number]: CdlMissingMatchDetails } = {
  23326: {
    tournamentName: 'Major III Qualifiers',
    splitName: 'TORONTO ULTRA Major 3',
    seasonName: '2022 Season',
  },
}

const allEvents = await getEvents(options.bpId || [])

if (!options.cdlMatchesOnly) {
  await syncNonCdlEvents()
}

if (!options.nonCdlEventsOnly) {
  await addBpIdsToMatches()
}

logNewline()
logInfo('Done.')

async function syncNonCdlEvents(): Promise<void> {
  logInfo('Fetching non-CDL bp events.')

  const events = allEvents.filter((event) => !event.name().startsWith('CDL'))

  logNewline(true)
  logInfo(`Syncing ${events.length} events.`)

  for (const event of events) {
    logNewline(true)

    await syncTournament(event)
  }

  logNewline()

  logInfo('Non-cdl events synced.')
}

interface CdlMissingMatchDetails {
  tournamentName: string
  splitName: string
  seasonName: string
}

async function addBpIdsToMatches(): Promise<void> {
  logInfo('Applying BP ids to CDL matches.')

  // Get all matches without BP ids so they can be skipped
  const matchesWithBpIds = await prisma.match.findMany({
    select: { bpId: true },
    where: { NOT: { bpId: null } },
  })
  const existingBpIds = matchesWithBpIds.map((match) => match.bpId)

  const cdlEvents = allEvents.filter((event) => event.name().startsWith('CDL'))

  logInfo(`${cdlEvents.length} CDL events fetched.`)
  logNewline(true)

  const skippedMatches: { id: number; reason: string }[] = []
  let progress: ProgressBar.SingleBar | null = null

  if (!options.verbose) {
    progress = new ProgressBar.SingleBar(
      { format: '{bar} {percentage}% | ETA: {eta_formatted} | {value}/{total}' },
      ProgressBar.Presets.shades_classic,
    )
  }

  progress?.start(cdlEvents.length, 0)

  const addBpIdToMatch = async (match: MatchData, bracketRound: string = null): Promise<void> => {
    let skipReason: string | null = null

    if (existingBpIds.includes(match.id())) {
      logVerbose('BP id already added.')

      return
    }

    if (cdlMissingMatches[match.id()]) {
      logVerbose('Creating placeholder for missing cdl match...')

      try {
        await createMissingCdlMatch(match, cdlMissingMatches[match.id()])

        return
      } catch (e) {
        logWithoutNewline('- ')

        skipReason = e.message
      }
    }

    if (!match.team1() || !match.team2()) {
      skipReason = 'Incomplete match'
    }

    if (skipReason) {
      logVerbose('Skipping.')

      skippedMatches.push({ id: match.id(), reason: skipReason })

      return
    }

    logVerbose(`${match.team1().abbreviation()} vs ${match.team2().abbreviation()} (${match.date()}).`)

    let foundMatches: FoundMatches = []

    if (bracketRound) {
      logVerbose('- Using bracket position.')

      foundMatches = await findMatch(match, bracketRound)
    }

    if (!foundMatches.length) {
      logVerbose('- Using match date/time.')

      foundMatches = await findMatch(match)
    }

    if (!foundMatches.length) {
      skipReason = 'Failed to find match'
    }

    if (foundMatches.length > 1) {
      skipReason = 'Multiple possible matches found'
    }

    if (skipReason) {
      logVerbose(`- ${skipReason}. Skipping.`)

      skippedMatches.push({ id: match.id(), reason: skipReason })

      return
    }

    await prisma.match.update({
      where: { id: foundMatches[0].id },
      data: { bpId: match.id() },
    })

    logVerbose('- BP id added to match.')
  }

  const addBpIdsToTournamentMatches = async (tournament: TournamentData): Promise<void> => {
    for (const [index, match] of tournament.matches().entries()) {
      logWithoutNewline(`Match ${index + 1} of ${tournament.matches().length}: `, true)

      await addBpIdToMatch(match)
    }

    for (const [index, slot] of tournament.bracketSlots().entries()) {
      const positionText = `${slot.shortRoundName()}-${slot.position()}`

      logWithoutNewline(`Bracket match ${index + 1} of ${tournament.bracketSlots().length} (${positionText}): `, true)

      await addBpIdToMatch(slot.match(), slot.shortRoundName())
    }

    for (const group of tournament.groups()) {
      await addBpIdsToTournamentMatches(group)
    }
  }

  for (const event of cdlEvents) {
    logInfo(`Processing matches for "${event.name()}" (BP ${event.id()}).`, true)
    logVerbose(`${event.matches().length} matches found.`)

    await addBpIdsToTournamentMatches(event)

    progress?.increment()
  }

  progress?.stop()

  if (skippedMatches.length) {
    logNewline()
    logError(`${skippedMatches.length} matches were skipped:`)

    for (const skippedMatch of skippedMatches) {
      logError(`- ${skippedMatch.id}: ${skippedMatch.reason}`)
    }
  }
}

type FoundMatches = Prisma.MatchGetPayload<{ select: { id: true; bpId: true } }>[]

async function findMatch(match: MatchData, bracketRound: string = null): Promise<FoundMatches> {
  // A generous buffer can be used as there's never been an instance of 2 CDL teams matching up more than
  // once in 24 hours (except in brackets but that's accounted for with bracketRound).
  const dateBufferHours = 24

  const minDate = new Date(match.date().getTime())
  const maxDate = new Date(match.date().getTime())

  minDate.setHours(minDate.getHours() - dateBufferHours)
  maxDate.setHours(maxDate.getHours() + dateBufferHours)

  return await prisma.match.findMany({
    select: { id: true, bpId: true },
    where: {
      OR: [
        {
          team1: { name: { equals: match.team1().name(), mode: 'insensitive' } },
          team2: { name: { equals: match.team2().name(), mode: 'insensitive' } },
        },
        {
          team1: { name: { equals: match.team2().name(), mode: 'insensitive' } },
          team2: { name: { equals: match.team1().name(), mode: 'insensitive' } },
        },
      ],
      AND: [{ date: { gte: minDate } }, { date: { lte: maxDate } }],
      bracketSlot: bracketRound ? { shortRoundName: bracketRound } : undefined,
    },
  })
}

async function createMissingCdlMatch(match: MatchData, details: CdlMissingMatchDetails): Promise<void> {
  const split = await prisma.split.findFirst({
    where: {
      name: details.splitName,
      season: {
        name: details.seasonName,
      },
    },
  })

  if (!split) {
    throw new Error('Could not fetch split from missing match details.')
  }

  const tournament = await prisma.tournament.findFirst({
    where: { name: details.tournamentName, splitId: split.id },
  })

  if (!tournament) {
    throw new Error('Could not fetch tournament from missing match details.')
  }

  await syncMatch(match, tournament)

  logVerbose('- Match created.')
}

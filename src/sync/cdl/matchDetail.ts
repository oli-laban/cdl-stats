import { program } from 'commander'
import ProgressBar from 'cli-progress'
import { getMatchDetail } from '../../data/cdl/matchDetail.js'
import { prisma } from '../../lib/prisma/index.js'
import { parseIntArrayOption, wait } from '../../util.js'
import { syncMatch } from '../match.js'
import { isVerbose, logError, logInfo, logNewline, logVerbose, setVerbose } from '../../lib/logger.js'

// No match detail for the following seasons (pages throw 404 or 500 errors).
const ignoreSeasons = [2021, 2022]

program
  .option('--all', 'Retrieve for all matches')
  .option('--cdl-id [ids...]', 'Retrieve for the provided CDL id(s)', parseIntArrayOption)
  .option('--id [ids...]', 'Retrieve for the provided id(s)', parseIntArrayOption)
  .option('--tournament-id [ids...]', 'Retrieve for the provided tournament id(s)', parseIntArrayOption)
  .option('--only-unsynced', 'Skip matches that have previously been synced')
  .option('-v --verbose', 'Enable verbose logging')

program.parse(process.argv)

const options = program.opts()

if (!options.all && !options.cdlId.length && !options.id.length && !options.tournamentId.length) {
  throw new Error('Specify at least one of --all, --cdl-id, --id or --tournament-id.')
}

if (options.verbose) {
  setVerbose(true)
}

let ids: number[]

if (options.all) {
  const dbMatches = await prisma.match.findMany({
    select: { cdlId: true },
    where: {
      tournament: {
        split: {
          season: {
            year: {
              notIn: ignoreSeasons,
            },
          },
        },
      },
      cdlId: { not: null },
      lastCdlSync: options.onlyUnsynced ? null : undefined,
    },
  })

  if (!dbMatches.length) {
    logError('No matches found with a cdl_id.')

    process.exit(1)
  }

  ids = dbMatches.map((match) => match.cdlId)
} else {
  ids = []

  if (options.cdlId) {
    ids.push(...options.cdlId)
  }

  if (options.id) {
    for (const id of options.id) {
      const dbMatch = await prisma.match.findFirst({
        select: { cdlId: true },
        where: { id },
      })

      if (!dbMatch) {
        logError(`Match "${id}" not found in DB.`)

        process.exit(1)
      }

      if (!dbMatch.cdlId) {
        logError(`No cdl_id on match "${id}".`)

        process.exit(1)
      }

      ids.push(dbMatch.cdlId)
    }
  }

  if (options.tournamentId) {
    for (const tournamentId of options.tournamentId) {
      const tournamentDbMatches = await prisma.match.allTournamentMatches(tournamentId)

      if (!tournamentDbMatches) {
        logError(`Tournament "${tournamentId}" not found in DB.`)

        process.exit(1)
      }

      const matchesWithCdlId = tournamentDbMatches.filter((match) => !!match.cdlId)

      if (!matchesWithCdlId.length) {
        logError(`No matches found for tournament "${tournamentId}" with a cdl_id.`)

        process.exit(1)
      }

      ids.push(...matchesWithCdlId.map((match) => match.cdlId))
    }
  }
}

logInfo(`Syncing ${ids.length} matches.`)

let progress: ProgressBar.SingleBar | null = null

if (!isVerbose() && ids.length > 1) {
  logNewline()

  progress = new ProgressBar.SingleBar(
    { format: '{bar} {percentage}% | ETA: {eta_formatted} | {value}/{total}' },
    ProgressBar.Presets.shades_classic,
  )
}

progress?.start(ids.length, 0)

let count = 1
const errors: { id: number; message: string }[] = []

for (const id of ids) {
  try {
    const match = await getMatchDetail(id)

    await syncMatch(match)

    await prisma.match.update({
      where: { cdlId: match.id() },
      data: { lastCdlSync: new Date() },
    })
  } catch (e) {
    logError(e.message, true)

    errors.push({ id, message: e.message })
  }

  progress?.increment()

  logVerbose(`${count} of ${ids.length} done.`)

  count++

  // Pause to avoid spamming the site. syncMatch() will have already taken a little bit of time.
  await wait(500)
}

progress?.stop()

if (errors.length) {
  logNewline()
  logError(`${errors.length} matches were not synced:`)

  for (const error of errors) {
    logError(`- ${error.id}: ${error.message}`)
  }
}

logNewline()
logInfo('Done.')

process.exit()

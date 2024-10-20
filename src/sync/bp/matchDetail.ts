import { program } from 'commander'
import ProgressBar from 'cli-progress'
import { prisma } from '../../lib/prisma/index.js'
import { parseIntArrayOption, wait } from '../../util.js'
import { syncMatch } from '../match.js'
import { isVerbose, logError, logInfo, logNewline, logVerbose, setVerbose } from '../../lib/logger.js'
import { getMatchDetail } from '../../data/bp/matchDetail.js'

program
  .option('--all', 'Retrieve for all matches')
  .option('--bp-id [ids...]', 'Retrieve for the provided BP id(s)', parseIntArrayOption)
  .option('--id [ids...]', 'Retrieve for the provided id(s)', parseIntArrayOption)
  .option('--tournament-id [ids...]', 'Retrieve for the provided tournament id(s)', parseIntArrayOption)
  .option('--only-unsynced', 'Skip matches that have previously been synced')
  .option('-v --verbose', 'Enable verbose logging')

program.parse(process.argv)

const options = program.opts()

if (!options.all && !options.bpId?.length && !options.id?.length && !options.tournamentId?.length) {
  throw new Error('Specify at least one of --all, --bp-id, --id or --tournament-id.')
}

if (options.verbose) {
  setVerbose(true)
}

let ids: number[]

if (options.all) {
  const dbMatches = await prisma.match.findMany({
    select: { bpId: true },
    where: {
      bpId: { not: null },
      lastBpSync: options.onlyUnsynced ? null : undefined,
    },
  })

  if (!dbMatches.length) {
    logError('No matches found with a bp_id.')

    process.exit(1)
  }

  ids = dbMatches.map((match) => match.bpId)
} else {
  ids = []

  if (options.bpId) {
    ids.push(...options.bpId)
  }

  if (options.id) {
    for (const id of options.id) {
      const dbMatch = await prisma.match.findFirst({
        select: { bpId: true },
        where: { id },
      })

      if (!dbMatch) {
        logError(`Match "${id}" not found in DB.`)

        process.exit(1)
      }

      if (!dbMatch.bpId) {
        logError(`No bp_id on match "${id}".`)

        process.exit(1)
      }

      ids.push(dbMatch.bpId)
    }
  }

  if (options.tournamentId) {
    for (const tournamentId of options.tournamentId) {
      const tournamentDbMatches = await prisma.match.allTournamentMatches(tournamentId)

      if (!tournamentDbMatches) {
        logError(`Tournament "${tournamentId}" not found in DB.`)

        process.exit(1)
      }

      const matchesWithBpId = tournamentDbMatches.filter((match) => !!match.bpId)

      if (!matchesWithBpId.length) {
        logError(`No matches found for tournament "${tournamentId}" with a bp_id.`)

        process.exit(1)
      }

      ids.push(...matchesWithBpId.map((match) => match.bpId))
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
  // try {
  const match = await getMatchDetail(id)

  await syncMatch(match)

  await prisma.match.update({
    where: { bpId: match.id() },
    data: { lastBpSync: new Date() },
  })
  // } catch (e) {
  //   logError(e.message, true)
  //
  //   errors.push({ id, message: e.message })
  // }

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

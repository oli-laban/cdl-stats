import { program } from 'commander'
import SeasonData from '../../data/SeasonData.js'
import { Filter, getSchedule, getScheduleFromSaveData } from '../../data/cdl/schedule.js'
import { syncSchedule } from '../schedule.js'

program
  .option('--save-only', 'Retrieve schedule without syncing')
  .option('--from-file', 'Sync previously saved schedule')
  .option('--filter [filters...]', 'Filter the retrieved schedule')

program.parse(process.argv)

const options = program.opts()

let schedule: SeasonData[]

if (options.fromFile) {
  schedule = await getScheduleFromSaveData()
} else {
  schedule = await getSchedule(buildFilterObject())
}

if (!options.saveOnly) {
  await syncSchedule(schedule)
}

process.exit()

function buildFilterObject(): Filter {
  if (!options.filter || !options.filter.length) {
    return {}
  }

  const filters: Filter = {}

  for (const filter of options.filter as string[]) {
    const parts = filter.split('.')
    const [season, stageTab, stageSubTab, tournamentTab] = parts

    if (!filters[season]) {
      filters[season] = '*'
    }

    if (stageTab) {
      if (filters[season] === '*') {
        filters[season] = {}
      }

      const seasonObj = filters[season]

      if (!seasonObj[stageTab]) {
        seasonObj[stageTab] = '*'
      }

      if (stageSubTab) {
        if (seasonObj[stageTab] === '*') {
          seasonObj[stageTab] = {}
        }

        const stageObj = seasonObj[stageTab]

        if (!stageObj[stageSubTab]) {
          stageObj[stageSubTab] = '*'
        }

        if (tournamentTab) {
          if (stageObj[stageSubTab] === '*') {
            stageObj[stageSubTab] = [tournamentTab]
          } else if (Array.isArray(stageObj[stageSubTab])) {
            stageObj[stageSubTab].push(tournamentTab)
          }
        }
      }
    }
  }

  return filters
}

import { program } from 'commander'
import TeamData from '../../data/TeamData.js'
import { getTeams, getTeamsFromSaveData } from '../../data/cdl/teams.js'
import { syncTeams } from '../teams.js'

program
  .option('--save-only', 'Retrieve schedule without syncing')
  .option('--from-file', 'Sync previously saved schedule')
  .option('--filter [filters...]', 'Filter the retrieved schedule')

program.parse(process.argv)

const options = program.opts()

let teams: TeamData[]

if (options.fromFile) {
  teams = await getTeamsFromSaveData()
} else {
  teams = await getTeams()
}

if (!options.saveOnly) {
  await syncTeams(teams)
}

process.exit()

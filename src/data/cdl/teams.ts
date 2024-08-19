import { getTeams as getStaticTeams } from './staticData.js'
import CdlTeam from './responses/CdlTeam.js'
import { getJsonFromFile, saveDataAsJson } from '../../util.js'
import { Team } from './types.js'

export const getTeams = async (): Promise<CdlTeam[]> => {
  const teams = await getStaticTeams()

  await saveDataAsJson('data/cdl_teams_data.json', teams)

  return teams.map((team) => new CdlTeam(team))
}

export const getTeamsFromSaveData = async (): Promise<CdlTeam[]> => {
  const teams = await getJsonFromFile<Team[]>('data/cdl_teams_data.json')

  return teams.map((team) => new CdlTeam(team))
}

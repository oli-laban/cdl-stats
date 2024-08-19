import {
  CdlContainerBlock, CdlMatchDetailBlock,
  GenericBlock,
  SeasonDropdownItem,
  Team,
} from './types.js'
import { fetchNextJsonString } from '../../util.js'

const matchesDataUrl = 'https://callofdutyleague.com/en-us/schedule'
const teamsDataUrl = 'https://callofdutyleague.com/en-us/teams'
const matchDetailUrl = 'https://callofdutyleague.com/en-us/match'

let scheduleData: CdlContainerBlock | null = null
let teamsData: Team[] | null = null

export const getSeasons = async (): Promise<SeasonDropdownItem[]> => {
  console.log(`Fetching static schedule data from ${matchesDataUrl}`)

  if (!scheduleData) {
    const json = await fetchNextJsonString(matchesDataUrl)

    const blocks = JSON.parse(json)?.props?.pageProps?.blocks

    scheduleData = blocks?.find((block: GenericBlock) =>
      Object.prototype.hasOwnProperty.call(block, 'cdlContainerBlockList'),
    )

    if (!scheduleData) {
      throw new Error(
        `Schedule data possibly malformed. Check ${matchesDataUrl} response`,
      )
    }
  }

  return scheduleData.cdlContainerBlockList.items
}

export const getTeams = async (): Promise<Team[]> => {
  if (!teamsData) {
    const json = await fetchNextJsonString(teamsDataUrl)

    teamsData =
      JSON.parse(json)?.props?.pageProps?.blocks?.[1]?.cdlTeamListV3?.teams

    if (!teamsData) {
      throw new Error(
        `Teams data possibly malformed. Check ${teamsDataUrl} response`,
      )
    }
  }

  return teamsData
}

export const getMatchDetail = async (id: number): Promise<CdlMatchDetailBlock> => {
  const json = await fetchNextJsonString(`${matchDetailUrl}/${id}`)

  const blocks = JSON.parse(json)?.props?.pageProps?.blocks

  const matchDetailBlock: CdlMatchDetailBlock = blocks?.find((block: GenericBlock) =>
    Object.prototype.hasOwnProperty.call(block, 'cdlMatchDetail'),
  )

  if (!matchDetailBlock) {
    throw new Error(
      `Match (${id}) data possibly malformed. Check ${matchDetailUrl} response`,
    )
  }

  return matchDetailBlock
}

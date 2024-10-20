import BpMatch from './responses/BpMatch.js'
import { logNewline, logVerbose } from '../../lib/logger.js'
import { getMatchDetailData } from './staticData.js'

export const getMatchDetail = async (id: number): Promise<BpMatch> => {
  logNewline(true)
  logVerbose(`Fetching data for match BP ${id}.`)

  const data = await getMatchDetailData(id)

  return new BpMatch(data)
}

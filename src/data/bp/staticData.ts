import { EventDetail, EventT, MatchWithGames } from './types.js'
import { fetchNextJsonString } from '../../util.js'

const eventsDataUrl = 'https://www.breakingpoint.gg/cdl/events'
const eventDataUrl = 'https://www.breakingpoint.gg/events'
const matchDataUrl = 'https://www.breakingpoint.gg/match'

let eventsData: EventT[]

export const getMatchDetailData = async (id: number): Promise<MatchWithGames> => {
  const json = await fetchNextJsonString(`${matchDataUrl}/${id}`)

  const pageProps = JSON.parse(json)?.props.pageProps

  if (!pageProps || !Object.prototype.hasOwnProperty.call(pageProps, 'match')) {
    throw new Error(`Events data possibly malformed. Check ${matchDataUrl} response`)
  }

  return pageProps.match
}

export const getEventData = async (id: number): Promise<EventDetail> => {
  const json = await fetchNextJsonString(`${eventDataUrl}/${id}`)

  const event = JSON.parse(json)?.props.pageProps

  if (!event || !Object.prototype.hasOwnProperty.call(event, 'event')) {
    throw new Error(`Events data possibly malformed. Check ${eventDataUrl} response`)
  }

  return event
}

export const getEventsData = async (): Promise<EventT[]> => {
  if (eventsData) {
    return eventsData
  }

  const json = await fetchNextJsonString(eventsDataUrl)

  const events = JSON.parse(json)?.props?.pageProps?.events

  if (!Array.isArray(events)) {
    throw new Error(`Events data possibly malformed. Check ${eventsDataUrl} response`)
  }

  return events
}

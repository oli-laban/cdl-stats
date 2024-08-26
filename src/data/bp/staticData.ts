import { EventDetail, EventT } from './types.js'
import { fetchNextJsonString } from '../../util.js'

const eventsDataUrl = 'https://www.breakingpoint.gg/cdl/events'
const eventDataUrl = 'https://www.breakingpoint.gg/events'

let eventsData: EventT[]

export const getEventData = async (id: number): Promise<EventDetail> => {
  const json = await fetchNextJsonString(`${eventDataUrl}/${id}`)

  const event = JSON.parse(json)?.props.pageProps

  if (!event || !Object.prototype.hasOwnProperty.call(event, 'event')) {
    throw new Error(
      `Events data possibly malformed. Check ${eventDataUrl} response`,
    )
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
    throw new Error(
      `Events data possibly malformed. Check ${eventsDataUrl} response`,
    )
  }

  return events
}

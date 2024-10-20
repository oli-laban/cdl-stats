import { getEventData, getEventsData } from './staticData.js'
import { logInfo, logNewline, logVerbose } from '../../lib/logger.js'
import { EventT } from './types.js'
import BpEvent from './responses/BpEvent.js'

export const getEvent = async (event: EventT): Promise<BpEvent> => {
  logInfo(`Fetching event detail for BP ${event.id}.`, true)

  const eventData = await getEventData(event.id)

  logVerbose('Data fetched.')

  return new BpEvent(eventData.event, eventData.matches)
}

export const getEvents = async (ids?: number[]): Promise<BpEvent[]> => {
  logInfo('Fetching events data.', true)

  let eventsData = await getEventsData()
  const events: BpEvent[] = []

  logVerbose('Data fetched.')

  if (ids && ids.length) {
    eventsData = eventsData.filter((event) => ids.includes(event.id))
  }

  logVerbose(`${eventsData.length} non-CDL events found of ${eventsData.length} total.`)
  logNewline(true)

  for (const [index, event] of eventsData.entries()) {
    logVerbose(`Fetching detail for event ${index + 1} of ${eventsData.length}.`)

    events.push(await getEvent(event))

    logNewline(true)
  }

  logVerbose('Events mapped into BpEvent class.')

  return events
}

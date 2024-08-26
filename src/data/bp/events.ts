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

export const getEvents = async (id?: number): Promise<BpEvent[]> => {
  logInfo('Fetching events data.', true)

  const eventsData = await getEventsData()
  // Only get non-cdl events from bp as there is no reliable way to match them to one another.
  let nonCdlEventsData = eventsData.filter((event) => !event.name.startsWith('CDL'))
  const events: BpEvent[] = []

  logVerbose('Data fetched.')

  if (id) {
    nonCdlEventsData = nonCdlEventsData.filter((event) => event.id === id)
  }

  logVerbose(`${nonCdlEventsData.length} non-CDL events found of ${eventsData.length} total.`)
  logNewline(true)

  for (const [index, event] of nonCdlEventsData.entries()) {
    logVerbose(`Fetching detail for event ${index + 1} of ${nonCdlEventsData.length}.`)

    events.push(await getEvent(event))

    logNewline(true)
  }

  logVerbose('Events mapped into BpEvent class.')

  return events
}

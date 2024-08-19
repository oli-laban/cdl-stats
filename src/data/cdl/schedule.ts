import { isNotPreflight, newPage, waitAndClick } from '../../lib/puppeteer.js'
import { getSeasons } from './staticData.js'
import {
  BracketResponse,
  CdlDynamicBracket,
  CdlDynamicBracketBlock,
  CdlDynamicBracketNonArchived, CdlDynamicGroupBracket,
  CdlDynamicGroupBracketBlock,
  CdlMatchCardsBlock, CdlWeekHeaderBlock, Match,
  SeasonDropdownItem,
  SeasonResponse,
  StageResponse,
  StageSubTab,
  StageSubTabsBlock,
  StageTab,
  StageTabsBlock,
  SubStageResponse,
  Tab,
  TournamentBlock,
  TournamentResponse,
  TournamentResponseData,
  TournamentTab,
  TournamentTabsBlock,
} from './types.js'
import CdlSeason from './responses/CdlSeason.js'
import CdlStage from './responses/CdlStage.js'
import { HTTPResponse, Page } from 'puppeteer'
import CdlSubStage from './responses/CdlSubStage.js'
import CdlMatch from './responses/CdlMatch.js'
import CdlStandardBracket from './responses/CdlStandardBracket.js'
import CdlGroupBracket from './responses/CdlGroupBracket.js'
import { getJsonFromFile, saveDataAsJson, wait } from '../../util.js'

export interface Filter {
  [season: string]:
    | '*'
    | {
        [stage: string]:
          | '*'
          | {
              [subStage: string]: '*' | string[]
            }
      }
}

const initialUrl = 'https://callofdutyleague.com/en-us/schedule'

const ignore: Filter = {
  '2020': '*',
  '2021': {
    Preseason: '*', // No data in tabs
    'All-Star Weekend': '*',
  },
  '2022': {
    'Pro-Am Classic': '*', // No data in tabs
    'Post Season': {
      Championship: ['test bracket', 'Group Play'],
    },
  },
  '2023': {
    'Raleigh Major I': {
      'Major I Challengers Qualifiers': '*', // No data in tabs
    },
  },
  '2024': {
    'Entire Season': '*', // Contains matches which will be found in the other tabs
  },
}

let whitelist: Filter = {}

let page: Page

const brackets: { url: string; data: BracketResponse }[] = []

interface SaveData {
  [key: string]: SeasonDropdownItem & {
    stageTabs?: {
      [key: string]: StageTab & {
        stageSubTabs?: {
          [key: string]: StageSubTab & {
            matches?: Match[]
            standardBrackets?: CdlDynamicBracketNonArchived[]
            groupBrackets?: CdlDynamicGroupBracket[]
          }
        }
      }
    }
  }
}

const saveData: SaveData = {}

const isIgnored = (
  season: string,
  stageTab: string | null = null,
  subStageTab: string | null = null,
  tournamentTab: string | null = null,
): boolean => {
  const seasonIgnore = ignore[season]

  if (seasonIgnore === '*') {
    console.log(`Season ignored: ${season}`)

    return true
  }

  if (seasonIgnore && stageTab) {
    const stageIgnore = seasonIgnore[stageTab]

    if (stageIgnore === '*') {
      console.log(`Stage ignored: ${stageTab}`)

      return true
    }

    if (stageIgnore && subStageTab) {
      const subStageIgnore = stageIgnore[subStageTab]

      if (subStageIgnore === '*') {
        console.log(`Sub Stage ignored: ${subStageTab}`)

        return true
      }

      return subStageIgnore && subStageIgnore.includes(tournamentTab)
    }
  }

  return false
}

const makeTabSelector = (tab: Tab): string => {
  let id = tab.title.toUpperCase().replaceAll(' ', '-')

  if (tab.secondaryText) {
    id += `-${tab.secondaryText.replaceAll(' ', '-')}`
  }

  return `[id^="tab-id-${id}"] a`
}

const waitAndClickTab = async (selector: string): Promise<void> => {
  await wait(1000)

  console.log(`Clicking selector: ${selector}`)

  await page.evaluate<[string]>((s) => {
    const els: NodeListOf<HTMLElement> = document.querySelectorAll(s)
    const el = Array.from(els).find((el) => el.offsetParent !== null)

    console.log(el)

    el.scrollIntoView()
    el.click()

    const wrapper = el.closest('[class^="tabstyles__LabelsWrapper"]')

    wrapper?.nextElementSibling?.scrollIntoView()
  }, selector)
}

const waitForTabResponse = async <T>(): Promise<T> => {
  const response = await page.waitForResponse(
    (response: HTTPResponse) =>
      isNotPreflight(response) && response.url().includes('content-types/tab'),
  )

  return (await response.json()) as T
}

const waitForBracketArchive = (bracket: CdlDynamicBracket): Promise<BracketResponse> =>
  new Promise((resolve, reject) => {
    const intervalTime = 100
    let elapsedTime = 0

    const interval = setInterval(() => {
      const found = brackets.find(
        (archiveBracket) => archiveBracket.url === bracket.archiveFile,
      )

      if (found) {
        clearInterval(interval)

        resolve(found.data)
      }

      elapsedTime += intervalTime

      if (elapsedTime >= 30000) {
        clearInterval(interval)

        reject(
          new Error(
            `Waiting for archive bracket "${bracket.archiveFile}" failed. Timeout exceeded.`,
          ),
        )
      }
    }, intervalTime)
  })

const processTournamentBlock = async (subStage: CdlSubStage, block: TournamentBlock): Promise<void> => {
  if (Object.hasOwn(block, 'cdlMatchCards')) {
    console.log('Match cards block. Adding matches to sub stage.')

    const matchCards = (block as CdlMatchCardsBlock).cdlMatchCards
    const matches = [
      ...matchCards.finalMatches,
      ...matchCards.liveMatches,
      ...matchCards.upcomingMatches,
    ]

    matches.forEach((match) => {
      subStage.addMatch(new CdlMatch(match))
    })

    return
  }

  // The later seasons have the bracket on both the qualifiers and major tabs so ignore the one
  // on the qualifiers tab. Registering the bracket on both won't cause duplicates in the db,
  // but makes it difficult to determine the tournament format.
  if (subStage.title() === 'Qualifiers' || subStage.title() === 'Qualifier') {
    return;
  }

  if (Object.hasOwn(block, 'cdlDynamicBracket')) {
    console.log('Dynamic bracket block. Checking for data on block.')

    const bracket = (block as CdlDynamicBracketBlock).cdlDynamicBracket

    if (bracket.isArchive) {
      console.log('Bracket is archive. Pausing to allow for bracket response.')

      try {
        const archive = await waitForBracketArchive(bracket)

        console.log('Adding bracket archive to sub stage.')

        subStage.addBracket(new CdlStandardBracket(archive.data))
      } catch (e) {
        console.log(e)
        console.log('Skipping.')

        return
      }
    } else {
      console.log('Bracket data on block. Adding to sub stage.')

      subStage.addBracket(
        new CdlStandardBracket(bracket as CdlDynamicBracketNonArchived),
      )
    }

    return
  }

  if (Object.hasOwn(block, 'cdlDynamicGroupBracket')) {
    const bracket = (block as CdlDynamicGroupBracketBlock)
      .cdlDynamicGroupBracket

    console.log('Dynamic group bracket block. Adding to sub stage.')

    subStage.addBracket(new CdlGroupBracket(bracket))

    return
  }

  console.log('Irrelevant block type. Skipping.')
}

const fetchTournamentTab = async (subStage: CdlSubStage, tournamentTab: TournamentTab): Promise<void> => {
  let blocks: TournamentResponseData['blocks']

  await waitAndClickTab(makeTabSelector(tournamentTab))

  console.log('Tournament tab clicked.')

  if (tournamentTab.blocks) {
    console.log(
      'Tournament tab already loaded (in previous response or static data).',
    )

    blocks = tournamentTab.blocks
  } else {
    console.log('Waiting for response.')

    const data = await waitForTabResponse<TournamentResponse>()

    console.log('Response received.')

    blocks = data.data.tab.blocks
  }

  console.log('Processing tournament blocks.')

  for (const [index, block] of blocks.entries()) {
    console.log('')
    console.log(`Block ${index + 1} of ${blocks.length}`)

    await processTournamentBlock(subStage, block)
  }
}

const fetchStageTab = async <
  T extends StageTab | StageSubTab,
  R extends CdlStage | CdlSubStage,
>(
  tab: T,
  StageClass: new (data: T) => R,
  responseType: T extends StageTab ? StageResponse : SubStageResponse,
): Promise<R> => {
  let stage: R

  await waitAndClickTab(makeTabSelector(tab))

  console.log('Stage tab clicked.')

  if (tab.blocks) {
    console.log('Stage already loaded (in previous response or static data).')

    stage = new StageClass(tab)
  } else {
    console.log('Waiting for response.')

    const data = await waitForTabResponse<typeof responseType>()

    console.log('Response received.')

    stage = new StageClass({ ...tab, ...data.data.tab })
  }

  return stage
}

let playoffs2022SubStage: CdlSubStage = null

const fetchSubStage = async (
  tab: StageSubTab,
  stage: CdlStage,
  season: CdlSeason,
): Promise<CdlSubStage | null> => {
  const subStage = await fetchStageTab(tab, CdlSubStage, {} as SubStageResponse)

  subStage.setRelease(season.release())

  const tournamentTabsBlock = subStage.data.blocks.find(
    (block): block is TournamentTabsBlock =>
      (block as TournamentTabsBlock).tabs?.ContentTypeUid === 'block_cdl_tabs',
  )

  if (tournamentTabsBlock) {
    let tournamentTabs = tournamentTabsBlock.tabs.tabs
    const filter = whitelist[season.slug()]?.[stage.name()]?.[tab.title]

    if (filter && filter !== '*') {
      tournamentTabs = tournamentTabs.filter((tournamentTab) =>
        filter.includes(tournamentTab.title),
      )
    }

    console.log(
      `Found ${tournamentTabs.length} tournament tabs: ${tournamentTabs
        .map((tournamentTab) => tournamentTab.title)
        .join(', ')}`,
    )

    for (const [index, tournamentTab] of tournamentTabs.entries()) {
      console.log('')

      if (
        isIgnored(
          season.slug(),
          stage.name(),
          subStage.title(),
          tournamentTab.title,
        )
      ) {
        continue
      }

      console.log(
        `Processing tournament tab ${index + 1} of ${tournamentTabs.length}: ${tournamentTab.title}`,
      )
      console.log('----------------------------------')

      await fetchTournamentTab(subStage, tournamentTab)
    }
  } else {
    console.log('No tournament tabs found on sub stage.')
  }

  const matchCardsBlock = subStage.data.blocks.find(
    (block): block is CdlMatchCardsBlock =>
      Object.prototype.hasOwnProperty.call(
        block as CdlMatchCardsBlock,
        'cdlMatchCards',
      ),
  )

  if (matchCardsBlock) {
    await processTournamentBlock(subStage, matchCardsBlock)
  }

  // For 2022 champs, the matches are split over 2 sub stage tabs. Each tab holds the bracket, but neither holds
  // all the matches to add to the bracket. So these need merging by holding the "Playoffs" sub stage and adding its
  // matches to the "Championship" sub stage.
  if (season.slug() === '2022' && subStage.title() === 'Playoffs') {
    playoffs2022SubStage = subStage

    return null
  } else if (season.slug() === '2022' && subStage.title() === 'Championship' && playoffs2022SubStage) {
    playoffs2022SubStage.allMatches().forEach((match) => subStage.addMatch(match))
  }

  if (!saveData[season.slug()].stageTabs[stage.name()].stageSubTabs) {
    saveData[season.slug()].stageTabs[stage.name()].stageSubTabs = {}
  }

  saveData[season.slug()].stageTabs[stage.name()].stageSubTabs[subStage.title()] = {
    ...subStage.getData(),
    blocks: subStage.getData().blocks?.filter(
      (block): block is CdlWeekHeaderBlock =>
        Object.hasOwn(block, 'cdlWeekHeader'),
    ),
  }

  console.log('')
  console.log('Applying brackets to sub stage.')

  subStage.applyBrackets()

  const saveDataSubStage = saveData[season.slug()]
    .stageTabs[stage.name()]
    .stageSubTabs[subStage.title()]

  saveDataSubStage.matches = []
  saveDataSubStage.standardBrackets = []
  saveDataSubStage.groupBrackets = []

  subStage.allMatches().forEach((match: CdlMatch) => saveDataSubStage.matches.push(match.getData()))
  subStage.getStandardBrackets().forEach(
    (bracket) => saveDataSubStage.standardBrackets.push(bracket.getData())
  )
  subStage.getGroupBrackets().forEach(
    (bracket) => saveDataSubStage.groupBrackets.push(bracket.getData())
  )

  return subStage
}

const fetchStage = async (tab: StageTab, season: CdlSeason): Promise<CdlStage> => {
  const stage = await fetchStageTab(tab, CdlStage, {} as StageResponse)

  if (!saveData[season.slug()].stageTabs) {
    saveData[season.slug()].stageTabs = {}
  }

  saveData[season.slug()].stageTabs[stage.name()] = { ...stage.getData(), blocks: undefined }

  const stageSubTabsBlock = stage.data.blocks.find(
    (block): block is StageSubTabsBlock =>
      (block as StageSubTabsBlock).tabs?.ContentTypeUid === 'block_cdl_tabs',
  )
  let stageSubTabs = stageSubTabsBlock.tabs.tabs
  const filter = whitelist[season.slug()]?.[tab.title]

  if (filter && filter !== '*') {
    stageSubTabs = stageSubTabs.filter((stageSubTab) =>
      Object.prototype.hasOwnProperty.call(filter, stageSubTab.title),
    )
  }

  console.log(
    `Found ${stageSubTabs.length} sub stages: ${stageSubTabs.map((subTab) => subTab.title).join(', ')}`,
  )

  for (const [index, stageSubTab] of stageSubTabs.entries()) {
    console.log('')

    if (isIgnored(season.slug(), stage.name(), stageSubTab.title)) {
      continue
    }

    console.log(
      `Processing sub stage ${index + 1} of ${stageSubTabs.length}: ${stageSubTab.title}.`,
    )
    console.group('------------------------------------')

    const subStage = await fetchSubStage(stageSubTab, stage, season)

    if (subStage) {
      stage.addSubStage(subStage)
    }

    console.groupEnd()
  }

  return stage
}

const fetchSeason = async (seasonDropdownItem: SeasonDropdownItem): Promise<CdlSeason> => {
  let seasonData: SeasonDropdownItem = seasonDropdownItem

  const dropdownItemSelector = `li[name="${seasonDropdownItem.slug}"]`

  try {
    await wait(1000)
    await page.click(dropdownItemSelector)
  } catch (error) {
    await waitAndClick(page, '#season-dropdown-testId')

    await waitAndClick(page, dropdownItemSelector)
  }

  console.log('Season dropdown clicked.')

  if (seasonDropdownItem.blocks) {
    console.log('Season found in static data.')
  } else {
    console.log('Waiting for response.')

    const data = await waitForTabResponse<SeasonResponse>()

    console.log('Received response.')

    seasonData = { ...seasonData, ...data.data.tab }
  }

  saveData[seasonData.slug] = { ...seasonData, blocks: undefined }

  const season = new CdlSeason(seasonData)

  const stageTabsBlock = season.data.blocks.find(
    (block): block is StageTabsBlock =>
      (block as StageTabsBlock).tabs?.ContentTypeUid === 'block_cdl_tabs',
  )
  let stageTabs = stageTabsBlock.tabs.tabs
  const filter = whitelist[season.slug()]

  if (filter && filter !== '*') {
    stageTabs = stageTabs.filter((stageTab) =>
      Object.prototype.hasOwnProperty.call(filter, stageTab.title),
    )
  }

  console.log(
    `Found ${stageTabs.length} stages: ${stageTabs.map((stageTab) => stageTab.title).join(', ')}`,
  )

  for (const [index, stageTab] of stageTabs.entries()) {
    console.log('')

    if (isIgnored(season.slug(), stageTab.title)) {
      continue
    }

    console.log(
      `Processing stage ${index + 1} of ${stageTabs.length}: ${stageTab.title}.`,
    )
    console.group('--------------------------------------')

    season.addStage(await fetchStage(stageTab, season))

    console.groupEnd()
  }

  return season
}

export const getSchedule = async (filter: Filter = {}): Promise<CdlSeason[]> => {
  whitelist = filter

  const schedule: CdlSeason[] = []
  let seasons = await getSeasons()

  if (Object.keys(whitelist).length) {
    seasons = seasons.filter((season) =>
      Object.prototype.hasOwnProperty.call(whitelist, season.slug),
    )
  }

  console.log(
    `Found ${seasons.length} seasons: ${seasons.map((season) => season.slug).join(', ')}.`,
  )

  page = await newPage()
  await page.goto(initialUrl)

  page.on('response', async (response: HTTPResponse): Promise<void> => {
    if (response.url().includes('Bracket')) {
      brackets.push({ url: response.url(), data: await response.json() })
    }
  })

  try {
    console.log('Hiding score strip to prevent click() conflicts')

    await page.waitForSelector('[class^="score-strip-liststyles__Container"]')
    await page.$eval('[class^="score-strip-liststyles__Container"]', (el) =>
      el.remove(),
    )
  } catch {
    /**/
  }

  for (const [index, season] of seasons.entries()) {
    console.log('')

    if (isIgnored(season.slug)) {
      continue
    }

    console.log(
      `Processing season ${index + 1} of ${seasons.length}: ${season.slug}.`,
    )
    console.group('========================================')

    schedule.push(await fetchSeason(season))

    console.groupEnd()
  }

  console.log('========================================')
  console.log('')
  console.log('Schedule fetch complete. Saving data to "cdl_schedule_data.json".')

  await saveDataAsJson('data/cdl_schedule_data.json', saveData)

  printScheduleOverview(schedule)

  return schedule
}

export const getScheduleFromSaveData = async (): Promise<CdlSeason[]> => {
  console.log('Fetching saved schedule data.')

  const savedSchedule = await getJsonFromFile<SaveData>('data/cdl_schedule_data.json')

  console.log('Saved schedule retrieved.')

  const schedule: CdlSeason[] = []

  for (const seasonSlug in savedSchedule) {
    const seasonData = savedSchedule[seasonSlug]
    const season = new CdlSeason(seasonData)

    for (const stageTabTitle in seasonData.stageTabs) {
      const stageTabData = seasonData.stageTabs[stageTabTitle]
      const stage = new CdlStage(stageTabData)

      for (const stageSubTabTitle in stageTabData.stageSubTabs) {
        const stageSubTabData = stageTabData.stageSubTabs[stageSubTabTitle]
        const subStage = new CdlSubStage(stageSubTabData)

        subStage.setRelease(season.release())

        if (stageSubTabData.matches) {
          stageSubTabData.matches.forEach((match) => subStage.addMatch(new CdlMatch(match)))
        }

        if (stageSubTabData.standardBrackets) {
          stageSubTabData.standardBrackets.forEach(
            (bracket) => subStage.addBracket(new CdlStandardBracket(bracket)),
          )
        }

        if (stageSubTabData.groupBrackets) {
          stageSubTabData.groupBrackets.forEach(
            (bracket) => subStage.addBracket(new CdlGroupBracket(bracket)),
          )
        }

        subStage.applyBrackets()

        stage.addSubStage(subStage)
      }

      season.addStage(stage)
    }

    schedule.push(season)
  }

  printScheduleOverview(schedule)

  return schedule
}

const printScheduleOverview = (schedule: CdlSeason[]): void => {
  console.log('')
  console.log(`Overview of fetched schedule (${schedule.length}) seasons:`)
  console.log('')

  schedule.forEach((season) => {
    console.log('')
    console.log(`Season name: ${season.name()}`)
    console.log(`# Splits: ${season.splits().length}`)

    console.group()

    season.splits().forEach((split) => {
      console.log('')
      console.log(`Split name: ${split.name()}`)
      console.log(`# Tournaments: ${split.tournaments().length}`)

      console.group()

      split.tournaments().forEach((tournament) => {
        console.log('')
        console.log(`Tournament name: ${tournament.name()}`)

        if (tournament.matches().length) {
          console.log(`# Matches: ${tournament.matches().length}`)
        }

        if (tournament.bracketSlots().length) {
          console.log(`# Bracket Matches: ${tournament.bracketSlots().length}`)
        }

        if (tournament.groups().length) {
          console.log(`Groups: ${tournament.groups().map((group) => group.name()).join(', ')}`)
        }
      })

      console.groupEnd()
    })

    console.groupEnd()
  })
}

interface PlayerSocial {
  socialNetworkType: "TWITTER" | string
  handle: string
}

export interface Player {
  id: number
  firstName: string
  lastName: string
  alias: string
  dob?: string
  homeCountry?: string
  role?: "Player" | "Substitute" | string
  socialNetworkHandles: PlayerSocial[]
}

export interface Team {
  teamId: number
  teamLocation: string
  teamName: string
  fullTeamName: string
  teamAbbreviatedName: string
  displayTeamNameFirst: boolean
  roster: Player[]
}

export type GameMode = 'CDL Hardpoint' | 'CDL SnD' | 'CDL Search & Destroy' | 'CDL Control'

export interface MatchGame {
  id: number
  matchId: number
  number: number
  map: string
  mode: GameMode
  gameMap: {
    displayName: string
    abbreviatedName: string
    id: string
    title: string
  }
}

export interface MatchGameResult {
  hostGameScore: number
  guestGameScore: number
  winnerTeamId?: number
  loserTeamId?: number
}

interface BaseMatchPlayer {
  id: number
  firstName?: string
  lastName?: string
  alias: string
  socialNetworkHandles: PlayerSocial[]
}

export interface MatchPlayerOverall extends BaseMatchPlayer {
  stats?: HpPlayerStats & SndPlayerStats & ControlPlayerStats
}

interface BaseMatchPlayerGame extends BaseMatchPlayer {
  gameMap: string
}

export interface MatchPlayerGameHp extends BaseMatchPlayerGame {
  gameMode: 'CDL Hardpoint'
  stats?: HpPlayerStats
}

export interface MatchPlayerGameSnD extends BaseMatchPlayerGame {
  gameMode: 'CDL SnD' | 'CDL Search & Destroy'
  stats?: SndPlayerStats
}

export interface MatchPlayerGameControl extends BaseMatchPlayerGame {
  gameMode: 'CDL Control'
  stats?: ControlPlayerStats
}

export type MatchPlayerGame = MatchPlayerGameHp | MatchPlayerGameSnD | MatchPlayerGameControl

interface BasePlayerStats {
  id: number
  averageSpeed?: number
  highestStreak?: number
  untradedDeaths?: number
  tradedDeaths?: number
  inapplicableTradedKills?: number
  inapplicableTradedDeaths?: number
  damageTaken?: number
  damageHealed?: number
  tacticalsUsed?: number
  lethalsUsed?: number
  percentTimeMoving?: number
  deadSilenceTime?: number
  totalKills?: number
  totalDeaths?: number
  totalAssists?: number
  totalScore?: number
  totalShotsFired?: number
  totalShotsHit?: number
  totalShotsHead?: number
  untradedKills?: number
  tradedKills?: number
  totalDamageDealt?: number
  friendDamage?: number
  totalTimeAlive?: number
  totalDistanceTraveled?: number
  highestMultikill?: number
  totalAces?: number
  totalInVictimFovKills?: number
  totalDefuserKills?: number
  totalFirstBloodKills?: number
  totalLongshotKills?: number
  totalPlanterKills?: number
  totalPointblankKills?: number
  totalRevengeKills?: number
  totalRotationKills?: number
  totalInAttackerFovKills?: number
  totalWallbangKills?: number
  killDeathRatio?: string,
  calculatedHillTime?: string,
  objective1Time?: string,
  objective2Time?: string,
  objective3Time?: string,
  objective4Time?: string,
  objective5Time?: string
}

export interface HpPlayerStats extends BasePlayerStats {
  hillTime?: number
  contestedHillTime?: number
}

export interface SndPlayerStats extends BasePlayerStats {
  bombsPlanted?: number
  bombsDefused?: number
  sneakDefuses?: number
}

export interface ControlPlayerStats extends BasePlayerStats {
  totalObjectivesCaptured?: number
  objectiveTiersContributed?: number
}

export enum MatchStatus {
  PreScheduled = 'PRESCHEDULED',
  Scheduled = 'SCHEDULED',
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

interface BaseMatchResult {
  homeTeamGamesWon: number
  awayTeamGamesWon: number
}

interface CompletedMatchResult extends BaseMatchResult {
  winnerTeamId: number
  loserTeamId: number
}

type Result<S extends MatchStatus> = S extends MatchStatus.Completed
  ? CompletedMatchResult
  : BaseMatchResult

export interface Match<S extends MatchStatus = MatchStatus> {
  startDate: number
  startTime: number
  match: {
    id: number
    status: S
    playTime?: number
    vodLink?: string
    stageHomeTeamId?: number
  }
  result: Result<S>
  homeTeamCard: S extends MatchStatus.Completed
    ? TeamCard
    : TeamCard | undefined
  awayTeamCard: S extends MatchStatus.Completed
    ? TeamCard
    : TeamCard | undefined
  broadcastLinks: {
    url: string
    isDefault: boolean
    broadcastPartnerName: string
  }[]
}

export interface PreScheduledMatch extends Match<MatchStatus.PreScheduled> {
  homeTeamCard: undefined
  awayTeamCard: undefined
  result: undefined
}

interface BaseBracketMatch {
  id: number
  bracketPosition: string
  startDate: number
  link?: string
}

export interface CompletedOrInProgressBracketMatch extends BaseBracketMatch {
  status: MatchStatus.Completed | MatchStatus.InProgress
  scores: [number, number]
  competitors: [BracketMatchTeam, BracketMatchTeam]
}

export interface PendingBracketMatch extends BaseBracketMatch {
  status: MatchStatus.Pending
  scores: []
  competitors: [
    BracketMatchTeam | PendingBracketMatchTeam,
    BracketMatchTeam | PendingBracketMatchTeam,
  ]
}

export type BracketMatch =
  | CompletedOrInProgressBracketMatch
  | PendingBracketMatch

export interface GroupBracketMatch {
  matchId: string
  href: string
  startDate: number
  teams: [GroupBracketMatchTeam, GroupBracketMatchTeam]
}

interface GroupBracketMatchPosition {
  matchId: number
  bracketPosition: string
}

export interface TeamCard {
  id: number
  name: string
  abbreviation?: string
  darkLogoUrl?: string
  lightLogoUrl?: string
  primaryColor?: string
  secondaryColor?: string
}

interface BracketMatchTeam {
  id: number
  name: string
  abbreviatedName: string
  location: string
  logo: string
}

interface PendingBracketMatchTeam {
  name: 'TBD'
  abbreviatedName: 'TBD'
}

export interface GroupBracketMatchTeam {
  id: number
  largeText: string
  smallText: string
  location: string
  score: number
  isWinning: boolean
}

export interface SeasonDropdownItem extends SeasonResponseData {
  label: string
  slug: string
  name: string
  default: boolean
}

export interface GenericBlock {
  [key: string]: {
    ContentTypeUid: string
  }
}

export interface CdlContainerBlock {
  cdlContainerBlockList: {
    ContentTypeUid: 'block_cdl_container_block_list'
    items: SeasonDropdownItem[]
  }
}

export interface StageTabsBlock {
  tabs: {
    ContentTypeUid: 'block_cdl_tabs'
    tabs: StageTab[]
  }
}

export interface StageSubTabsBlock {
  tabs: {
    ContentTypeUid: 'block_cdl_tabs'
    tabs: StageSubTab[]
  }
}

export interface TournamentTabsBlock {
  tabs: {
    ContentTypeUid: 'block_cdl_tabs'
    tabs: TournamentTab[]
  }
}

interface EntireSeasonMatchCardsBlock {
  cdlEntireSeasonMatchCards: {
    completedMatches: Match<MatchStatus.Completed>[]
    upcomingMatches: Match<MatchStatus.Scheduled | MatchStatus.InProgress>[]
  }
}

export interface CdlMatchCardsBlock {
  cdlMatchCards: {
    count: number
    finalMatches: Match<MatchStatus.Completed>[]
    liveMatches: Match<MatchStatus.InProgress>[]
    preScheduledMatches: PreScheduledMatch[]
    upcomingMatches: Match<MatchStatus.Scheduled | MatchStatus.PreScheduled>[]
  }
}

export interface CdlMatchDetailBlock {
  cdlMatchDetail: {
    ContentTypeUid: 'block_cdl_match_detail'
    matchData: {
      matchExtended: Match
      matchGamesExtended: { matchGame: MatchGame, matchGameResult?: MatchGameResult }[]
      matchStats?: {
        overall: {
          hostTeam: MatchPlayerOverall[]
          guestTeam: MatchPlayerOverall[]
        }
        matches: {
          hostTeam: MatchPlayerGame[][]
          guestTeam: MatchPlayerGame[][]
        }
      } | []
    }
  }
}

interface CdlDynamicBracketBase {
  ContentTypeUid: 'block_cdl_dynamic_bracket'
}

export interface CdlDynamicBracketArchived extends CdlDynamicBracketBase {
  isArchive: true
  archiveFile: string
}

export interface CdlDynamicBracketNonArchived extends CdlDynamicBracketBase {
  isArchive: false
  archiveFile: null
  htmlTemplate: string
  title: string
  teamSeeds: []
  matches: BracketMatch[]
}

export type CdlDynamicBracket =
  | CdlDynamicBracketArchived
  | CdlDynamicBracketNonArchived

export interface CdlDynamicBracketBlock {
  cdlDynamicBracket: CdlDynamicBracket
}

export interface CdlDynamicGroupBracket {
  htmlTemplate: string
  title: string
  texts: {
    roundTypeText: string
    teminalNodeText: string
  }
  groups: {
    groupLabel: string
    matches: GroupBracketMatchPosition[]
  }[]
  shapedMatches: {
    groupLabel: string
    matches: GroupBracketMatch[]
  }[]
}

export type BracketWithData =
  | CdlDynamicBracketNonArchived
  | CdlDynamicGroupBracket

export interface CdlDynamicGroupBracketBlock {
  cdlDynamicGroupBracket: CdlDynamicGroupBracket
}

export interface CdlWeekHeaderBlock {
  cdlWeekHeader: {
    ContentTypeUid: 'block_cdl_week_header'
    primaryTitle: string
    secondaryTitle: string
  }
}

export interface Tab {
  title: string
  secondaryText: string
  openDefault: boolean
}

interface TabResponseData<D, T extends boolean> {
  blocks: T extends true ? D : D | undefined
}

export type SeasonResponseData = TabResponseData<
  (GenericBlock | StageTabsBlock)[],
  true
>

export type StageResponseData<T extends boolean = false> = TabResponseData<
  (GenericBlock | EntireSeasonMatchCardsBlock | StageSubTabsBlock)[],
  T
>

export type SubStageResponseData<T extends boolean = false> = TabResponseData<
  (
    | GenericBlock
    | CdlWeekHeaderBlock
    | TournamentTabsBlock
    | CdlMatchCardsBlock
  )[],
  T
>

export type TournamentBlock =
  | GenericBlock
  | CdlMatchCardsBlock
  | CdlDynamicBracketBlock
  | CdlDynamicGroupBracketBlock

export type TournamentResponseData<T extends boolean = false> = TabResponseData<
  TournamentBlock[],
  T
>

export type StageTab<T extends boolean = false> = Tab & StageResponseData<T>

export type StageSubTab<T extends boolean = false> = Tab &
  SubStageResponseData<T>

export type TournamentTab<T extends boolean = false> = Tab &
  TournamentResponseData<T>

export interface TabResponse<T> {
  data: {
    tab: T
  }
}

export type SeasonResponse = TabResponse<SeasonResponseData>

export type StageResponse = TabResponse<StageResponseData>

export type SubStageResponse = TabResponse<SubStageResponseData>

export type TournamentResponse = TabResponse<TournamentResponseData>

export interface BracketResponse {
  data: CdlDynamicBracketNonArchived
}

export type Mode = 'Hardpoint' | 'Search \u0026 Destroy' | 'Control'

export interface Team {
  id: number
  name: string
  name_medium: string
  name_short: string
  twitter: string | null
  youtube: string | null
  instagram: string | null
  discord: string | null
  start_date: string
  end_date: string | null
  division_id: number
  color_hex: string
}

interface TeamWithRecord extends Team {
  record: {
    event_id: number
    team_id: number
    wins: number
    losses: number
  } | null
}

export interface EventT {
  id: number
  name: string
  start_date: string
  end_date: string
  tier: 'Qualifier' | 'Tournament'
  type: 'Online' | 'Offline'
  number_of_teams: number
  prizepool: number | null
  currency: string | null
  location: string | null
  season_id: number
  division_id: number
  venue: string | null
  qualifier_event_id: number | null
  name_short: string | null
  number_of_tournament_bracket_teams: number | null
  tournament_elimination_type: 'single_elimination' | 'double_elimination'
  teams: Team[]
}

export interface Match {
  id: number
  event_id: number
  datetime: string
  best_of: number
  team_1_id: number | null
  team_2_id: number | null
  winner_id: number | null
  vod: string | null
  team_1_score: number | null
  team_2_score: number | null
  round_id: number
  points_earned: number
  is_tiebreaker: boolean
  status: 'complete' | 'upcoming'
  winner_next_match_id: number | null
  loser_next_match_id: number | null
  winner_next_match_team_position: 'team1' | 'team 1' | 'team2' | 'team 2' | null
  loser_next_match_team_position: 'team1' | 'team 1' | 'team2' | 'team 2' | null
  completed_at: string
  round: {
    id: number
    name: string
    name_short: string
  }
  team1: TeamWithRecord | null
  team2: TeamWithRecord | null
}

export interface EventDetail {
  event: Omit<EventT, 'teams'>
  matches: Match[]
}

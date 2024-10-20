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

export interface Player {
  id: number
  tag: string
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
  team1: Team | null
  team2: Team | null
}

export interface MatchWithGames extends Match {
  games: Game[]
}

export type SndRoundWinType = 'pre_plant_kills' | 'post_plant_kills' | 'bomb_defuse'

export type CtlRoundWinType = 'time' | 'kills' | 'ticks'

export interface TeamGameStats {
  id: number
  team_id: number
  game_id: string
  hp_hill_1_score: number | null
  hp_hill_2_score: number | null
  hp_hill_3_score: number | null
  hp_hill_4_score: number | null
  hp_hill_5_score: number | null
  hp_hill_6_score: number | null
  hp_hill_7_score: number | null
  hp_hill_8_score: number | null
  hp_hill_9_score: number | null
  hp_hill_10_score: number | null
  hp_hill_11_score: number | null
  hp_hill_12_score: number | null
  hp_hill_13_score: number | null
  hp_hill_14_score: number | null
  hp_hill_15_score: number | null
  snd_round_1_win: boolean | null
  snd_round_1_win_type: SndRoundWinType | null
  snd_round_2_win: boolean | null
  snd_round_2_win_type: SndRoundWinType | null
  snd_round_3_win: boolean | null
  snd_round_3_win_type: SndRoundWinType | null
  snd_round_4_win: boolean | null
  snd_round_4_win_type: SndRoundWinType | null
  snd_round_5_win: boolean | null
  snd_round_5_win_type: SndRoundWinType | null
  snd_round_6_win: boolean | null
  snd_round_6_win_type: SndRoundWinType | null
  snd_round_7_win: boolean | null
  snd_round_7_win_type: SndRoundWinType | null
  snd_round_8_win: boolean | null
  snd_round_8_win_type: SndRoundWinType | null
  snd_round_9_win: boolean | null
  snd_round_9_win_type: SndRoundWinType | null
  snd_round_10_win: boolean | null
  snd_round_10_win_type: SndRoundWinType | null
  snd_round_11_win: boolean | null
  snd_round_11_win_type: SndRoundWinType | null
  ctl_round_1_win: boolean | null
  ctl_round_1_win_type: CtlRoundWinType | null
  ctl_round_2_win: boolean | null
  ctl_round_2_win_type: CtlRoundWinType | null
  ctl_round_3_win: boolean | null
  ctl_round_3_win_type: CtlRoundWinType | null
  ctl_round_4_win: boolean | null
  ctl_round_4_win_type: CtlRoundWinType | null
  ctl_round_5_win: boolean | null
  ctl_round_5_win_type: CtlRoundWinType | null
  ctl_total_ticks: number | null
  ctl_total_attacking_rounds: number | null
}

export interface PlayerStats {
  id: string
  game_id: string
  player_id: number
  player_tag: string
  match_id: number
  kills: number
  deaths: number
  damage: number
  team_id: number
  assists: number
  non_traded_kills: number
  highest_streak: number
  hill_time: number | null
  contested_hill_time: number | null
  first_blood_count: number | null
  plant_count: number | null
  defuse_count: number | null
  zone_capture_count: number | null
  zone_tier_capture_count: number | null
  first_death_count: number | null
  snipe_count: number | null
  one_v_one_win_count: number | null
  one_v_two_win_count: number | null
  one_v_three_win_count: number | null
  one_v_four_win_count: number | null
  event_id: number
  mode_id: number
  map_id: number
  event_type: 'Online' | 'Offline'
  season_id: number
}

export type GameMode = 'Hardpoint' | 'Search & Destroy' | 'Control'

export interface Game {
  id: string
  game_num: number
  map_id: number | null
  mode_id: number
  team_1_id: number | null
  team_2_id: number | null
  team_1_score: number | null
  team_2_score: number | null
  winner_id: number | null
  gametime_min: number | null
  gametime_sec: number | null
  team_game_stats: [TeamGameStats, TeamGameStats] | null
  maps: { name: string } | null
  modes: { name: GameMode } | null
  player_stats: PlayerStats[]
}

export interface EventDetail {
  event: Omit<EventT, 'teams'>
  matches: Match[]
}

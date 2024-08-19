import TeamData from '../../TeamData.js'
import { Team, TeamCard } from '../types.js'
import CdlPlayer from './CdlPlayer.js'
import PlayerData from '../../PlayerData.js'

export default class CdlTeam extends TeamData {
  protected _players: CdlPlayer[] = []

  constructor(protected data: Partial<Team> & Pick<Team, 'teamId' | 'fullTeamName'>) {
    super()

    if (data.roster) {
      this._players = data.roster.map((player) => new CdlPlayer(player))
    }
  }

  abbreviation(): string | null {
    return this.data.teamAbbreviatedName
  }

  id(): number | null {
    return this.data.teamId
  }

  idType(): 'CDL' | 'BP' {
    return 'CDL'
  }

  name(): string {
    if (this.data.fullTeamName === 'Texas OpTic') {
      return 'OpTic Texas'
    }

    return this.data.fullTeamName
  }

  players(): PlayerData[] {
    return this._players
  }

  static fromTeamCard(data: TeamCard): CdlTeam {
    return new CdlTeam({
      teamId: data.id,
      fullTeamName: data.name,
      teamAbbreviatedName: data.abbreviation,
    })
  }
}

import CdlBracket, { MappedBracketMatch } from './CdlBracket.js'
import { CdlDynamicGroupBracket, GroupBracketMatch, GroupBracketMatchTeam, MatchStatus } from '../types.js'

export default class CdlGroupBracket extends CdlBracket<CdlDynamicGroupBracket> {
  constructor(data: CdlDynamicGroupBracket) {
    // Not currently filtering out duplicate slots and calling CdlBracket.correctAltSingleElimPositions() for
    // groups as there's been no dupes or single elim group brackets in group tournaments so far.

    super(data)
  }

  private teamNameForMappedMatch(team: GroupBracketMatchTeam): string {
    if (team.location === 'Challengers') {
      return team.largeText
    }

    if (team.largeText === 'OpTic') {
      return `${team.largeText} ${team.smallText}`
    }

    return `${team.smallText} ${team.largeText}`
  }

  getMappedMatches(): MappedBracketMatch[] {
    return this.data.shapedMatches.flatMap((group) =>
      this.determineRoundAndPositionNumbersFromString(
        group.matches.map((match) => {
          let status: MatchStatus = MatchStatus.Completed

          if (!match.teams.length || !('id' in match.teams[0]) || !('id' in match.teams[1])) {
            status = MatchStatus.Scheduled
          } else if (match.teams[0].score < 3 || match.teams[1].score < 3) {
            // No way of knowing match format so have to assume BO5. Will only apply if the match happens to be
            // missing from the schedule.
            status = MatchStatus.InProgress
          }

          return {
            id: parseInt(match.matchId),
            position: this.getMatchPosition(match),
            group: group.groupLabel,
            team1Score: match.teams?.[0]?.score || 0,
            team2Score: match.teams?.[1]?.score || 0,
            team1:
              match.teams[0] && 'id' in match.teams[0]
                ? {
                    id: match.teams[0].id,
                    name: this.teamNameForMappedMatch(match.teams[0]),
                  }
                : null,
            team2:
              match.teams[1] && 'id' in match.teams[1]
                ? {
                    id: match.teams[1].id,
                    name: this.teamNameForMappedMatch(match.teams[1]),
                  }
                : null,
            link: match.href,
            startDate: match.startDate,
            status,
          }
        }),
      ),
    )
  }

  private getMatchPosition(match: GroupBracketMatch): string {
    return this.data.groups
      .flatMap((group) => group.matches)
      .find((groupMatch) => groupMatch.matchId === parseInt(match.matchId))?.bracketPosition
  }

  getData(): CdlDynamicGroupBracket {
    return this.data
  }

  getAllBracketPositions(): { bracketPosition: string }[] {
    return this.data.groups.flatMap((group) => group.matches)
  }
}

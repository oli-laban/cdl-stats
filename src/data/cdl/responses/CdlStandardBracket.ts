import { BracketMatch, CdlDynamicBracketNonArchived } from '../types.js'
import CdlBracket, { MappedBracketMatch } from './CdlBracket.js'

export default class CdlStandardBracket extends CdlBracket<CdlDynamicBracketNonArchived> {
  constructor(data: CdlDynamicBracketNonArchived) {
    if (data.title === '2022 Major 1 Bracket') {
      data.matches = CdlStandardBracket.fix2022Major1BracketMatches(data.matches)
    }

    data.matches = data.matches.filter((match) => !CdlBracket.isDuplicatePosition(match.bracketPosition))

    const [matches, html] = CdlBracket.correctAltSingleElimPositions(data.matches, data.htmlTemplate)

    data.matches = matches
    data.htmlTemplate = html

    super(data)
  }

  getMappedMatches(): MappedBracketMatch[] {
    const matches = this.data.matches.map((match) => ({
      id: match.id,
      position: match.bracketPosition,
      team1Score: match.scores?.[0] || 0,
      team2Score: match.scores?.[1] || 0,
      team1:
        'id' in match.competitors[0]
          ? {
              id: match.competitors[0].id,
              name: match.competitors[0].name,
              abbreviation: match.competitors[0].abbreviatedName,
            }
          : null,
      team2:
        'id' in match.competitors[1]
          ? {
              id: match.competitors[1].id,
              name: match.competitors[1].name,
              abbreviation: match.competitors[1].abbreviatedName,
            }
          : null,
      link: match.link,
      status: match.status,
      startDate: match.startDate,
    }))

    return this.determineRoundAndPositionNumbersFromString(matches)
  }

  getData(): CdlDynamicBracketNonArchived {
    return this.data
  }

  getAllBracketPositions(): { bracketPosition: string }[] {
    return this.data.matches
  }

  private static fix2022Major1BracketMatches(matches: BracketMatch[]): BracketMatch[] {
    return matches.map((match) => {
      if (match.bracketPosition === 'WR1-M1') {
        match.id = 5740 // ATL v BOS
      } else if (match.bracketPosition === 'WR1-M2') {
        match.id = 5741 // TEX v SEA
      }

      return match
    })
  }
}

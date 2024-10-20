import { BracketWithData, MatchStatus } from '../types.js'
import CdlMatch from './CdlMatch.js'

export interface MappedBracketMatch {
  id: number
  position: string
  group?: string
  roundNumber: number
  positionNumber: number
  team1: {
    id: number
    name: string
    abbreviation?: string
  } | null
  team2: {
    id: number
    name: string
    abbreviation?: string
  } | null
  team1Score: number
  team2Score: number
  startDate: number
  link: string
  status: MatchStatus
}

type PartialBracketMatch = Omit<MappedBracketMatch, 'roundNumber' | 'positionNumber'> & Partial<MappedBracketMatch>

export default abstract class CdlBracket<T extends BracketWithData = BracketWithData> {
  protected data: T
  protected matches: CdlMatch[] = []

  protected constructor(data: T) {
    this.data = data
  }

  title(): string {
    return this.data.title
  }

  public abstract getMappedMatches(): MappedBracketMatch[]

  abstract getAllBracketPositions(): { bracketPosition: string }[]

  protected determineRoundAndPositionNumbersFromString(matches: PartialBracketMatch[]): MappedBracketMatch[] {
    const roundMap = {
      upper: {},
      lower: {},
    }

    matches.forEach((match) => {
      const [round, matchNum] = match.position.split('-')
      const side = round.startsWith('W') || round === 'GF' ? 'upper' : 'lower'

      if (!roundMap[side][round]) {
        roundMap[side][round] = []
      }

      roundMap[side][round].push(matchNum)
    })

    Array.from(['upper', 'lower']).forEach((side) => {
      let roundNumber = 1

      for (const round in roundMap[side]) {
        roundMap[side][round] = {
          roundNumber: roundNumber++,
          matches: roundMap[side][round],
        }
      }
    })

    return matches.map((match) => {
      const [round, matchNum] = match.position.split('-')
      const side = round.startsWith('W') || round === 'GF' ? 'upper' : 'lower'
      const roundObj = roundMap[side][round]

      const position = roundObj.matches.indexOf(matchNum) + 1

      return {
        ...match,
        roundNumber: roundObj.roundNumber,
        positionNumber: position,
      }
    })
  }

  protected static correctAltSingleElimPositions<T extends { bracketPosition: string }>(
    matches: T[],
    html: string,
  ): [T[], string] {
    if (matches.findIndex((match) => match.bracketPosition.startsWith('SF')) === -1) {
      return [matches, html]
    }

    let currentWinnersRound: string
    let semiFinalRound: string | null = null
    const updatedSemiFinals: string[] = []

    matches = matches.map((match) => {
      if (match.bracketPosition.startsWith('R')) {
        match.bracketPosition = `W${match.bracketPosition}`
      }

      if (match.bracketPosition.startsWith('W')) {
        currentWinnersRound = match.bracketPosition.split('-')[0]
      }

      if (match.bracketPosition.startsWith('SF')) {
        const round = parseInt(currentWinnersRound.slice(2))

        if (!isNaN(round)) {
          updatedSemiFinals.push(match.bracketPosition.split('-')[0])

          match.bracketPosition = match.bracketPosition.replace('SF', `WR${round + 1}`)
        }

        semiFinalRound = match.bracketPosition
      }

      return match
    })

    if (updatedSemiFinals) {
      html = html.replace(new RegExp(`/${updatedSemiFinals.join('|')}/`), semiFinalRound)
    }

    return [matches, html]
  }

  addMatch(match: CdlMatch): void {
    this.matches.push(match)
  }

  /** Some brackets have rogue duplicate positions */
  static isDuplicatePosition(position: string): boolean {
    return position === 'zero' || position.startsWith('Position') || position.startsWith('NA')
  }
}

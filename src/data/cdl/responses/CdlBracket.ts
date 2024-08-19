import { BracketWithData, MatchStatus } from '../types.js'
import CdlMatch from './CdlMatch.js'

interface BracketHeading {
  pos: number
  name: string
}

export interface MappedBracketMatch {
  id: number
  round: string
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

type PartialBracketMatch = Omit<
  MappedBracketMatch,
  'round' | 'roundNumber' | 'positionNumber'
> &
  Partial<MappedBracketMatch>
type BracketMatchWithoutRoundName = Omit<MappedBracketMatch, 'round'> &
  Partial<MappedBracketMatch>

export default abstract class CdlBracket<
  T extends BracketWithData = BracketWithData,
> {
  protected data: T
  protected headings: BracketHeading[]
  protected matches: CdlMatch[] = []

  protected constructor(data: T) {
    this.data = data
    this.headings = this.getHeadings()
  }

  title(): string {
    return this.data.title
  }

  public abstract getMappedMatches(): MappedBracketMatch[]

  private getHeadings(): BracketHeading[] {
    if (this.title().includes('2021') || this.title() === '2022 Playoff-Championship Bracket') {
      return this.get2021Headings()
    }

    if (this.title().includes('2022') || this.title() === 'Kickoff Classic Bracket') {
      return this.get2022Headings()
    }

    // All 2023 and 2024 brackets used the following format. Div with class matchupN (where N is the position) for
    // each slot, and the first slot in each round also contains the round label on its nested <match> el.

    const headings: BracketHeading[] = []
    const matches = this.data.htmlTemplate.matchAll(
      /<div class(?:Name)?=(?:\\?"|')matchup matchup(?<pos>\d+)(?:\\?"|')>(?:\\n)?\s*<figure>(?:\\n)?\s*<match\s+position=(?:\\?"|')\d+(?:\\?"|')(\s+label=(?:\\?"|')(?<name>.+?)(?:\\?"|'))?/g,
    )
    let currentName: string = '';

    for (const match of matches) {
      const groups = match.groups as { pos: string; name: string | undefined }

      if (groups) {
        if (groups.name) {
          currentName = groups.name
            .replace(/<[^>]+>/g, '')
            .replace(/\\n/g, '')
            .trim()
        }

        headings.push({
          pos: parseInt(groups.pos),
          name: currentName,
        })
      }
    }

    return headings
  }

  /** Look for headings followed by any number of positions and apply the position to the preceding heading. */
  private get2021Headings(): BracketHeading[] {
    // Extended regex in JS please.
    const pattern = /<div class=\\?"label[^"]*\\?">(?:\\n)?\s*<h2[^>]*>([\s\S]*?)<\/h2>(?:\\n)?\s*<\/div>(?:\\n)?\s*(?:(?:\\n)?\s*<div[^>]*>(?:\\n)?\s*<figure>(?:\\n)?\s*<match position=\\?"(\d+)\\?"[^>]*>(?:\\n)?\s*<\/figure>(?:\\n)?\s*<\/div>)*/g
    let results: { name: string; positions: number[] }[] = []

    let match: RegExpExecArray | null;

    while ((match = pattern.exec(this.data.htmlTemplate)) !== null) {
      const name = match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\\n/g, '')
        .trim()
      const positions = [...match[0].matchAll(/position=\\?"(\d+)\\?"/g)]
        ?.map(position => parseInt(position[1]))

      results.push({ name, positions })
    }

    // In some cases, for any rounds at the end of the bracket with only 1 match, the heading flips to AFTER the
    // position (why...). If the last round is empty, this is the case and we need to fill any empty rounds by
    // shifting all the positions up.
    if (!results[results.length - 1].positions.length) {
      let hasEmptyRounds = true

      // Shifting the positions can result in empty rounds, so repeat until there are no empty rounds.
      while (hasEmptyRounds) {
        const lastEmptyRound = results.findLastIndex(
          (round) => !round.positions.length,
        )
        const allPositions = results
          .slice(0, lastEmptyRound)
          .flatMap((round) => round.positions)
        const movedPositions: number[] = []
        const modifiedRounds: number[] = []

        for (let i = lastEmptyRound; i >= 0; i--) {
          if (results[i].positions.length) {
            break
          }

          const positionToMove = allPositions.pop()
          results[i].positions = [positionToMove]
          movedPositions.push(positionToMove)
          modifiedRounds.push(i)
        }

        // All rounds were left intact, so any positions that were moved need to be removed from their original round.
        results = results.map((round, index) => {
          if (modifiedRounds.includes(index)) {
            return round
          }

          round.positions = round.positions.filter((position) => !movedPositions.includes(position))

          return round
        })

        if (results.findIndex((round) => !round.positions.length) === -1) {
          hasEmptyRounds = false
        }
      }
    }

    return results.flatMap(({ name, positions }) => (
      positions.map((pos) => ({ name, pos }))
    ))
  }

  /** Look for labels with classes matching the round abbreviations */
  private get2022Headings(): BracketHeading[] {
    const matches = this.data.htmlTemplate.matchAll(
      /<div class(?:Name)?=\\?"label label(?<round>[^(?:\\|")]+)\\?">(\\n)?\s+<h2>(?<name>.*?)<\/h2>/g
    )
    const labels: { round: string; name: string }[] = []

    for (const match of matches) {
      const groups = match.groups as { round: string; name: string }

      if (groups) {
        labels.push({
          round: groups.round,
          name: groups.name
            .replace(/<[^>]+>/g, '')
            .replace(/\\n/g, '')
            .trim(),
        })
      }
    }

    const bracketPositions = this.getAllBracketPositions()
    const headings: BracketHeading[] = []

    bracketPositions.forEach((bracketPosition) => {
      const round = bracketPosition.bracketPosition.match(/^[^-]+/)[0]
      const position = bracketPosition.bracketPosition.match(/-M(\d+)/)[1]

      const label = labels.find((_label) => {
        if (round === 'GF') {
          return _label.round === 'GF' || _label.round === 'Finals'
        }

        return _label.round === round
      })

      headings.push({
        pos: parseInt(position),
        name: label?.name || ''
      })
    })

    return headings
  }

  abstract getAllBracketPositions(): { bracketPosition: string }[]

  protected addRoundNamesToMatches(
    matches: BracketMatchWithoutRoundName[],
  ): MappedBracketMatch[] {
    let round: string = ''

    return matches.map((match) => {
      const newRound = this.headings.find((heading) => {
        const position = match.position.match(/-M(\d+)/)?.[1]

        return heading.pos === parseInt(position)
      })

      if (newRound) {
        round = newRound.name
      }

      return { ...match, round }
    })
  }

  protected determineRoundAndPositionNumbersFromString(
    matches: PartialBracketMatch[],
  ): BracketMatchWithoutRoundName[] {
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

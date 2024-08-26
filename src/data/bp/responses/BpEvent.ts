import he from 'he'
import TournamentData from '../../TournamentData.js'
import { EventT, Match } from '../types.js'
import BracketSlotData from '../../BracketSlotData.js'
import MatchData from '../../MatchData.js'
import BpMatch from './BpMatch.js'
import BpGroup from './BpGroup.js'
import BpBracketSlot from './BpBracketSlot.js'

interface BracketRounds {
  [roundName: string]: Match[]
}

export default class BpEvent extends TournamentData {
  private static nonBracketRounds = ['Major Qualifier']
  private nonBracketMatches: BpMatch[] = []
  private _bracketSlots: BpBracketSlot[] = []
  private _groups: BpGroup[] = []

  constructor(private data: Omit<EventT, 'teams'>, private matchesData: Match[]) {
    super()

    // The next winner match ids are (currently) scuffed on the ewc 2024 bracket so they need
    // updating manually. Bracket displays wrong on bp website.
    if (data.id === 51) {
      this.fixEwcBracketMatches()
    }

    this.processMatches()
  }

  id(): number | null {
    return this.data.id
  }

  idType(): 'CDL' | 'BP' {
    return 'BP'
  }

  bracketMapFile(): string | null {
    return undefined
  }

  bracketSlots(): BracketSlotData[] {
    return this._bracketSlots
  }

  bracketType(): "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | null {
    return this.format() === 'BRACKET'
      ? this.data.tournament_elimination_type.toUpperCase() as Uppercase<EventT['tournament_elimination_type']>
      : null
  }

  endDate(): Date | null {
    return this.matchesData.length ? new Date(this.matchesData[this.matchesData.length - 1].datetime) : null
  }

  format(): 'BRACKET' | 'ROUND' {
    return this.data.number_of_tournament_bracket_teams === null ? 'ROUND' : 'BRACKET'
  }

  groups(): TournamentData[] {
    return this._groups
  }

  hasGroupPlay(): boolean {
    return !!this._groups.length
  }

  isGroupPlay(): boolean {
    return false
  }

  matches(): MatchData[] {
    return this.nonBracketMatches
  }

  name(): string {
    return he.decode(this.data.name)
  }

  release(): string | null {
    const releaseMap: { [year: number]: string } = {
      2021: 'CW',
      2022: 'Vanguard',
      2023: 'MWII',
      2024: 'MWIII',
      2025: 'BO6',
    }

    return releaseMap[this.data.season_id] || null
  }

  splitType(): "QUALIFIERS" | "FINAL" | null {
    return this.data.tier === 'Qualifier' ? 'QUALIFIERS' : 'FINAL'
  }

  startDate(): Date | null {
    return this.matchesData.length ? new Date(this.matchesData[0].datetime) : null
  }

  private isNonBracketRound(roundName: string): boolean {
    return BpEvent.nonBracketRounds.some((round) => roundName.startsWith(round))
  }

  private processMatches(): void {
    const bracketMatches: Match[] = []

    // Separate any non-bracket matches.
    this.matchesData.forEach((match) => {
      if (!match.round || this.isNonBracketRound(match.round.name)) {
        this.nonBracketMatches.push(new BpMatch(match))

        return
      }

      bracketMatches.push(match)
    })

    // Split into separate brackets with properly sorted rounds and matches.
    const brackets = this.createSortedBrackets(bracketMatches)

    // Finally, create the bp bracket classes and add them to the event.
    this.processBrackets(brackets)
  }

  private createSortedBrackets(matches: Match[]): { [bracketName: string]: BracketRounds } {
    const brackets: { [group: string]: BracketRounds } = {}

    matches.forEach((match) => {
      const bracketName = this.getBracketName(match)

      brackets[bracketName] ??= {}
      brackets[bracketName][match.round.name] ??= []

      brackets[bracketName][match.round.name].push(match)
    })

    for (const bracketName in brackets) {
      brackets[bracketName] = this.sortBracketRoundsAndMatches(brackets[bracketName])
    }

    return brackets
  }

  private getBracketName(match: Match): string {
    if (match.round.name.startsWith('Group Play')) {
      return match.round.name.match(/(Group Play \S+?)\b/)[1]
    }

    return 'Main'
  }

  private sortBracketRoundsAndMatches(bracket: BracketRounds): BracketRounds {
    const roundOrder = {
      'Group Play .* Elimination Round': 0,
      'Elimination Round': 1,
      'Group Play .* Winners Round': 2,
      'Winners Round': 3,
      'Group Play .* Losers Qualifier Round': 4,
      'Group Play .* Winners Qualifier Round': 5,
      'Elimination Finals': 6,
      'Winners Finals': 7,
      'Grand Finals': 8,
    }

    // Sort the rounds in reverse for now as we need to loop through them backwards in order to sort the matches.
    const reverseSortedRounds = Object.entries(bracket).sort(
      ([aName], [bName]) => {
        const getRoundOrder = (roundName: string): [number, number] => {
          for (const [pattern, value] of Object.entries(roundOrder)) {
            if (new RegExp(pattern).test(roundName)) {
              const match = roundName.match(/\d+/)
              const roundNameNumber = match ? parseInt(match[0]) : 0

              return [value, roundNameNumber]
            }
          }

          throw new Error(`Unrecognized round name "${roundName}".`)
        }

        const [orderA, nameNumberA] = getRoundOrder(aName)
        const [orderB, nameNumberB] = getRoundOrder(bName)

        if (orderA !== orderB) {
          return orderB - orderA
        }

        // If the rounds matched the same name (e.g. 'Winners Round') sort based on the extracted round number
        // (e.g. 1 in 'Winners Round 1')
        if (nameNumberA !== nameNumberB) {
          return nameNumberB - nameNumberA
        }

        // If it still didn't match and getRoundOrder() didn't throw an error, who knows? Maybe they've used
        // A, B, C instead of numbers in the round name. Just sort alphabetically.
        return bName.localeCompare(aName)
      },
    )

    const reverseSortedWinnersRounds: [string, Match[]][] = []
    const reverseSortedLosersRounds: [string, Match[]][] = []

    for (const round of reverseSortedRounds) {
      if (round[0].includes('Loser') || round[0].includes('Elimination')) {
        reverseSortedLosersRounds.push(round)
      } else {
        reverseSortedWinnersRounds.push(round)
      }
    }

    // Sort the matches on each side of the bracket and flip the reversed rounds back to the correct order.
    // This will put all the losers matches first, but that's fine as they're processed separately later on.
    return Object.fromEntries(
      Array.from([
        ...this.sortMatchesInRounds(reverseSortedWinnersRounds),
        ...this.sortMatchesInRounds(reverseSortedLosersRounds),
      ]).reverse(),
    )
  }

  private sortMatchesInRounds(rounds: [string, Match[]][]): [string, Match[]][] {
    let succeedingRoundMatchOrder: Match[] = []

    for (const round of rounds) {
      round[1] = this.sortMatchesInRound(round[1], succeedingRoundMatchOrder)

      // Store the correctly ordered match ids so we can use that when sorting the previous round in the bracket.
      succeedingRoundMatchOrder = round[1]
    }

    return rounds
  }

  private sortMatchesInRound(nodes: Match[], succeedingRoundMatchOrder: Match[]): Match[] {
    // Sort the matches based on the order of the next round's matches.
    return nodes.sort((a, b) => {
      if (!succeedingRoundMatchOrder.length) {
        // The first round in the loop should be GF (or WF for group brackets) in the case of the winners side
        // and LF in the case of the losers side. For any of these, there should only be 1 match. If there happens
        // to be more than one for some reason (maybe BP handles bracket resets like that?) sort by match id.
        return a.id - b.id
      }

      if (a.winner_next_match_id === b.winner_next_match_id) {
        return a.winner_next_match_team_position === 'team1'
          || a.winner_next_match_team_position === 'team 1'
            ? -1
            : 1
      }

      let aWinnerNextMatchIndex = succeedingRoundMatchOrder.findIndex(
        (match) => match.id === a.winner_next_match_id,
      )
      let bWinnerNextMatchIndex = succeedingRoundMatchOrder.findIndex(
        (match) => match.id === b.winner_next_match_id,
      )

      if (aWinnerNextMatchIndex === -1 || bWinnerNextMatchIndex === -1) {
        // The next winner match ids don't line up with the next round's match ids. If it's a completed bracket,
        // it should be possible to find the next match using the teams instead.
        const findNextMatchIndexFromTeams = (match: Match): number => succeedingRoundMatchOrder.findIndex(
          (nextMatch) => nextMatch.team_1_id === match.winner_id || nextMatch.team_2_id === match.winner_id,
        )

        if (a.winner_id && b.winner_id) {
          aWinnerNextMatchIndex = findNextMatchIndexFromTeams(a)
          bWinnerNextMatchIndex = findNextMatchIndexFromTeams(b)
        }

        if (aWinnerNextMatchIndex === -1 || bWinnerNextMatchIndex === -1) {
          // Now it's a lost cause. The bracket may need to be manually fixed a la EWC 2024.
          throw new Error(
            `winner_next_match_ids "${a.winner_next_match_id}", "${b.winner_next_match_id}" `
            + `not found in succeeding round's matches (${succeedingRoundMatchOrder.join(', ')})`
          )
        }
      }

      return aWinnerNextMatchIndex - bWinnerNextMatchIndex
    })
  }

  private processBrackets(brackets: { [bracketName: string]: BracketRounds }): void {
    for (const bracket in brackets) {
      let group: BpGroup | null = null

      if (bracket !== 'Main') {
        group = new BpGroup(bracket)
      }

      let winnersRoundNumber = 1
      let losersRoundNumber = 1

      for (const round in brackets[bracket]) {
        const isLosersRound = round.includes('Losers') || round.includes('Elimination')
        const roundNumber = isLosersRound ? losersRoundNumber : winnersRoundNumber

        brackets[bracket][round].forEach((match, index) => {
          const slot = new BpBracketSlot(new BpMatch(match), roundNumber, index + 1)

          if (group) {
            group.addSlot(slot)
          } else {
            this._bracketSlots.push(slot)
          }
        })

        if (isLosersRound) {
          losersRoundNumber++
        } else {
          winnersRoundNumber++
        }
      }

      if (group) {
        this._groups.push(group)
      }
    }
  }

  private fixEwcBracketMatches(): void {
    const opticWr1Match = this.matchesData.find((match) => match.id === 92256)

    if (!opticWr1Match || opticWr1Match.winner_next_match_id !== null) {
      // It's probably fixed so don't bother.
      return
    }

    this.matchesData = this.matchesData.map((match) => {
      if (match.id === 92259) {
        match.winner_next_match_team_position = 'team2'
      }
      if (match.id === 92256) {
        match.winner_next_match_team_position = 'team1'
      }

      // Surge vs Ravens and Ultra vs Thieves
      if (match.id === 92259 || match.id === 92258) {
        // Go to Surge vs Thieves
        match.winner_next_match_id = 93237
      }

      // FaZe vs Breach and OpTic vs C9
      if (match.id === 92257 || match.id === 92256) {
        // Go to FaZe vs OpTic
        match.winner_next_match_id = 92261
      }

      return match
    })
  }
}

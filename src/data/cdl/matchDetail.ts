import { getMatchDetail as getStaticMatchDetail } from './staticData.js'
import CdlMatchGame from './responses/CdlMatchGame.js'
import CdlMatch from './responses/CdlMatch.js'
import CdlMatchPlayerGame from './responses/CdlMatchPlayerGame.js'
import { logNewline, logVerbose } from '../../lib/logger.js'

export const getMatchDetail = async (id: number): Promise<CdlMatch> => {
  logNewline(true)
  logVerbose(`Fetching data for match ${id} (cdl_id).`)

  const { matchData } = (await getStaticMatchDetail(id)).cdlMatchDetail
  const { matchStats } = matchData

  logVerbose('Data fetched.')

  const match = new CdlMatch(matchData.matchExtended)

  // matchStats can be an empty array (for some reason). Currently on all 2024 matches.
  const hostPlayers = matchStats && !Array.isArray(matchStats)
    ? matchStats.matches.hostTeam.flat(1)
    : []
  const awayPlayers = matchStats && !Array.isArray(matchStats)
    ? matchStats.matches.guestTeam.flat(1)
    : []

  for (const gameData of matchData.matchGamesExtended) {
    const game = new CdlMatchGame(gameData.matchGame, matchData.matchExtended, gameData.matchGameResult)

    hostPlayers
      .filter((player) => (
        player.gameMode === gameData.matchGame.mode && player.gameMap === gameData.matchGame.map
      ))
      .forEach((player) => game.addPlayer(new CdlMatchPlayerGame(player, match.team1().id())))

    awayPlayers
      .filter((player) => (
        player.gameMode === gameData.matchGame.mode && player.gameMap === gameData.matchGame.map
      ))
      .forEach((player) => game.addPlayer(new CdlMatchPlayerGame(player, match.team2().id())))

    match.addGame(game)
  }

  match.calculatePlayerOveralls(matchData.matchExtended.homeTeamCard.id)
  match.calculatePlayerOveralls(matchData.matchExtended.awayTeamCard.id)

  logVerbose('Mapped data into MatchData.')

  return match
}

export const getMultipleMatchDetail = async (ids: number[]): Promise<CdlMatch[]> => {
  logNewline(true)
  logVerbose(`Fetching data for ${ids.length} matches.`)

  const matches: CdlMatch[] = []
  let count = 1

  for (const id of ids) {
    matches.push(await getMatchDetail(id))

    logVerbose(`${count} of ${ids.length} fetched.`)

    count++
  }

  return matches
}

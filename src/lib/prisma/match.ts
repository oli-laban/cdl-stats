import { Prisma, Match } from '@prisma/client'

export const matchExtension = Prisma.defineExtension((client) => client.$extends({
  model:{
    match: {
      async allTournamentMatches(tournamentId: number): Promise<Match[] | null> {
        const tournament = await client.tournament.findFirst({
          where: { id: tournamentId },
          include: {
            matches: true,
            groups: {
              include: {
                matches: true,
              },
            },
          },
        })

        if (!tournament) {
          return null
        }

        return [
          ...tournament.matches,
          ...tournament.groups.flatMap((group) => group.matches),
        ]
      }
    }
  }
}))

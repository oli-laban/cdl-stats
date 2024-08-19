import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seed = async (): Promise<void> => {
  await prisma.release.upsert({
    where: { abbreviation: 'CW' },
    update: {},
    create: {
      abbreviation: 'CW',
      shortName: 'Cold War',
      name: 'Black Ops Cold War',
    },
  })

  await prisma.release.upsert({
    where: { abbreviation: 'Vanguard' },
    update: {},
    create: {
      abbreviation: 'Vanguard',
      shortName: 'Vanguard',
      name: 'Vanguard',
    },
  })

  await prisma.release.upsert({
    where: { abbreviation: 'MWII' },
    update: {},
    create: {
      abbreviation: 'MWII',
      shortName: 'Modern Warfare II',
      name: 'Modern Warfare II',
    },
  })

  await prisma.release.upsert({
    where: { abbreviation: 'MWIII' },
    update: {},
    create: {
      abbreviation: 'MWIII',
      shortName: 'Modern Warfare III',
      name: 'Modern Warfare III',
    },
  })

  await prisma.release.upsert({
    where: { abbreviation: 'BO6' },
    update: {},
    create: {
      abbreviation: 'BO6',
      shortName: 'Black Ops 6',
      name: 'Black Ops 6',
    },
  })

  await prisma.mode.upsert({
    where: { shortName: 'HP' },
    update: {},
    create: {
      shortName: 'HP',
      name: 'Hardpoint',
      scoringType: 'POINTS',
      winningScore: 250,
    },
  })

  await prisma.mode.upsert({
    where: { shortName: 'SND' },
    update: {},
    create: {
      shortName: 'SND',
      name: 'Search & Destroy',
      scoringType: 'ROUNDS',
      winningScore: 3,
    },
  })

  await prisma.mode.upsert({
    where: { shortName: 'CTRL' },
    update: {},
    create: {
      shortName: 'CTRL',
      name: 'Control',
      scoringType: 'ROUNDS',
      winningScore: 6,
    },
  })
}

seed()
  .then(async (): Promise<void> => {
    await prisma.$disconnect()
  })
  .catch(async (error): Promise<void> => {
    console.error(error)

    await prisma.$disconnect()

    process.exit(1)
  })

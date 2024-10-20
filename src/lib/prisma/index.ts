import { PrismaClient } from '@prisma/client'
import { matchExtension } from './match.js'

export type IdType = 'CDL' | 'BP'

export type GameMode = 'HP' | 'SND' | 'CTRL'

const prisma = new PrismaClient().$extends(matchExtension)

const externalIdField = <T = number>(type: IdType, id: T): { cdlId: T } | { bpId: T } =>
  type === 'CDL' ? { cdlId: id } : { bpId: id }

export { prisma, externalIdField }
export type ExtendedPrismaClient = typeof prisma

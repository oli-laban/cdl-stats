import { PrismaClient } from '@prisma/client'
import { matchExtension } from './match.js'

const prisma = new PrismaClient().$extends(matchExtension)

const externalIdField = (type: 'CDL' | 'BP', id: number): { cdlId: number } | { bpId: number } => (
  type === 'CDL' ? { cdlId: id } : { bpId: id }
)

export { prisma, externalIdField }
export type ExtendedPrismaClient = typeof prisma

import type { IPasswordResetTokenRepository } from '@domain/repositories/IPasswordResetTokenRepository'
import { prisma } from '@infrastructure/database/prisma'

export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  async deleteByUserId(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { userId } })
  }

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    })
  }

  async findValidByTokenHash(tokenHash: string): Promise<{ id: string; userId: string } | null> {
    const row = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, userId: true },
    })
    return row
  }

  async deleteById(id: string): Promise<void> {
    await prisma.passwordResetToken.delete({ where: { id } })
  }
}

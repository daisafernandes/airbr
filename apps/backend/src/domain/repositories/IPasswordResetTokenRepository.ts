export interface IPasswordResetTokenRepository {
  deleteByUserId(userId: string): Promise<void>
  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>
  findValidByTokenHash(tokenHash: string): Promise<{ id: string; userId: string } | null>
  deleteById(id: string): Promise<void>
}

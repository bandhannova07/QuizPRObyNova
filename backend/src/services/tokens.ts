import crypto from 'crypto'
import { prisma } from './prisma'

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

export async function createVerificationToken(userId: string, ttlMs: number) {
  const token = generateToken()
  const expires = new Date(Date.now() + ttlMs)
  await prisma.verificationToken.create({ data: { user_id: userId, token, expires_at: expires } })
  return token
}

export async function consumeVerificationToken(token: string) {
  const row = await prisma.verificationToken.findUnique({ where: { token } })
  if (!row) return null
  if (row.expires_at < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return null
  }
  await prisma.verificationToken.delete({ where: { token } })
  return row.user_id
}

export async function createPasswordResetToken(userId: string, ttlMs: number) {
  const token = generateToken()
  const expires = new Date(Date.now() + ttlMs)
  await prisma.passwordResetToken.create({ data: { user_id: userId, token, expires_at: expires } })
  return token
}

export async function consumePasswordResetToken(token: string) {
  const row = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!row) return null
  if (row.expires_at < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } })
    return null
  }
  await prisma.passwordResetToken.delete({ where: { token } })
  return row.user_id
}

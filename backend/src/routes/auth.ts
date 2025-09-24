import { Router } from 'express'
import { z } from 'zod'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { prisma } from '../services/prisma.js'
import { createVerificationToken, consumeVerificationToken, createPasswordResetToken, consumePasswordResetToken } from '../services/tokens.js'
import { sendEmail } from '../services/email.js'

export const router = Router()

const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  country: z.string().length(2),
  password: z.string().min(8),
})

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  const { username, email, country, password } = parsed.data
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existing) return res.status(409).json({ error: 'User exists' })
  const password_hash = await argon2.hash(password)
  const user = await prisma.user.create({ data: { username, email, country, password_hash, role: 'user' } })
  // Send email verification
  const token = await createVerificationToken(user.id, 1000 * 60 * 60) // 1 hour
  const base = process.env.FRONTEND_URL || 'https://app.placeholder-domain.com'
  const link = `${base}/verify-email?token=${encodeURIComponent(token)}`
  await sendEmail({
    to: user.email,
    subject: 'Verify your QuizPRO email',
    html: `<p>Welcome to QuizPRO!</p><p>Verify your email by clicking <a href="${link}">this link</a>. This link expires in 1 hour.</p>`,
  })
  return res.json({ id: user.id, message: 'Verification email sent' })
})

router.post('/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await argon2.verify(user.password_hash, password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const access = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '15m' })
  const refresh = jwt.sign({ sub: user.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' })
  res.cookie('refresh_token', refresh, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 30*24*3600*1000 })
  res.json({ access_token: access })
})

// Request verification email again
router.post('/request-verification', async (req, res) => {
  const schema = z.object({ email: z.string().email() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(200).json({ message: 'If the email exists, a verification was sent' })
  if (user.email_verified) return res.status(200).json({ message: 'Already verified' })
  const token = await createVerificationToken(user.id, 1000 * 60 * 60)
  const base = process.env.FRONTEND_URL || 'https://app.placeholder-domain.com'
  const link = `${base}/verify-email?token=${encodeURIComponent(token)}`
  await sendEmail({ to: user.email, subject: 'Verify your QuizPRO email', html: `<p>Click <a href="${link}">here</a> to verify. Expires in 1 hour.</p>` })
  res.json({ message: 'Verification email sent' })
})

// Verify email
router.get('/verify', async (req, res) => {
  const token = String(req.query.token || '')
  if (!token) return res.status(400).json({ error: 'token required' })
  const userId = await consumeVerificationToken(token)
  if (!userId) return res.status(400).json({ error: 'invalid or expired token' })
  await prisma.user.update({ where: { id: userId }, data: { email_verified: true } })
  res.json({ message: 'Email verified' })
})

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  const schema = z.object({ email: z.string().email() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(200).json({ message: 'If the email exists, a reset link was sent' })
  const token = await createPasswordResetToken(user.id, 1000 * 60 * 60)
  const base = process.env.FRONTEND_URL || 'https://app.placeholder-domain.com'
  const link = `${base}/reset-password?token=${encodeURIComponent(token)}`
  await sendEmail({ to: user.email, subject: 'Reset your QuizPRO password', html: `<p>Reset your password <a href="${link}">here</a>. Expires in 1 hour.</p>` })
  res.json({ message: 'If the email exists, a reset link was sent' })
})

// Reset password
router.post('/reset-password', async (req, res) => {
  const schema = z.object({ token: z.string().min(10), password: z.string().min(8) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  const { token, password } = parsed.data
  const userId = await consumePasswordResetToken(token)
  if (!userId) return res.status(400).json({ error: 'invalid or expired token' })
  const password_hash = await argon2.hash(password)
  await prisma.user.update({ where: { id: userId }, data: { password_hash } })
  res.json({ message: 'Password updated' })
})

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../services/prisma.js'
import { requireAuth } from '../services/middleware.js'
import { updateLeaderboard } from '../services/leaderboard.js'

export const router = Router()

router.use(requireAuth)

router.post('/start', async (req, res) => {
  const user = (req as any).user
  const session = await prisma.gameSession.create({
    data: {
      user_id: user.sub,
      mode: 'classic',
      questions_played: [],
      score: 0,
      correct_count: 0,
      wrong_count: 0,
      streaks: [],
    },
  })
  res.json({ sessionId: session.id })
})

router.post('/finish', async (req, res) => {
  const user = (req as any).user
  const schema = z.object({
    sessionId: z.string().uuid(),
    score: z.number().int().min(0),
    correct_count: z.number().int().min(0),
    wrong_count: z.number().int().min(0),
    questions_played: z.array(z.any()).min(1),
    streaks: z.array(z.any()).optional().default([]),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  const { sessionId, score, correct_count, wrong_count, questions_played, streaks } = parsed.data
  const updated = await prisma.gameSession.update({
    where: { id: sessionId },
    data: { score, correct_count, wrong_count, questions_played, streaks },
  })
  await updateLeaderboard(user.sub, score)
  res.json({ ok: true, session: { id: updated.id, score: updated.score } })
})

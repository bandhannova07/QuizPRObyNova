import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../services/prisma.js'
import { requireAdmin } from '../services/middleware.js'

export const router = Router()

router.use(requireAdmin)

router.get('/questions', async (_req, res) => {
  const items = await prisma.question.findMany({ take: 100, orderBy: { created_at: 'desc' } })
  res.json({ items })
})

router.post('/questions', async (req, res) => {
  const schema = z.object({
    category: z.enum(['GK','Geography','Science','Literature','Technology','PopCulture','Sports','Travel']),
    difficulty: z.enum(['easy','medium','hard']),
    question_text: z.string().min(5),
    options: z.array(z.string()).length(4),
    correct_index: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
    image_url: z.string().url().optional(),
    audio_url: z.string().url().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  const admin = (req as any).user
  const q = await prisma.question.create({ data: { ...parsed.data, created_by: admin.sub, source: 'admin' } })
  res.json({ id: q.id })
})

router.put('/questions/:id', async (req, res) => {
  const id = String(req.params.id)
  const schema = z.object({
    question_text: z.string().min(5).optional(),
    options: z.array(z.string()).length(4).optional(),
    correct_index: z.number().int().min(0).max(3).optional(),
    explanation: z.string().optional().nullable(),
    image_url: z.string().url().optional().nullable(),
    audio_url: z.string().url().optional().nullable(),
    category: z.enum(['GK','Geography','Science','Literature','Technology','PopCulture','Sports','Travel']).optional(),
    difficulty: z.enum(['easy','medium','hard']).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  await prisma.question.update({ where: { id }, data: parsed.data })
  res.json({ ok: true })
})

router.delete('/questions/:id', async (req, res) => {
  const id = String(req.params.id)
  await prisma.question.delete({ where: { id } })
  res.json({ ok: true })
})

import { Router } from 'express'
import { prisma } from '../services/prisma.js'

export const router = Router()

router.get('/', async (_req, res) => {
  const items = await prisma.question.findMany({ take: 50 })
  res.json({ items })
})

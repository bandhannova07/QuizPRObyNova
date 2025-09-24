import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { router as auth } from './routes/auth.js'
import { router as questions } from './routes/questions.js'
import { router as play } from './routes/play.js'
import { router as leaderboard } from './routes/leaderboard.js'
import { router as admin } from './routes/admin.js'
import * as Sentry from '@sentry/node'
import { initSentry } from './sentry.js'

export function createServer() {
  const app = express()
  initSentry()

  const corsOrigin = process.env.CORS_ORIGIN || '*'
  app.use(cors({ origin: corsOrigin, credentials: true }))
  app.use(helmet())
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  const limiter = rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000), max: Number(process.env.RATE_LIMIT_MAX || 60) })
  app.use(limiter)

  const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
  app.use(pinoHttp({ logger }))

  if (process.env.SENTRY_DSN) {
    app.use(Sentry.knownHandlers.requestHandler())
    app.use(Sentry.knownHandlers.tracingHandler())
  }

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/auth', auth)
  app.use('/questions', questions)
  app.use('/play', play)
  app.use('/leaderboard', leaderboard)
  app.use('/admin', admin)

  if (process.env.SENTRY_DSN) {
    app.use(Sentry.knownHandlers.errorHandler())
  }

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  })

  return app
}

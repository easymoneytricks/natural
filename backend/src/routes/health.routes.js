import { Router } from 'express'
import { checkDatabase } from '../config/database.js'
import { env } from '../config/env.js'

const router = Router()

router.get('/health', async (req, res) => {
  try {
    await checkDatabase()
    res.json({ status: 'ok', service: 'natural-beauty-api', database: 'connected', environment: env.nodeEnv })
  } catch {
    res.status(503).json({ status: 'error', service: 'natural-beauty-api', database: 'disconnected' })
  }
})

export default router

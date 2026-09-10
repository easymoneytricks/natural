import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import healthRoutes from './routes/health.routes.js'
import catalogRoutes from './routes/catalog.routes.js'
import authRoutes from './routes/auth.routes.js'
import customerRoutes from './routes/customer.routes.js'
import customerCommerceRoutes from './routes/customerCommerce.routes.js'
import checkoutRoutes from './routes/checkout.routes.js'
import orderRoutes from './routes/order.routes.js'
import paymentRoutes, { webhook } from './routes/payment.routes.js'
import adminRoutes from './routes/admin.routes.js'
import adminCatalogRoutes from './routes/adminCatalog.routes.js'
import adminProductRoutes from './routes/adminProduct.routes.js'
import adminInventoryRoutes from './routes/adminInventory.routes.js'
import adminOrderRoutes from './routes/adminOrder.routes.js'
import adminCustomerRoutes from './routes/adminCustomer.routes.js'
import adminPromotionRoutes from './routes/adminPromotion.routes.js'
import rewardRoutes from './routes/reward.routes.js'
import adminRewardRoutes from './routes/adminReward.routes.js'
import path from 'node:path'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({ origin: env.corsOrigins, credentials: true }))
  app.post('/api/v1/webhooks/razorpay', express.raw({ type: 'application/json', limit: '1mb' }), (req,res,next) => { req.rawBody = req.body; try { req.body = JSON.parse(req.body.toString('utf8')) } catch {} webhook(req,res,next) })
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
  app.use('/api', healthRoutes)
  app.use('/api/v1', catalogRoutes)
  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/customer', customerRoutes)
  app.use('/api/v1/customer', customerCommerceRoutes)
  app.use('/api/v1/checkout', checkoutRoutes)
  app.use('/api/v1', orderRoutes)
  app.use('/api/v1/payments', paymentRoutes)
  app.use('/api/v1/admin', adminRoutes)
  app.use('/api/v1/admin', adminCatalogRoutes)
  app.use('/api/v1/admin', adminProductRoutes)
  app.use('/api/v1/admin', adminInventoryRoutes)
  app.use('/api/v1/admin', adminOrderRoutes)
  app.use('/api/v1/admin', adminCustomerRoutes)
  app.use('/api/v1/admin', adminPromotionRoutes)
  app.use('/api/v1/customer', rewardRoutes)
  app.use('/api/v1/admin', adminRewardRoutes)
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'storage', 'uploads'), { dotfiles: 'deny', index: false }))
  app.use(notFound)
  app.use(errorHandler)
  return app
}

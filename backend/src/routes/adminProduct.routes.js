import { Router } from 'express'
import { requireAdminAuth, requireAdminPermission } from '../middleware/adminAuth.js'
import * as c from '../controllers/adminProduct.controller.js'
const r=Router();r.use(requireAdminAuth);const view=requireAdminPermission('catalog.view'),manage=requireAdminPermission('catalog.manage');r.get('/products',view,c.list);r.get('/products/:id',view,c.detail);r.post('/products',manage,c.save);r.patch('/products/:id',manage,c.save);r.post('/products/:productId/skus',manage,c.sku);r.patch('/products/:productId/skus/:skuId',manage,c.sku);export default r

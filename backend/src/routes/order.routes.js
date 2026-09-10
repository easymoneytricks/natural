import { Router } from 'express'
import { optionalCustomerAuth } from '../middleware/optionalCustomerAuth.js'
import { requireCustomerAuth } from '../middleware/customerAuth.js'
import { createOrder, customerOrder, customerOrders } from '../controllers/order.controller.js'
const router=Router(); router.post('/orders',optionalCustomerAuth,createOrder); router.get('/customer/orders',requireCustomerAuth,customerOrders); router.get('/customer/orders/:orderNumber',requireCustomerAuth,customerOrder); export default router

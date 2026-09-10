import { pool } from '../config/database.js'
import { quote, shippingMethods } from '../services/checkoutPricing.service.js'
export async function getShippingMethods(req,res,next){try{res.json({data:await shippingMethods(pool)})}catch(e){next(e)}}
export async function getQuote(req,res,next){try{res.json({data:await quote(pool,{customerId:req.customer?.id, ...req.body})})}catch(e){next(e)}}

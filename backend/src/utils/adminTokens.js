import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
export const createAdminAccessToken=(id,sessionId)=>jwt.sign({sub:String(id),type:'admin',sessionId:String(sessionId)},env.admin.accessSecret,{expiresIn:env.admin.accessTtl})
export const verifyAdminAccessToken=(token)=>jwt.verify(token,env.admin.accessSecret)
export const createAdminRefreshToken=()=>crypto.randomBytes(48).toString('hex')
export const hashAdminRefreshToken=(token)=>crypto.createHash('sha256').update(token).digest('hex')
export const adminRefreshCookieOptions=()=>({httpOnly:true,secure:env.nodeEnv==='production',sameSite:env.nodeEnv==='production'?'strict':'lax',path:'/api/v1/admin/auth',maxAge:env.admin.refreshTtlDays*86400000})

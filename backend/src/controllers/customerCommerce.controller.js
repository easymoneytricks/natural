import { pool } from '../config/database.js'
import * as cart from '../services/customerCart.service.js'
import * as wishlist from '../services/customerWishlist.service.js'
export const getCart = async (req,res,next) => { try { res.json({ data: await cart.getCart(pool, req.customer.id) }) } catch(e){next(e)} }
export const addCartItem = async (req,res,next) => { try { res.json({ data: await cart.addCartItem(pool, req.customer.id, Number(req.body.skuId), req.body.quantity) }) } catch(e){next(e)} }
export const updateCartItem = async (req,res,next) => { try { res.json({ data: await cart.updateCartItem(pool, req.customer.id, Number(req.params.skuId), req.body.quantity) }) } catch(e){next(e)} }
export const removeCartItem = async (req,res,next) => { try { res.json({ data: await cart.removeCartItem(pool, req.customer.id, Number(req.params.skuId)) }) } catch(e){next(e)} }
export const clearCart = async (req,res,next) => { try { res.json({ data: await cart.clearCart(pool, req.customer.id) }) } catch(e){next(e)} }
export const mergeCart = async (req,res,next) => { try { const result=await cart.mergeCart(pool, req.customer.id, req.body.items, req.body.mergeId); res.json({ data: result }) } catch(e){next(e)} }
export const getWishlist = async (req,res,next) => { try { res.json({ data: await wishlist.listWishlist(pool, req.customer.id) }) } catch(e){next(e)} }
export const addWishlist = async (req,res,next) => { try { res.json({ data: await wishlist.addWishlist(pool, req.customer.id, Number(req.body.productId)) }) } catch(e){next(e)} }
export const removeWishlist = async (req,res,next) => { try { res.json({ data: await wishlist.removeWishlist(pool, req.customer.id, Number(req.params.productId)) }) } catch(e){next(e)} }
export const mergeWishlist = async (req,res,next) => { try { res.json({ data: await wishlist.mergeWishlist(pool, req.customer.id, req.body.productIds) }) } catch(e){next(e)} }

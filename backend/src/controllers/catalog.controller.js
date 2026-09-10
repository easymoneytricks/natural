import { pool } from '../config/database.js'
import * as catalog from '../services/catalog.service.js'

const handle = (operation) => async (req, res, next) => {
  try {
    res.json(await operation(req))
  } catch (error) {
    next(error)
  }
}

export const listProducts = handle((req) => catalog.listProducts(pool, req.query))
export const getProduct = handle((req) => catalog.getProduct(pool, req.params.slug))
export const listCategories = handle(() => catalog.listCategories(pool))
export const getCategory = handle((req) => catalog.getCategory(pool, req.params.slug))
export const listBrands = handle(() => catalog.listBrands(pool))
export const getBrand = handle((req) => catalog.getBrand(pool, req.params.slug))
export const getFilters = handle(() => catalog.getFilters(pool))

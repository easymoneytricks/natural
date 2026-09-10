import { Router } from 'express'
import { getBrand, getCategory, getFilters, getProduct, listBrands, listCategories, listProducts } from '../controllers/catalog.controller.js'

const router = Router()

router.get('/products', listProducts)
router.get('/products/:slug', getProduct)
router.get('/categories', listCategories)
router.get('/categories/:slug', getCategory)
router.get('/brands', listBrands)
router.get('/brands/:slug', getBrand)
router.get('/catalog/filters', getFilters)

export default router

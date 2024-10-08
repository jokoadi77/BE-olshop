import express from 'express'
import { protectedMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js'
import { CreateOrder, AllOrder, DetailOrder, CurrentUserOrder, callbackPayment } from '../controllers/orderController.js'

const router = express.Router()

router.post('/', protectedMiddleware, CreateOrder)

router.get('/', protectedMiddleware, adminMiddleware, AllOrder)

router.get('/:id', protectedMiddleware, adminMiddleware, DetailOrder)

router.get('/current/user', protectedMiddleware, CurrentUserOrder)

router.post('/callback/midtrans', callbackPayment)



export default router
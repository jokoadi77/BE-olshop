import express from 'express'
import {protectedMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js'
import {createProduct, allProduct, detailProduct, updateProduct, deleteProduct, fileUpload} from "../controllers/productController.js"
import { upload } from '../utils/uploadFileHandler.js' 

const router = express.Router()

router.post('/', protectedMiddleware, adminMiddleware, createProduct)

router.get('/', allProduct)

router.get('/:id', detailProduct)

router.put('/:id', protectedMiddleware, adminMiddleware, updateProduct)

router.delete('/:id', protectedMiddleware, adminMiddleware, deleteProduct)

router.post('/file-upload', protectedMiddleware, adminMiddleware, upload.single('image'), fileUpload)



export default router
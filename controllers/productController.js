import asyncHandler from "../middlewares/asyncHandler.js"; 
import Product from "../models/productModel.js";
import { v2 as cloudinary} from 'cloudinary'
import streamifier from 'streamifier'

export const createProduct = asyncHandler(async(req, res) => {
   const newProduct = await Product.create(req.body)

  return  res.status(201).json({
    message: 'Prouct data created',
    data: newProduct
   })
})

export const  allProduct = asyncHandler(async(req, res) => {
    const queryObj = {...req.query}
    const excludeField = ["page", "limit", "name"]
    excludeField.forEach((element) => { delete queryObj[element]})

    let query
    if(req.query.name){
        query = Product.find({
            name: {$regex: req.query.name, $options: 'i'}
        })
    } else {
        query = Product.find(queryObj)
    }


    const page = req.query.page * 1|| 1
    const limitData = req.query.limit * 1 || 6
    const skipData = (page - 1) * limitData 

    query = query.skip(skipData).limit(limitData)

    let countProduct = await Product.countDocuments(queryObj)

    if (req.query.page) {
    
         if(skipData >= countProduct) {
            res.status(404)
            throw new Error("This page doesn't exist")
         }
    }
    const data = await query
    const totalPage = Math.ceil(countProduct / limitData)
    return res.status(200).json({
        message: "Get all product",
        data,
        pagination: {
            totalPage,
            page,
            totalProduct: countProduct
        }
    })
})

export const detailProduct = asyncHandler(async(req, res) => {
    const paramsId = req.params.id
    const data = await Product.findById(paramsId) 

    if (!data) {
        res.status(404)
        throw new Error("Id product not found")
    }

    return res.status(201).json({
        message: "Detail Product display ",
        data
    })
    

})

export const updateProduct = asyncHandler(async(req, res) => {
    const paramsId = req.params.id
    const data = await Product.findByIdAndUpdate(paramsId, req.body, {
        runValidators: false,
        new: true
    })

    return res.status(201).json({
        message: "Product updates successfully",
        data
    })
})

export const deleteProduct = asyncHandler(async(req, res) => {
    const paramsId = req.params.id
        await Product.findByIdAndDelete(paramsId) 

    return res.status(200).json({
        message: "Deleted Product successfully"
    })
})

export const fileUpload = asyncHandler(async(req, res) => {
  const stream = cloudinary.uploader.upload_stream({
    folder: 'uploads',
    allowed_formats: ['jpg', 'png',"webp"]
  },
    function(err, result){
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Failed upload image",
                error: err
            })
            
        }
        res.json({message: "Image successfully uploaded",
                 url: result.secure_url 
        })
    })
    streamifier.createReadStream(req.file.buffer).pipe(stream)
})




   

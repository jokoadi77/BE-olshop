import asyncHandler from "../middlewares/asyncHandler.js"; 
import Product from "../models/productModel.js";


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
    const limitData = req.query.limit * 1 || 30
    const skipData = (page - 1) * limitData 

    query = query.skip(skipData).limit(limitData)

    let countProduct = await Product.countDocuments()

    if (req.query.page) {
    
         if(skipData >= countProduct) {
            res.status(404)
            throw new Error("This page doesn't exist")
         }
    }
    const data = await query
    return res.status(200).json({
        message: "Get all product",
        data,
        count: countProduct
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
    const file = req.file;
    if (!file) {
        res.status(400)
        throw new Error("no File Image uploaded")
    }

    const imageFileName = file.filename
    const pathImageFile = `/uploads/${imageFileName}`

    res.status(200).json({
        message: "Image upload successfully",
        image : pathImageFile
    })
})




   

import asyncHandler from "../middlewares/asyncHandler.js"; 
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";


export const CreateOrder = asyncHandler(async(req, res) => {

    const {email, firstName, lastName, phone, cartItem} = req.body

    if(!cartItem || cartItem.length < 1){
        res.status(400)
        throw new Error("cart is empty")
    }

    let orderItem = []
    let total = 0

    for(const cart of cartItem){
        const productData = await Product.findOne({_id: cart.product})
        if(!productData){
            res.status(404)
            throw new Error("product not found")
        }

        const {name, price, _id} = productData
        const singleProduct = {
            quantity: cart.quantity,
            name,
            price,
            product: _id
        } 
        orderItem = [...orderItem, singleProduct]

        total += cart.quantity * price 
    }

    const order= await Order.create({
        itemsDetail: orderItem,
        total,
        firstName,
        lastName,
        email,
        phone,
        user: req.user.id
    })

 
  return  res.status(201).json({
    total,
    order,
    message: 'Order data created',
   })
})

export const AllOrder = asyncHandler(async(req, res) => {

    const orders = await Order.find()
 
    return  res.status(200).json({
        data: orders,
        message: 'All Data Order',
     })
  })

  export const DetailOrder = asyncHandler(async(req, res) => {
    const orders = await Order.findById(req.params.id)
 
    return  res.status(200).json({
        data: orders,
      message: 'Show detail order product',
     })
  })

  export const CurrentUserOrder = asyncHandler(async(req, res) => {

    const order = await Order.find({'user': req.user.id})
 
    return  res.status(200).json({
        data: order,
      message: 'Curren user order',
     })
  })


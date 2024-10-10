import asyncHandler from "../middlewares/asyncHandler.js"; 
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import midtransClient from 'midtrans-client'
import dotenv from'dotenv'
dotenv.config()

let snap = new midtransClient.Snap({
    isProduction : false,
    serverKey : process.env.MIDTRANS_SERVER,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});



export const CreateOrder = asyncHandler(async(req, res) => {

    const {email, firstName, lastName, phone, cartItem} = req.body

    if(!cartItem || cartItem.length < 1){
        res.status(400)
        throw new Error("cart is empty")
    }

    let orderItem = []
    let orderMidtrans = []
    let total = 0

    for(const cart of cartItem){
        const productData = await Product.findOne({_id: cart.product})
        if(!productData){
            res.status(404)
            throw new Error("product not found")
        }

        const {name, price, _id, stock} = productData

        if(cart.quantity > stock) {
          res.status(404)
          throw new Error(`Product ${name} quantity exceed the  limit from ${stock} stock`)
        }
        const singleProduct = {
            quantity: cart.quantity,
            name,
            price,
            product: _id
        } 
        const shortName = name.substring(0,30)
        
        const singleProductMidtrans = {
            quantity: cart.quantity,
            name: shortName,
            price,
            id: _id
        } 
        orderItem = [...orderItem, singleProduct]
        orderMidtrans = [...orderMidtrans, singleProductMidtrans]

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

    //midtrans
   let parameter = {
        "transaction_details": {
          "order_id": order._id,
          "gross_amount": total
        },
        "item_details": orderMidtrans,
        "customer_details": {
          "first_name": firstName,
          "last_name": lastName,
          "email": email,
          "phone": phone,
          },
      }
      const token = await snap.createTransaction(parameter)
    //midtrans

 
  return  res.status(201).json({
    total,
    order,
    message: 'Order data created',
    token
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

  export const callbackPayment = asyncHandler(async(req, res) => {

  const statusResponse = await snap.transaction.notification(req.body)
        let orderId = statusResponse.order_id;
        let transactionStatus = statusResponse.transaction_status;
        let fraudStatus = statusResponse.fraud_status;
        const orderData = await Order.findById(orderId)
        // Sample transactionStatus handling logic

      
        if(!orderData) {
            res.status(404)
            throw new Error("Order data not found")
        }
  
        if (transactionStatus == 'capture' || transactionStatus == 'settlement'){
            if (fraudStatus == 'accept'){
              const orderProduct = orderData.itemsDetail

              for(const itemProduct of orderProduct) {
                const productData = await Product.findById(itemProduct.product)

                if(!productData) {
                    res.status(404)
                    throw new Error("Product data not found")
                }

                productData.stock = productData.stock - itemProduct.quantity

                 await productData.save()
              }
                orderData.status = "success"
            }
        } else if (transactionStatus == 'cancel' ||
          transactionStatus == 'deny' ||
          transactionStatus == 'expire'){
          // TODO set transaction status on your database to 'failure'
          // and response with 200 OK
          orderData.status = "failed"
        } else if (transactionStatus == 'pending'){
          // TODO set transaction status on your database to 'pending' / waiting payment
          // and response with 200 OK
           orderData.status = "pending"
        }
        await orderData.save()
        return res.status(200).send("Payment notif success")
  }) 
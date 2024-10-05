import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name product required'],
        unique: [true, 'Name product has been used']
    },
    price: {
        type: Number,
    },
    description: {
        type: String,
        required: [true, 'Description product required'],
    },
    image : {
        type: String,
        default: null
    },
    category: {
        type: String,
        required: [true, 'Categorry product required'],
        enum: ['shoes', 'shirt', 't-shirt', 'pants','bag' ],
    },
    stock: {
        type: Number,
        default: 0
    }
  
  }
);


const Product = mongoose.model('Product', productSchema)

export default Product
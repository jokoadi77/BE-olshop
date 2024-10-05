import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator'

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name required'],
        unique: [true, 'Name has been used']
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: [true, 'Email has been used'],
        validate: {
            validator: validator.isEmail,
            message: "input must be in the email format example@example.com"
        }
    },
    password: {
        type: String,
        required: [true, 'Password required'],
        minLength: [6, "Password must be minimum 6 character"] 
    },
    role : {
        type: String,
        enum: ["user", "owner"],
        default: "user"
    }
  
  }
);
userSchema.pre("save", async function(){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function(reqBody){
    return await bcrypt.compare(reqBody, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
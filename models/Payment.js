import mongoose from "mongoose";

const schema = new mongoose.Schema({
   
    createdAt:{
        type:Date,
        default:Date.now()
    },
    
    razorpay_signature:{
            type:String,
            required:true
    }, 
    
    razorpay_payment_id:{
        type:String,
        required:true
    } 
    
    , razorpay_subscription_id:{
        type:String,
        required:true
    }
})

export const Payment = mongoose.model("Payment", schema)
import app from "./app.js";
import { config } from "dotenv";
import cloudinary from "cloudinary"
import { connectDB } from "./config/database.js";
import Razorpay from "razorpay"
import nodeCron from "node-cron"
import { Stats } from "./models/Stats.js";


// establish connection with database
connectDB()

cloudinary.v2.config({
    cloud_name:  process.env.CLOUDINARY_CLIENT_NAME ,
    api_key: process.env.CLOUDINARY_CLIENT_API ,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET 
})

config({
    path:"./config/config.env"
})


export const instance = new Razorpay({
    key_id:  process.env.RAZORPAY_API_KEY ,
    key_secret: process.env.RAZORPAY_API_SECRET
})

nodeCron.schedule("0 0 0 1 * *", async ()=>{
    try {
        await Stats.create({})
    } catch (error) {
            console.log(error)
    }
})

 
// STARTING SERVER
app.listen(process.env.PORT, ()=>{
    console.log("listening on port " + process.env.PORT)
})
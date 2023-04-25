import express  from "express";
import { connectDB } from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors"


const app = express();

// Using Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:['GET', 'POST', 'PUT', 'DELETE']
}))

//ROutes For APIs
import course from "./routes/courseRoutes.js"
import user from "./routes/userRoutes.js"
import payment from "./routes/paymentRoutes.js"
import other from "./routes/otherRoutes.js"

app.use("/api/v1",course)
app.use("/api/v1",user)
app.use("/api/v1",payment)
app.use("/api/v1",other)


export default app

app.get("/",(req,res)=>{
    res.send(`<h1>SIte is working click <a href=${process.env.FRONTEND_URL} >here</a> to visit website </h1>`)
})

import ErrorMiddleware from "./middlewares/Error.js";
app.use(ErrorMiddleware)
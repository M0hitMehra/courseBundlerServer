import express  from "express";
import { connectDB } from "./config/database.js";
import cookieParser from "cookie-parser";



const app = express();

// Using Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

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


import ErrorMiddleware from "./middlewares/Error.js";
app.use(ErrorMiddleware)
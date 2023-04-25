import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
        const { token } = req.cookies;

        if (!token)
                return next(new ErrorHandler("Please login to access this page.", 401));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded._id);

        next();
});

export const authorizeAdmin = (req, res, next) => {
        const { role } = req.user;

        if (role !== "admin")
                return next(
                        new ErrorHandler("Please login as admin to access this page.", 403)
                );

        next();
};


export const authorizeSubscribers = (req, res, next) => {

        if (req.user.subscription.status !== "active" && req.user.role !== "admin" )
                return next(
                        new ErrorHandler("Subscribe to access this page.", 403)
                );

        next();
};
import express  from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { buySubscription, cancelSubscripition, getRazorPayKey } from "../controllers/paymentController.js";

const router = express.Router()
// Buy
router.route('/subscribe').get(isAuthenticated , buySubscription )

// Verfiy
router.route('/paymentverification').post(isAuthenticated , buySubscription )

//get razorpay key
router.route('/razorpaykey').get( getRazorPayKey )

// cancel subscription
router.route('/subscribe/cancel').delete( isAuthenticated , cancelSubscripition,   )




export default router
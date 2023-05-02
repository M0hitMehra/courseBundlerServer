import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import ErrorHandler from "../utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";

export const buySubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.role === "admin")
    return next(
      new ErrorHandler("Admin already have access to all content", 400)
    );

  const plan_id = process.env.PLAN_ID || "plan_Lcv5ExAMpnkGOJ";

  const subscription = await instance.subscriptions.create({
    plan_id,
    customer_notify: 1,
    total_count: 12,
  });

  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  await user.save();

  res.status(200).send({
    success: true,
    subscriptionId: subscription.id,
  });
});

export const paymentVerfication = catchAsyncError(async (req, res, next) => {
  const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } =
    req.body;

  const user = await User.findById(req.user.id);

  const subscription_id = user.subscription.id;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");

  const isAuthentic = generated_signature === razorpay_signature;

  if (!isAuthentic)
    
    return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);

  await Payment.create({
    razorpay_signature,
    razorpay_payment_id,
    razorpay_subscription_id,
  });

  user.subscription.status = "active";

  await user.save();

  res.redirect(
    `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
  );
  console.log(isAuthentic)
});

export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_API_KEY,
  });
});

export const cancelSubscripition = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const subscription_id = user.subscription.id;

  let refund = false;

  await  instance.subscriptions.cancel(subscription_id);

  const payment = await Payment.findOne({
    razorpay_subscription_id: subscription_id,
  });

  const gap = Date.now() - payment.createdAt;

  const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

  if (refundTime > gap) {
   refund = true;
   //  await instance.payment.refund(payment.razorpay_payment_id);
  }

  await payment.remove()
  user.subscription.id = undefined;
  user.subscription.status = undefined;
  user.save();

  
  res.status(200).json({
   success: true,
   message: refund ? "Subscription canceled successfully, You will receive full refund within 7 days" :"Subscription canceled successfully, No refund will be available as subscription was cancelled after 7 days"
 });


});

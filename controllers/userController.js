import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";


export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    
    const file = req.file;
    if (!name || !email || !password || !file)
        return next(new ErrorHandler("Please enter all required fields", 400));

    let user = await User.findOne({ email });

    if (user)
        return next(
            new ErrorHandler("Account is already registered with this email", 409)
        );

    //upload the file in cloudinary


    const fileUri = getDataUri(file);
  
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);    

    user = await User.create({
        email,
        password,
        name,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });



    sendToken(res, user, "Registerd Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new ErrorHandler("Please enter all required fields", 400));

    const user = await User.findOne({ email }).select("+password");

    if (!user)
        return next(new ErrorHandler("Either email or password is incorrect", 401));

    //upload the file in cloudinary

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
        return next(new ErrorHandler("Either email or password is incorrect", 401));

    sendToken(res, user, `Welcome back ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
    res
        .status(200)
        .cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            // secure:true,
            sameSite: "none",
        })
        .json({
            success: true,
            message: "Logged out successfully",
        });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        user,
    });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        return next(new ErrorHandler("Please enter all fields", 400));

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch)
        return next(new ErrorHandler("Old password does not match", 400));

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { email, name } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
    });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
    const file = req.file;

    const user = await User.findById(req.user._id)

    const fileUri = getDataUri(file);
  
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);    

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    user.avatar ={
        public_id :myCloud.public_id,
        url :myCloud.secure_url
    }

    await user.save()

    res.status(200).json({
        success: true,
        message: "Profile Picture updated successfully",
    });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password ${url}. If you have not requested to reset your password please ignore this message`;

    await sendEmail(user.email, "CourseBundler Reset Password", message);

    res.status(200).json({
        success: true,
        message: `Reset token has been sent to ${user.email}`,
    });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
    // const file = req.file

    const { token } = req.params;

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    });

    if (!user) return next(new ErrorHandler("Expired or Invalid token", 401));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});



export const addToplayList = catchAsyncError(async (req, res, next) => {
 
    const user = await User.findById(req.user._id)

    const course = await Course.findById(req.body.id)

    if(!course) return next(new ErrorHandler("Invalid Course",404 ));

    let itemExist = user.playlist.find((item) =>{
            if(item.course.toString() === course._id.toString() ) return true
        return false;
    })

    if(itemExist) return next(new ErrorHandler("Already added to your playlist",409));

    user.playlist.push({
        course: course._id,
        poster:course.poster.url,
    })

    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to playlist successfully",
    });
});


export const removeFromPlayList = catchAsyncError(async (req, res, next) => {
  

    const user = await User.findById(req.user._id)

    const course = await Course.findById(req.query.id)

    if(!course) return next(new ErrorHandler("Invalid Course",404 ));

    let newPlaylist = user.playlist.filter(item=>{
        if(item.course.toString() !== course._id.toString()) return item
    })
    user.playlist = newPlaylist
    await user.save();

    res.status(200).json({
        success: true,
        message: "Removed from playlist successfully",
    });


});


// Admin controller
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users =  await User.find()

    res.status(200).json({
        success: true,
       users
    });

});


export const updateUsers = catchAsyncError(async (req, res, next) => {
    const user =  await User.findById(req.params.id)

    if (!user) return next(new ErrorHandler("User not found", 400));

    user.role = user.role === "admin" ? "user" : "admin"

    await user.save();

    res.status(200).json({
        success: true,
       message: "Updated role successfully",
    });

});


export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user =  await User.findById(req.params.id)

    if (!user) return next(new ErrorHandler("User not found", 400));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    await user.deleteOne();

    res.status(200).json({
        success: true,
       message: "User deleted successfully",
    });

});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
    const user =  await User.findById(req.user._id)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    await user.deleteOne();

    res.status(200).cookie("token",null,{
        expires: new Date(Date.now())
    } ).json({
        success: true,
       message: "Account deleted successfully",
    });

});

User.watch().on('change',async () => {
    const stats =  await Stats.find({}).sort({createdAt:"desc"}).limit(1)
    const subscription = await User.find({"subscription.status":"active"})
    stats[0].users = await User.countDocuments();
    stats[0].subscription = subscription.length
    stats[0].createdAt = new Date(Date.now())
    await stats[0].save()
})
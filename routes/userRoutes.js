import express  from "express";
import { addToplayList, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, register, removeFromPlayList, resetPassword, updateProfile, updateProfilePicture, updateUsers } from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router()


// Register
router.route('/register').post(singleUpload, register)

//login
router.route('/login').post(login)

// logout
router.route('/logout').get(logout)

// Access Profile Page
router.route('/me').get(isAuthenticated , getMyProfile)

router.route('/me').delete(isAuthenticated , deleteMyProfile)

// change password
router.route('/changepassword').put(isAuthenticated , changePassword)

// Update Profile
router.route('/updateprofile').put(isAuthenticated , updateProfile)

// Update Profile Picture
router.route('/updateprofilepicture').put(isAuthenticated ,singleUpload , updateProfilePicture)

// forgot password
router.route('/forgetpassword').post( forgetPassword)

// Add to playlist
router.route('/addtoplaylist').post( isAuthenticated , addToplayList)

// Remove from playlist
router.route('/removefromplaylist').delete( isAuthenticated , removeFromPlayList)


// Resetting password
router.route('/resetpassword/:token').put( resetPassword)


// Admin Routes

router.route('/admin/users').get(isAuthenticated ,authorizeAdmin ,getAllUsers)

router.route('/admin/user/:id').get(isAuthenticated ,authorizeAdmin ,updateUsers).delete(isAuthenticated ,authorizeAdmin , deleteUser)


export default router
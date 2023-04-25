import express  from "express";
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticated ,authorizeSubscribers } from "../middlewares/auth.js";

const router = express.Router()

// Get All Courses without lectures
router.route('/courses').get(getAllCourses)

// create new Course Admin side
router.route('/createcourse').post(isAuthenticated , authorizeAdmin , singleUpload , createCourse)

// Add LEcture
router.route('/course/:id').get(isAuthenticated ,authorizeSubscribers, getCourseLectures).post(isAuthenticated , authorizeAdmin , singleUpload,addLecture).delete(isAuthenticated ,authorizeAdmin ,deleteCourse)

router.route('/lecture').delete(isAuthenticated , authorizeAdmin   ,deleteLecture )


export default router
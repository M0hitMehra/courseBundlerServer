import express  from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { contact, courseRequest, getDashBoardStats } from "../controllers/otherController.js";
 
const router = express.Router()

// Constact form
 router.route("/contact").post(contact)

//  course request
 router.route("/courserequest").post(courseRequest)

//  GEt Admin Stats
router.route("/admin/stats").get(getDashBoardStats)

  

export default router
import { Router } from "express";
import {registerUser,loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router=Router()


router.post("/register",upload.fields([
  {
    name:"avatar",
    maxCount:1 //number of file
  },{
    name:"coverImage",
    maxCount:1
  }
]),registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt,logoutUser)


router.route("/refresh-token").post(refreshAccessToken)

router.route("/getcurrent-user").post(verifyJwt,getCurrentUser)

router.route("/updateAccountDetails").post(verifyJwt,updateAccountDetails)

router.route("/updateavatar").post(verifyJwt,upload.single("avatar"),updateUserAvatar)
export default router
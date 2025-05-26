import { ApiErros } from '../utils/ApiErrors.js'
import jwt from 'jsonwebtoken'
import {asyncHandler} from '../utils/asyncHandler.js'
import {User} from '../models/user.model.js'
export const verifyJwt=asyncHandler(async(req,res,next)=>{
  try {
    console.log(req.cookies)
    const accessToken=  req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer","")
    console.log(accessToken)
    if(!accessToken)
      throw new ApiErros(401,"unauthorize request");
    const decodeToken=await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    console.log(decodeToken)
   const user= await User.findById(decodeToken?._id).select("-password,-refreshToken")
   if(!user)
   {
    throw new ApiErros(401,"invalid accesstoken")
   }
   req.user=user
   next()
  } catch (error) {
    throw new ApiErros(401,error?.message||"inavlid access token")
  }
})
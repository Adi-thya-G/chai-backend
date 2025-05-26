import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiErros} from '../utils/ApiErrors.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.model.js'
import { uploadOncloudinary} from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'

const genearteAccessAndRefershToken=async(userId)=>{
try {
 
  const user=await User.findById(userId)
  const accessToken = await user.generateAccessToken()
  const RefreshToken=await user.generateRefreshshToken()
  user.refreshToken=RefreshToken;
  await user.save({validateBeforeSave:false})
   return {accessToken,RefreshToken}


} catch (error) {
  console.log(error);
  
  throw new ApiErros(500,"something went wrong while genearting refresh and access token")
}
}
const registerUser=asyncHandler(async(req,res)=>{
 const {fullName,email,username,password}=req.body
 console.log("files",req?.files?.coverImage)
 if([fullName,email,username,password].some((fields)=>fields?.trim()===""))
 {
  throw new ApiErros(400," all fields are required")
 }
const exitsedUser= await User.findOne({
  $or:[{username},{email}]
 })
 console.log(exitsedUser)
 if(exitsedUser)
  throw new ApiErros(409,"User with username and email exist")
 
const avatarLocalPath= req.files?.avatar[0]?.path;
 let coverImageLocalPath;
if(req.files && Array.isArray(req.files) && req.files?.coverImage?.length>0)
  coverImageLocalPath=req.files?.coverImage[0]?.path
console.log(coverImageLocalPath,"coverimage")
if(!avatarLocalPath)
  throw new ApiErros(400,"avatar is rerquired")
 
const avatar=await uploadOncloudinary(avatarLocalPath)
const coverImage=await uploadOncloudinary(coverImageLocalPath)
console.log(coverImage,"after upload")
if(!avatar)
   throw new ApiErros(400,"avatar error")

const user=await User.create({
  fullname:fullName,
  avatar:avatar?.url,
  coverImage:coverImage?.url||"",
  email:email,
  password:password,
  username:username.toLowerCase()
})

const createdUser=await User.findOne(user._id).select(
  "-password -refreshToken" //ignore column name 
)

if(!createdUser)
  throw new ApiErros(500,"something went wrong while register user")
return res.status(201).json(
new ApiResponse(200,createdUser,"successfully created new user")
)
}
)

const loginUser=asyncHandler(async(req,res)=>{
  //req body data
  //username,
  //email,
  //find user
  //password check
  //access token and refresh token
  //send cookies
  const {username,password,email}=req.body
 
  if(!(username || email))
  {
    throw new ApiErros(400 ,"username or email is required")
  }
  const user= await User.findOne({
$or:[{username},{email}]    // condition username or email any
  })
  if(!user)
    throw new ApiErros(404,"user does not exit")

 const isPasswordCorrect= await user.isPasswordCorrect(password)
   if(!isPasswordCorrect)
   {
    throw new ApiErros(401,"invalid user credential")
   }
   
   //user is object from User model isPasswordCorrect method get from object only not User model object-> is user
  const {accessToken,RefreshToken}= await genearteAccessAndRefershToken(user._id)
  const logedin=await User.findById(user._id).select("-password -refreshToken")

  const options={
    httpOnly:true, // it only modifief by server
    secure:true,
  }
  



  
  return res.status(200).
  cookie("accessToken",accessToken,options)
  .cookie("refreshToken",RefreshToken,options)
  .json(
    new ApiResponse(200,{
      user:logedin,accessToken,RefreshToken
    },
  "user login successfully")
  )
})

const logoutUser=asyncHandler(async(req,res)=>{
  
  await User.findByIdAndUpdate(req.user._id,{
  $set:{
    refreshToken:undefined
  }
  },{
    new:true // in response new user with undefined refrshtoken that update data get
  })

 const options={
    httpOnly:true, // it only modifief by server
    secure:true,
  }
  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"user logout out")
  )

})

//
const refreshAccessToken=asyncHandler(async(req,res)=>{
  try {
    const refreshToken=req.cookies.refreshToken||req.body.refreshToken;
    if(!refreshToken)
      throw new ApiErros(401,"unauthroize request")
  
    const decodeRefreshToken=await jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodeRefreshToken._id).select("-password")
    if(!user)
      throw new ApiErros(401,"invalid refreshToken")
    if(user.refreshToken!=refreshToken)
      throw new ApiErros(401,"invalid refreshToken expired or used")
    const options={
      httpOnly:true,
      secure:true
    }
    
    const {accessToken,RefreshToken}=await genearteAccessAndRefershToken(user._id)
    
    return res.status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken",RefreshToken)
    .json(new ApiResponse(200,{accessToken:accessToken,refreshToken:RefreshToken},"user logged"))
  } catch (error) {
    throw new ApiErros(500,error?.message||"refreshtoken")
    
  }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body;
  
  const user=await User.findById(req.user._id)

 if(!await user.isPasswordCorrect(oldPassword))
 {
   throw new ApiErros(401,"invalid old password")
 }
 user.password=newPassword;
 await user.save({validateBeforeSave:false})

 return res.status(200).json(new ApiResponse(200,{},"password change successfuly"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
  const user=req.user;
  return res.status(200).json(new ApiResponse(200,req.user,"current user fetch successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body
  if(!(fullname||email))
  {
    throw new ApiErros(400,"username or emial is required");
  }
  const user=await User.findByIdAndUpdate(req.user._id,{
  
   $set:{
    fullname:fullname,
    email:email
   }

  },{new:true})

  return res.status(200).
  json(new ApiResponse(200,user,"data updated"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>
{
 const avatarLocalPath=req.file?.path
 if(!avatarLocalPath)
   throw new ApiErros(400,"avatar file missing")
  console.log(avatarLocalPath)
  const avatar=await uploadOncloudinary(avatarLocalPath)

  if(!avatar?.url)
  {
    throw new ApiErros(400,"Error when upload to cloundinary")

  }

  const user=await User.findByIdAndUpdate(req.user._id,{$set:{
    avatar:avatar?.url
  }},{new:true})
  return res
  .status(200) 
  .json(new ApiResponse(200,user,"avatar upload successfully"))
}
)

export { registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar}
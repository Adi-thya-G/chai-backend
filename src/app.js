import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app=express()

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))
app.use(express.json({
  limit:"20kb"
}))
app.use(express.urlencoded({
  extended:true, // object inside object
  limit:"16kb"
}))

app.use(cookieParser())
//
import userRouter from './routes/user.routes.js'

//routes declartion
app.use("/api/v1/users",userRouter)

app.use(express.static("public"))

export {app}

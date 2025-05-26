import coonectDB from "./db/index.js";
import dotenv from 'dotenv'
import { app } from "./app.js";
dotenv.config({
  path:'./.env'
})
coonectDB()
.then((res)=>{
  app.listen(process.env.PORT||8000,()=>{
    console.log(`http://localhost:${process.env.PORT}`)
  })
})
.catch((error)=>{
  console.log('Mongodb coonection failed:',error)
})
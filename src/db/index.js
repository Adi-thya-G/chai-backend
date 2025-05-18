import mongoose from "mongoose";

import {DB_NAME} from '../constants.js'

const coonectDB=async()=>{
  try {
    console.log(process.env.MONGODB_URI)
  const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
   console.log('mongoodb || db hsot',connectionInstance)  
} catch (error) {
    console.log('MONGODB CONNECTION ERROR',error.message)
    process.exit(1)
  }
}

export default coonectDB
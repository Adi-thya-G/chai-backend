import coonectDB from "./db/index.js";
import dotenv from 'dotenv'

dotenv.config({
  path:'./env'
})
coonectDB()
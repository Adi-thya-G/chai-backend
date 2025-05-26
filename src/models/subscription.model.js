import mongoose from "mongoose";

const subscription=mongoose.Schema({
  subscriber:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  channel:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
})
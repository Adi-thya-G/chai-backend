const asyncHandler=(requesthandler)=>{
  (req,res,next)=>{
    Promise.resolve(requesthandler(req,res,next)).catch((error)=>next(error))

  }

}

export {asyncHandler}
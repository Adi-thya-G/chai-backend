class ApiErros extends Error{
  constructor(stausCode,message="Something went wrong",errors=[],statck=""){
    super(message)
    this.statusCode=stausCode,
    this.data=null,
    this.message=message,
    this.success=false,
    this.errors=errors
   if(statck)
   {
    this.stack=statck
   }
   else{
    Error.captureStackTrace(this,this.constructor)
   }



  }
}

export {ApiErros}
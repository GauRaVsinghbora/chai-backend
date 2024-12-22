class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        statck = ""
    ){
        super(message)
        this.data = null
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.error = errors

        if(stack){
            this.stack = statck;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}


export {ApiError};
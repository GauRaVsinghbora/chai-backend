//You don't need to wrap every asynchronous handler in a try-catch block.

// A higher-order function to handle asynchronous Express route handlers
const asyncHandler = (requestHandler) => {
    // Return a new function that wraps the request handler
    return (req, res, next) => {
        // Execute the requestHandler, which is expected to return a Promise
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err)); // Catch any errors and pass them to the next middleware
    };
};


// const asyncHandler = (func)=>{
//     async(req,res,next)=>{
//         try{
//             await func(req,res,next);
//         } catch(error){
//             res.status(err.code || 500).json({
//                 success: false,
//                 message: err.message
//             })
//         }
//     };
// }

export {asyncHandler};
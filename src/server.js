import connectDB from "./db/index.js";
import "dotenv/config";
import {app} from "./app.js";


connectDB()
  .then(() => {
    app.on("error", (error) => {
        console.log("server connection error",error);
    });
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`📡 server is listing at ${process.env.PORT}`);
    })
  })
  .catch((error) => {
    console.log("mongoDB connection failed !!", error);
  });

//first approach

// import express from "express";
// const app = express();

// ( async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error",(error)=>{
//             console.log("Err:",error);
//             throw error
//         });

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listing at ${process.env.PORT}`);
//         })

//     }catch(error){
//         console.log(error);
//         throw error
//     }
// } )()

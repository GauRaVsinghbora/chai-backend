import mongoose, { connect } from "mongoose";
import {DB_NAME} from "./constants.js"
import connectDB from "./db/index.js";
import 'dotenv/config'; 

connectDB(); 

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
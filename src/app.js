import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(express.json({limit:"16kb"}));   // this is for form data
app.use(express.urlencoded({extended:true,limit:"16kb"}));  // this is for url incoding.
app.use(express.static("pubic"))



export { app };
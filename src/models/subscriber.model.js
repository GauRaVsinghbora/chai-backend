import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
},{timestamps:true});

export const subscriber = mongoose.model("subscriber",subscriberSchema);
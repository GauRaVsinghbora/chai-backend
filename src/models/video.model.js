import mongoose from "mongoose";
import { user } from "./user.model";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videofile:{
        type: String , // cloudinary url
        required: true
    },
    thumbnail:{
        type: String,   // cloudinary url
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required:true
    },
    title:{
        type:String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    duration:{
        type: Number,     // cloudinary url
        required:true,
    },
    views:{
        type: Number,
        default:0
    },
    isPuslished:{
        type: Boolean,
        required: true,
        default: true
    }

},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);   // now we can able to aggregate the videoSchema.
export const video = mongoose.model('video',videoSchema);
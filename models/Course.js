import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please Enter a course title"],
        minLength:[4,"Title must be at least 4 characters"],
        maxLength:[100,"Title can't exceed 100 characters"],
    },
    description:{
        type:String,
        required:[true,"Please Enter a course description"],
        minLength:[10,"description must be at least 10 characters"],
    },
    lectures:[
        {
            title:{
                type:String,
                required:true
            },
            description:{
                type:String,
                required:true
            },
            video:{
                public_id:{
                    type:String,
                    required:true,
                },
                url:{
                    type:String,
                    required:true,
                }
            },
        }
    ],
    poster:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    views:{
        type:Number,
        default:0
    },
    
    numOfVideos:{
        type:Number,
        default:0
    },
    category:{
        type:String,
        required:true,
    },
    
    createdBy:{
        type:String,
        required:[true,"Please enter a creator name"],
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
})

export const Course = mongoose.model("Course", schema)
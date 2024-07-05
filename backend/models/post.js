const mongoose = require('mongoose')
const {ObjectId}=mongoose.Schema.Types

const postSchema = new mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    photo:{
        // URL will be passed here, image will be saved in react lib
        type:String,
        // default:'no photo'
        required:true
    },
    likes:[{
        type:ObjectId,
        ref:"USER"
    }],
    comments:[{
        comment:{type:String},
        posted_by:{type:ObjectId, ref:"USER"}
    }],

    posted_by:{
        // authenticated user's id will automatically come here from USER
        type:ObjectId,
        ref:"USER"
    }
})

mongoose.model("postSchema", postSchema);

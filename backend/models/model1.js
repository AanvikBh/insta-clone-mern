const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        requied:true
    },
    username:{
        type:String,
        requied:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

mongoose.model("USER", userSchema);
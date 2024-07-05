const jwt = require('jsonwebtoken')
const {jwt_secret} = require('../keys')
const mongoose = require('mongoose')
const USER = mongoose.model("USER")

module.exports= (request, response, next)=>{
    console.log("Hello Middleware")
    // check authorization for signin
    // remember to pass this header in paths where authorization is needed and not in sign up and sign in 
    const {authorization}=request.headers
    if(!authorization){
        return response.status(406).json({error:"You need to be logged in."})
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, jwt_secret,(err,payload)=>{
        if(err){
            return response.status(401).json({error:"You need to be logged in."})
        }

        const {_id}=payload
        USER.findById(_id).then((userData)=>{
            request.user=userData
            console.log("This is authorized")
            // console.log(userData)
            next();
        })

    })

}
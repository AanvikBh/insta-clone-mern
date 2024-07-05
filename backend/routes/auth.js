const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const {jwt_token, jwt_secret} = require('../keys')
const jwt = require('jsonwebtoken');
const { json } = require('stream/consumers');
const requireLogin = require('../middlewares/requireLogin');
const USER = mongoose.model("USER")


router.get('/', (request, response)=>{
    response.send("Hello")
})

router.get('/createPost', requireLogin,(request, response)=>{
    // middleware function will run before auth, so next line will not get printed-> add next to the middleware function 
    console.log("hello auth")
})



router.post('/signup', (request, response) => {
    const { name, userName, email, password } = request.body;
    if (!name || !userName || !email || !password) {
        return response.status(422).json({ error: "Please add all required fields" });
    }

    USER.findOne({ $or: [{ email: email }, { userName: userName }] })
        .then((savedUser) => {
            if (savedUser) {
                return response.status(422).json({ error: "User already exists with that email or username!" });
            }

            bcrypt.hash(password, 12)
                .then((hashedPassword) => {
                    const user = new USER({
                        name,
                        userName,
                        email,
                        password: hashedPassword
                    });

                    return user.save();
                })
                .then(() => {
                    response.json({ message: "User Registered successfully" });
                })
                .catch((err) => {
                    console.error(err);
                    response.status(500).json({ error: "Failed to save user" });
                });
        })
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: "Failed to check existing user" });
        });
});

// API for signin: return the token in response 

router.post('/signin', (request, response)=>{
    const {email,password} = request.body;
    if(!email || !password){
        return response.status(422).json({error:"Email or password missing!"})
    }
    USER.findOne({email:email})
        .then((savedUser)=>{
            if(!savedUser){
                return response.status(422).json({error:"User does not exist in the database with this email"})
            }
            console.log(savedUser)

            bcrypt.compare(password, savedUser.password)
                .then((matchFound)=>{
                    if(!matchFound){
                        return response.status(422).json({error:"Invalid Password for this email!"})
                    }
                    else{
                        // return response.status(200).json({message:"Signed in successfully!"})
                        const token = jwt.sign({_id:savedUser.id}, jwt_secret)
                        // send user details from backend to frontend too
                        // console.log(token)
                        const {_id, name, email, userName}=savedUser
                        response.json({token, user:{_id, name, email, userName}})
                    }
                })
                .catch(err=>console.log(err))
        })
})


module.exports = router
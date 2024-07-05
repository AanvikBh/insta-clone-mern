const express = require('express');
const app = express();
const PORT = 4000;
const mongoose = require('mongoose')

const {mongoUrl} = require('./keys')


const jwt = require('jsonwebtoken')
const cors = require('cors')

//Adding schema models 
require('./models/model1')
require('./models/post')



// Middleware functions
app.use(cors())
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/createPost'))

mongoose.connect(mongoUrl)

mongoose.connection.on("connected", ()=>{
    console.log("successful connection to mongodb")
})

mongoose.connection.on("error", ()=>{
    console.log("connection error to mongodb")
})

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

app.listen(PORT, () => {
    console.log("server is running on port " + PORT);
})
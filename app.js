const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://ajayunnikrishnan97:DLBGqmPNB1qnaJ8v@cluster0.ca3hih9.mongodb.net/')

const express = require('express');
const app = express();``
app.use(express.static(__dirname+'/public'));


// User Route
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

// Admin Route
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.listen(7000,()=>{
    console.log("Server Started on http://localhost:7000")
})
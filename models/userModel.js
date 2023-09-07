const mongoose = require("mongoose")

const userSchema  = mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_blocked:{
        type:Boolean,
        required:true,
        default:false
    },
    wallet:{
        type:Number,
        default:0
    },
    walletTransaction:{
        type:Array
    },
    referralCode:{
        type:String,
        required:false
    },
    coupons:{
        type:Array,
    }
})



module.exports = mongoose.model('User',userSchema)
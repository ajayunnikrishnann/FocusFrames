const Address = require("../models/adressModel");
const profileHelper = require('../helpers/profileHelper')
const User = require('../models/userModel')
const cartHelper = require('../helpers/cartHelper')
const bcrypt = require('bcrypt')

const securePassword = async(password)=>{
    try {
        
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const profile = async(req,res)=>{
    try{
        let arr= []
        const user = res.locals.user
        const count = await cartHelper.getCartCount(user.id);
        res.render("profileDetails",{user,arr,count})
    }catch(error){
        console.log(error.message);
        res.redirect('/error-500')
    }

}

const editInfo = async (req,res)=>{
    try{
        const userId = res.locals.user._id;
        const {fname, lname, email, mobile }= req.body;

        const result = await User.updateOne(
            {_id: userId},
            {$set: {fname, lname, email, mobile}}
        );
        res.redirect("/profileDetails")
    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

const editPassword = async(req,res)=>{
    try{
        const newPass = req.body.newPassword;
        // const confPass = req.body.confPass;

        const userId = res.locals.user._id;
        const spassword = await securePassword(newPass);

        const result = await User.updateOne(
            {_id: userId},
            {$set:{password:spassword}}
        );
        res.send({status:true})
    }catch(error){
        console.log(error.message)
    }
   
}

const profileAdress = async(req,res)=>{
    try{
        let arr=[]
        const user = res.locals.user;
        const count = await cartHelper.getCartCount(user.id);
        const address = await Address.find({user:user._id.toString()})
        if(address){
            const ad = address.forEach((x)=>{
                return(arr = x.addresses);
            })
            res.render("profileAdress",{user,arr,count})
        }

    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

//submit adress

const submitAddress = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const name = req.body.name;
      const mobileNumber = req.body.mno;
      const address = req.body.address;
      const locality = req.body.locality;
      const city = req.body.city;
      const pincode = req.body.pincode;
      const state = req.body.state;



      // Create a new address object  
    const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state,
      };

      const updatedUser = await profileHelper.updateAddress(userId,newAddress);
      if(!updatedUser){
        // No matching document found, create a new one
      await profileHelper.createAddress(userId, newAddress);
      }
      res.json({ message: "Address saved" });
      res.redirect("/profileAddress");

    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

//edit address

const editAddress = async (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;
    const mobileNumber = req.body.mobileNumber;
  
    const update = await Address.updateOne(
      { "addresses._id": id }, 
      {
        $set: {
          "addresses.$.name": name,
          "addresses.$.address": address,
          "addresses.$.locality": locality,
          "addresses.$.city": city,
          "addresses.$.pincode": pincode,
          "addresses.$.state": state,
          "addresses.$.mobileNumber": mobileNumber,
        },
      }
    );
  
    res.redirect("/profileDetails");
  };
  
  const deleteAddress = async (req, res) => {
    const userId = res.locals.user._id;
    const addId = req.query.id;
  
    const deleteobj = await Address.updateOne(
      { user: userId }, 
      { $pull: { addresses: { _id: addId } } }
    );
  
    res.redirect("/profileAddress");
  };
  

  const walletTransaction = async(req,res)=>{
    try {
      const user = res.locals.user
      const count = await cartHelper.getCartCount(user.id);
      // const userData= await User.findOne({_id:user._id})
      const wallet = await User.aggregate([
        {$match:{_id:user._id}},
        {$unwind:"$walletTransaction"},
        {$sort:{"walletTransaction.date":-1}},
        {$project:{walletTransaction:1,wallet:1}}
      ])
  
      res.render('walletTransaction',{wallet,count})
      
    } catch (error) {
      console.log(error.message);
    }
  
  
  }
  

module.exports = {
    profile,
    editInfo,
    editPassword,
    profileAdress,
    submitAddress,
    editAddress,
    deleteAddress,
    walletTransaction
}
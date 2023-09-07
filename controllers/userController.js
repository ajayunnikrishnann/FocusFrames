const User = require('../models/userModel');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const userHelper = require('../helpers/userHelper')
const otpHelper = require('../helpers/otpHelper');
const cartHelper = require('../helpers/cartHelper')
const Banner = require('../models/bannerModel')


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id)=> {
    return jwt.sign({id}, process.env.JWT_SECRET_KEY,{
        expiresIn: maxAge
    })
}

const bcrypt = require('bcrypt')
const securePassword = async(password)=>{
    try {
        
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const homeLoad = async(req,res)=>{
    try {
        const user = res.locals.user
        let count = ''
        if(user){
        count = await cartHelper.getCartCount(user.id);
    }
        const product = await Product.aggregate([
            {
              $match: {
                isProductListed: true,
              },
            },
            {
              $lookup: {
                from: "categories", // Replace "categories" with the actual collection name for categories
                localField: "category", // Replace "category" with the actual field name that references the Category collection
                foreignField: "_id", // Replace "_id" with the actual field in the Category collection that matches the "category" field in the Product collection
                as: "populatedCategory",
              },
            },
            {
              $unwind: "$populatedCategory",
            },
            {
              $match: {
                "populatedCategory.isListed": true,
              },
            },
            // {
            //   $project: {
            //     _id: 1, 
            //     name: 1,
            //     description: 1,
            //     // Include other fields you want to show in the result
            //     category: "$populatedCategory",
            //   },
            // },
          ]);
          
          

          const banner = await Banner.find({}) 
 

        res.render("landing",{user:res.locals.user,product,count,banner})          //.............................
    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

const loadRegister = async(req,res)=>{
    try {
        res.render('register')
    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

const insertUser = async(req,res)=>{
    
        const email = req.body.email;
        const mobileNumber = req.body.mno
        const existingUser = await User.findOne({email:email})

        if(!req.body.fname || req.body.fname.trim().length===0){
            return res.render("register",{message:"Name is required"});
        }

        if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
            return res.render("register",{message:"Name should not contain numbers"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.render("register",{message:"Email not valid"});
        }
        
        if(existingUser){
            return res.render("register",{message:"Email already exists"});
        }

        const mobileNumberRegex = /^\d{10}$/;
        if(!mobileNumberRegex.test(mobileNumber)){
            return res.render("register",{message:"Mobile Number should have 10 digit"});
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if(!passwordRegex.test(req.body.password)){
            return res.render("register",{message:"Password should contain 8 characters,one number and a special character"});
        }
        

        if(req.body.password!==req.body.confPassword){
            return res.render("register",{message:"Password and confirm password must be same"})
        }

        await otpHelper.sendOtp(mobileNumber)
        // await otpHelper.sendOtp(mobileNumber,otp)
        // console.log(`Otp is ${otp}`)
    try{
       const appliedCode = req.body.appliedCode
       const ifReferral = await User.findOne({referralCode:appliedCode})
        let wallet = 0
        if(ifReferral){
            wallet = 50
            const updatedReferral = await User.updateOne({referralCode:appliedCode},{$inc: {wallet: 50 }})

        }
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code ='';
        const length = 17;
        for(let i=0;i<length;i++){
            code += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        
        const refCode = req.body.refCode || '' ;
        req.session.userData = {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            mobile: req.body.mno,
            password: req.body.password,
            referralCode: code,
            wallet:wallet
        };


        // req.session.otp = otp;
        req.session.userData = req.body;
        req.session.mobile = mobileNumber
        res.render('verifyOtp')
    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}


const loginLoad = async(req,res)=>{
    try{                                          
       if(res.locals.user!=null){
        res.redirect('/')
       }else{
        res.render('login')
       }
    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

const verifyLogin = async (req, res) => {
    const data = req.body; // Assuming the request body contains the login data
  
    const result = await userHelper.verifyLogin(data);
    if (result.error) {
      res.render('login', { message: result.error });
    } else {
      const token = result.token;
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.redirect('/');
    }
  };


const verifyOtp = async(req,res)=>{
    
    const otp = req.body.otp
    try{
        // const sessionOTP = req.session.otp;
        const userData = req.session.userData;
       
        const verified = await otpHelper.verifyCode(userData.mno,otp)
    

        // if(!sessionOTP || !userData){
        //     res.render('verifyOtp',{message: 'Invalid Session'});
        // }else if(sessionOTP !== otp){
        //     res.render('verifyOtp',{message: 'Invalid Otp'});
        // }else{
            if(verified){
            const spassword = await securePassword(userData.password)
            const user = new User({
                fname: userData.fname,
                lname: userData.lname,
                email: userData.email,
                mobile: userData.mno,
                password: spassword,
                referralCode:userData.referralCode,
                wallet:userData.wallet
            });
            const userDataSave = await user.save()        
            if(userDataSave){
                const token = createToken(user._id);
                res.cookie('jwt',token,{httpOnly: true,maxAge: maxAge * 1000});
               return res.redirect('/')
            }else{
               return res.render('register',{message:"Registration Failed"})
            }
        }else{
            res.render('verifyOtp',{ message: 'Wrong Otp' });
    
          }
    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

const resendOtp = async(req,res)=>{
    const mobileNumber =req.session.mobile

    try{
        const userData = req.session.userData;
        if(!userData){
            res.status(400).json({message:'Invalid or Expired Session'})
        }
        await otpHelper.sendOtp(mobileNumber)
        // const otp = otpHelper.generateOtp()
        // req.session.otp = otp;

        // await otpHelper.sendOtp(mobileNumber,otp)
        // console.log(`Resend Otp is ${otp}`)
        res.render('verifyOtp',{message:'Otp resend Successfully'})
    }catch(error){
        console.log(error.message)
        res.render('verifyOtp',{message:'Failed to send Otp'})
    }
}

const loadForgotPassword = async(req,res)=>{
    try{
        res.render('forgotPassword')
    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

const forgotPasswordOtp = async(req,res)=>{
    const user = await User.findOne({mobile: req.body.mobile})
    if(!user){
        res.render('forgotPassword',{message:"User Not Registered"})
    }else{
        // const OTP = otpHelper.generateOtp()
        // await otpHelper.sendOtp(user.mobile,OTP)
        await otpHelper.sendOtp(user.mobile)
        // console.log(`Forgot Password otp is --- ${OTP}`)
        // req.session.otp = OTP
        req.session.email =user.email
        req.session.mobile = req.body.mobile
        res.render('forgotPasswordOtp')
    }
}

const resetPasswordOtpVerify = async(req,res)=>{
try{
    const mobile = req.session.mobile
    // const otp = req.session.otp
     const reqOtp = req.body.otp
     const verified = await otpHelper.verifyCode(mobile,reqOtp)
    const otpHolder = await User.find({mobile : req.body.mobile})
    if(verified){
        res.render('resetPassword')
    }else{
        res.render('forgotPasswordOtp',{message:"Wrong Otp"})
    }
}catch(error){
    console.log(error.message)
    res.redirect('/error-500')
}
}

const setNewPassword = async(req,res)=>{
    const newpw = req.body.newpassword
    const confpw = req.body.confpassword

    const mobile = req.session.mobile
    const email = req.session.email

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.newpassword)){
        return res.render("resetPassword",{ message: "Password Should Contain atleast 8 characters,one number and a special character" })
    }
    if(newpw === confpw){
        const spassword = await securePassword(newpw)
        const newUser = await User.updateOne({email:email},{$set: {password: spassword}})
       
        res.redirect('/login')
    }else{
        res.render('resetPassword',{message:'Password and Confirm Password is not matching'})
    }
}

const logout = (req,res) =>{
    try{
    res.cookie('jwt', '' ,{maxAge : 1})
    res.redirect('/')
}catch(error){
    console.log(error.message);
    res.redirect('/error-500')
}
}

const displayProduct = async(req,res)=>{
    try{
        const user = res.locals.user
        let count = ''
        if(user){
        count = await cartHelper.getCartCount(user.id);
    }   
         const category = await Category.find({});
        const page = parseInt(req.query.page) || 1;
        const limit =6;
        const skip = (page - 1) * limit; // Calculate the number of products to skip
        const searchQuery = req.query.search || '';
        const categoryId = req.query.category;
        const sortQuery = req.query.sort || 'default';
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice)
        console.log(minPrice)
        console.log(maxPrice)


        // Build the search filter
        let searchFilter = { isListed: true };
        if (searchQuery) {
            searchFilter.$or = [
              { name: { $regex: new RegExp(searchQuery, 'i') } },
              // Add other fields for searching, if needed
            ];
          }
          if (categoryId) {
            searchFilter.category = categoryId; // Add the category filter
          }
          
          if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            console.log("Enter")
            if (!searchFilter.$and) {
                searchFilter.$and = [];
              }
            searchFilter.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
          }
    
          let sortOption = {};
          if (sortQuery === 'price_asc') {
            sortOption = { price: 1 }; 
          } else if (sortQuery === 'price_desc') {
            sortOption = { price: -1 }; 
          }else  {
            sortOption={}
          }

          
      

         // Fetch products with pagination
         const totalProducts = await Product.countDocuments(searchFilter); 
        // const totalProducts = await Product.countDocuments({$and: [{isListed: true},{isProductListed: true}]})
        const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages


        const products = await Product.find(searchFilter)
        // const products = await Product.find({$and: [{isListed: true},{isProductListed: true}]})
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate('category');

        res.render('shop',{product: products,category,count, currentPage:page,totalPages,searchQuery: req.query.search || '', })

    }catch(error){
        console.log(error.message)
        res.redirect('/error-500')
    }
}

const productPage = async(req,res)=>{
    try{
        const user = res.locals.user
        let count = ''
        if(user){
        count = await cartHelper.getCartCount(user.id);
    }
        const id = req.query.id
       
        const product = await Product.findOne({_id : id}).populate('category')
        
        const products = await Product.find({})
      
        res.render('product',{product ,products,count})
    }catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}
const error403 = async(req,res)=>{
    try {
      res.render('errorPages/error-403')
      
    } catch (error) {
      console.log(error.message);
      
    }
  }

  const error404 = async(req,res)=>{
    try {
      res.render('errorPages/error-404')
      
    } catch (error) {
      console.log(error.message);
      
    }
  }

  const error500 = async(req,res)=>{
    try {
      res.render('errorPages/error-500')
      
    } catch (error) {
      console.log(error.message);
      
    }
  }

   const categoryPage = async (req,res) =>{

    try{
        const  categoryId = req.query.id
        const category = await Category.find({ })
        const page = parseInt(req.query.page) || 1; 
        const limit = 3;
        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]}); // Get the total number of products
        const totalPages = Math.ceil(totalProducts / limit);
        const sortQuery = req.query.sort || 'default';

        const categories = await Category.find({ })
        let sortOption = {};
      if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
        sortOption = { price: 1 }; 
      } else if (sortQuery === 'price_desc') {
        sortOption = { price: -1 }; 
      }
         
        const product = await Product.find({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]})
        .skip(skip)
        .sort(sortOption)
        .limit(limit)
        .populate('category')

        res.render('categoryShop',{product,category, currentPage: page, totalPages,categoryId })
    }
    catch(err){
        console.log('category page error',err);
        res.redirect('/error-500')

    }
}
   


module.exports={
    homeLoad,
    loadRegister,
    insertUser,
    verifyOtp,
    loginLoad,
    verifyLogin,
    logout,
    resendOtp,
    loadForgotPassword,
    forgotPasswordOtp,
    resetPasswordOtpVerify,
    setNewPassword,
    displayProduct,
    productPage ,
    error403,
    error404,
    error500
}
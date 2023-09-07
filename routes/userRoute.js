const express = require('express') 
const userRoute = express()
const userController=require("../controllers/userController")
const cartController=require("../controllers/cartController")
const profileController =  require("../controllers/profileController")
const orderController = require("../controllers/orderController")
const wishlistController = require("../controllers/wishlistController")
const validate = require('../middleware/authMiddleware')
const checkBlocked = require('../middleware/blockMiddleware')
const cookieparser = require('cookie-parser')
const session = require('express-session')
const nocache = require('nocache')

userRoute.use(nocache())

userRoute.use(session({
    secret: 'your-secret-key',              //---------------------------
    resave: false,
    saveUninitialized: true,
  }));
  
//viewengine
userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')

//parsing
userRoute.use(express.json())
userRoute.use(express.urlencoded({extended:true}))
userRoute.use(cookieparser())



//homepage
userRoute.all('*',validate.checkUser)
userRoute.get('/',userController.homeLoad)

//register
userRoute.get('/register',userController.loadRegister)
userRoute.post('/register',userController.insertUser)
userRoute.post('/verifyOtp',userController.verifyOtp)

//login
userRoute.get('/login',userController.loginLoad)
userRoute.post('/login',userController.verifyLogin)

userRoute.get('/logout',userController.logout)

userRoute.get('/shop',checkBlocked.checkBlocked,userController.displayProduct)
userRoute.get('/productPage',checkBlocked.checkBlocked,userController.productPage)

//resendOtp
userRoute.get('/resendOtp',userController.resendOtp)

//forgotPassword
userRoute.get('/forgotPassword',userController.loadForgotPassword)
userRoute.post('/forgotPasswordOtp',userController.forgotPasswordOtp)
userRoute.post('/forgotPassword',userController.resetPasswordOtpVerify)

userRoute.post('/setNewPassword',userController.setNewPassword)

userRoute.get('/error-403',userController.error403)
userRoute.get('/error-500',userController.error500)
userRoute.get('/error-404',userController.error404)

//cart
userRoute.get('/cart',checkBlocked.checkBlocked,validate.requireAuth,cartController.loadCart)
userRoute.post('/addToCart/:id',checkBlocked.checkBlocked,validate.requireAuth,cartController.addToCart)
userRoute.put('/change-product-quantity',cartController.updateQuantity)
userRoute.delete("/delete-product-cart",cartController.deleteProduct)


//profile
userRoute.get('/profileDetails',profileController.profile)
userRoute.post('/editInfo',checkBlocked.checkBlocked,validate.requireAuth,profileController.editInfo)
userRoute.post('/editPassword',profileController.editPassword)
userRoute.get('/profileAddress',checkBlocked.checkBlocked,validate.requireAuth,profileController.profileAdress)
userRoute.post('/submitAddress',profileController.submitAddress)
userRoute.post('/updateAddress',profileController.editAddress)
userRoute.get('/deleteAddress',profileController.deleteAddress)
userRoute.get('/wallet',profileController.walletTransaction)

//checkOut
userRoute.get('/checkOut',checkBlocked.checkBlocked,validate.requireAuth,orderController.checkOut)
userRoute.post('/checkOutAddress',orderController.checkOutAddress)
userRoute.post('/changeDefaultAddress',orderController.changePrimary)
userRoute.post('/checkOut',checkBlocked.checkBlocked,validate.requireAuth,orderController.postCheckOut)

userRoute.get('/profileOrderList',checkBlocked.checkBlocked,validate.requireAuth,orderController.orderList)
userRoute.get('/orderDetails',checkBlocked.checkBlocked,validate.requireAuth,orderController.orderDetails)
userRoute.post('/cancelOrder',orderController.cancelOrder)

userRoute.post('/verifyPayment',orderController.verifyPayment)  
userRoute.post('/paymentFailed',orderController.paymentFailed)

userRoute.get('/ordersuccess', (req, res) => { res.render('orderSuccess'); });

userRoute.get('/applyCoupon/:id',orderController.applyCoupon)
userRoute.get('/couponVerify/:id',orderController.verifyCoupon)

userRoute.get('/wishlist',checkBlocked.checkBlocked,validate.requireAuth,wishlistController.getWishList)
userRoute.post('/add-to-wishlist',validate.requireAuth,wishlistController.addWishList)
userRoute.delete('/remove-product-wishlist',wishlistController.removeProductWishlist)

userRoute.get('/invoice',orderController.downloadInvoice)

module.exports=userRoute
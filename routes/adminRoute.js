const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const couponController = require("../controllers/couponController");
const bannerController = require('../controllers/bannerController')
const multer = require("../multer/multer");
const validate = require('../middleware/adminAuth');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const nocache = require('nocache')

adminRoute.use(nocache())

const adminModel = require('../models/adminModel')

adminRoute.use(session({
    secret : 'your-secret-key',
    resave : false,
    saveUninitialized : true,
}));

//view engine
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

//Parsing

adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))
adminRoute.use(cookieparser())
adminRoute.get('*',validate.checkUser)



//homepage
adminRoute.get('/',adminController.loadLogin)
adminRoute.post('/login',adminController.verifyLogin)
adminRoute.get('/dashboard',adminController.loadDashboard)

adminRoute.get('/category',validate.requireAuth,categoryController.loadCategory)
adminRoute.get('/addCategory',validate.requireAuth,categoryController.loadAddCategory)
adminRoute.post('/addCategory',validate.requireAuth,categoryController.createCategory)

adminRoute.get('/editCategory',validate.requireAuth,categoryController.loadUpdateCategory)
adminRoute.post('/editCategory',validate.requireAuth,categoryController.updateCategory)

adminRoute.get('/unListCategory',validate.requireAuth,categoryController.unListCategory)
adminRoute.get('/reListCategory',validate.requireAuth,categoryController.reListCategory)

adminRoute.get('/product',validate.requireAuth,productController.loadProducts)
adminRoute.post('/addProduct',multer.upload,productController.createProduct)
adminRoute.get('/displayProduct',validate.requireAuth,productController.displayProduct)
adminRoute.get('/unListProduct',productController.unListProduct)
adminRoute.get('/reListProduct',productController.reListProduct)
adminRoute.get('/updateProduct',validate.requireAuth,productController.loadUpdateProduct)
adminRoute.post('/updateProduct',multer.upload,productController.updateProduct)

adminRoute.get('/users',validate.requireAuth,adminController.loadUsers)
adminRoute.post('/blockUser',validate.requireAuth,adminController.blockUser)
adminRoute.post('/unBlockUser',validate.requireAuth,adminController.unBlockUser)

adminRoute.get('/logout',adminController.logout)



adminRoute.get('/orderList',validate.requireAuth,adminController.orderList)
adminRoute.get('/orderDetails',validate.requireAuth,adminController.orderDetails)
adminRoute.put('/orderStatus',adminController.changeStatus) 
adminRoute.put('/cancelOrder',adminController.cancelOrder)
adminRoute.put('/returnOrder',adminController.returnOrder)


adminRoute.get('/addCoupon',validate.requireAuth,couponController.loadCouponAdd)
adminRoute.post('/addCoupon',couponController.addCoupon)
adminRoute.get('/generate-coupon-code',validate.requireAuth,couponController.generateCouponCode)
adminRoute.get('/couponList',validate.requireAuth,couponController.couponList)
adminRoute.delete('/removeCoupon',couponController.removeCoupon)

adminRoute.get('/salesReport',validate.requireAuth,adminController.getSalesReport)
adminRoute.post('/salesReport',adminController.postSalesReport)

adminRoute.get('/addBanner',validate.requireAuth,bannerController.addBannerGet)
adminRoute.post('/addBanner',multer.addBannerupload,bannerController.addBannerPost)
adminRoute.get('/bannerList',validate.requireAuth,bannerController.bannerList)

adminRoute.get('/deleteBanner',bannerController.deleteBanner)

module.exports = adminRoute
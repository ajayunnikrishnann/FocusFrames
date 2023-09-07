const Product = require('../models/productModel')
const productHelper = require('../helpers/productHelper')
const Category = require('../models/categoryModel')
const cartHelper = require('../helpers/cartHelper')

const loadProducts = async(req,res)=>{
    try{
     
        const categories = await Category.find({})
        res.render('addProduct',{category:categories})
    }catch(error){
        console.log(error.message)
    }
}

  const createProduct = async(req,res)=>{
    try{
        const categories = await Category.find({})
        if(!req.body.name || req.body.name.trim().length === 0){
            return res.render("addProduct",{message: "Name is required",category:categories});
        }
        if (!req.body.description || req.body.description.trim().length === 0) {
            return res.render("addProduct", { message: "Description is required",category:categories });
        }
        if(req.body.price<=0){
            return res.render("addProduct",{ message: "Product price should be greater than 0",category:categories})
        }
        if(req.body.stock< 0 || req.body.stock.trim().length === 0 ){
            return res.render("addProduct", { message: "Stock  Should be greater than 0",category:categories });
          }
        const images = req.files.map(file => file.filename);
        
        await productHelper.createProduct(req.body,images)
        res.redirect('/admin/displayProduct')
    }catch(error){
        console.log(error.message)
    }
  }

  const displayProduct = async(req,res)=>{
    try{
      
        const product = await Product.find({})
        res.render('displayProduct',{product:product})
    }catch(error){
        console.log(error.message)
    }
  }

  const unListProduct = async(req,res)=>{
    try{
        await productHelper.unListProduct(req.query.id)
        res.redirect('/admin/displayProduct')
    }catch(error){
        console.log(error.message)
    }
  }

  const reListProduct = async(req,res)=>{
    try{
        await productHelper.reListProduct(req.query.id)
        res.redirect('/admin/displayProduct')
    }catch(error){
        console.log(error)
    }
  }

  const loadUpdateProduct = async(req,res)=>{
    try{
        const categories = await Category.find({})
        const id = req.query.id;
        const productData = await Product.findById({_id:id})
        res.render('updateProduct',{product:productData,category:categories})
    }catch(error){
        console.log(error)
    }
  }

  const updateProduct =  async(req,res)=>{
    try{
        
        const productData = await Product.findById(req.body.id);

        if (!req.body.name || req.body.name.trim().length === 0) {
            return res.render("updateProduct", { message: "Name is required",product:productData,category:categories });
        }
        if (!req.body.description || req.body.description.trim().length === 0) {
          return res.render("updateProduct", { message: "Description is required",product:productData,category:categories });
        }
        if(req.body.price<=0){
          return res.render("updateProduct", { message: "Product Price Should be greater than 0",product:productData,category:categories });
        }
        if(req.body.stock<0 || req.body.stock.trim().length === 0 ){
          return res.render("updateProduct", { message: "Stock Should be greater than 0",product:productData,category:categories });
        }
        
        const images = req.files.map(file => file.filename);
        const updatedImages = images.length > 0 ? images : productData.images;
        await productHelper.updateProduct(req.body,updatedImages)
        res.redirect('/admin/displayProduct');
       
    }catch(error){
        console.log(error.message)
    }
  }




module.exports = {
loadProducts,
createProduct,
displayProduct,
unListProduct,
reListProduct,
loadUpdateProduct,
updateProduct

}
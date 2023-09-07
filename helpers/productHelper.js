const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
// const path = require('path');
// const multer = require('multer');
const{ObjectId} = require('mongodb')


const createProduct = async(data, images)=>{
    try{
        const newProduct = new Product({
            name: data.name,
            description: data.description,
            images: images,
            category: data.category,
            stock:data.stock,
            price: data.price
        })
        await newProduct.save();
        return
    }catch(error){
        console.error('Error adding product:', err);
        throw err;
    }
} 

const unListProduct = async(query)=>{
    try{
        const id = query;
        await Product.updateOne({_id: id},{isProductListed:false})
        return;
    }catch(error){
        console.log(error.message)
        throw error;
    }
}

const reListProduct = async (query) => {
    try {
      const id = query;
      const categorylisted = await Product.findOne({ _id: id }).populate('category');
  
      if (categorylisted.category.isListed === true) {
        await Product.updateOne({ _id: id }, { isProductListed: true });
      } else {
        console.log('Cannot Relist');
      }
  
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };
  
  const updateProduct = async(data,images) =>{
    try{
      
      const productData = await Product.updateOne({_id:new ObjectId(data.id)},{$set:{
        name: data.name,
        description: data.description,
        category: data.category,
        images: images,
        stock:data.stock,
        price: data.price
      }})
      
    
    }catch(error){
      console.log(error.message)
    }
  }
  

  




module.exports = {
    createProduct,
    unListProduct,
    reListProduct,
    updateProduct
}
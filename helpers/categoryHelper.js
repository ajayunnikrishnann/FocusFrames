const { trusted } = require('mongoose');
const Category = require('../models/categoryModel')

const createCategory = async (data) => {
  try {
    const category = new Category({ 
        name: data.name.toLowerCase(), 
        description: data.description });
    const savedCategory = await category.save();
    return savedCategory;
  } catch (error) {
    throw error;
  }
};

const loadUpdateCategory = async (id) => {
    try {
      const Categorydata = await Category.findById({ _id: id });
      return Categorydata;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };

const updateCategory = async(categoryId,data)=>{
    try{
        await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:data.category,description:data.description}});
    }catch(error){
        console.log(error.message)
    }
  }
  
const unListCategory = async(categoryId)=>{
    try{
        await Category.findByIdAndUpdate(categoryId,{isListed:false})
                                                                            

    }catch(error){
        console.log(error.message)
    }
}

const reListCategory = async(categoryId)=>{
    try{
        await Category.findByIdAndUpdate(categoryId,{isListed:true});
    }catch(error){
        console.log(error)
    }
}







module.exports = {
    createCategory,
    loadUpdateCategory,
    updateCategory,
    unListCategory,
    reListCategory
}
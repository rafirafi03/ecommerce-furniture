const product = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');

// Code for load the product detail page.
const loadProductDetail = async (req,res) => {
    try {
      const id = req.query.id;
      const products = await product.findOne({_id:id}).populate('category');
      res.render('user/productDetails',{products})
    } catch (error) {
      console.log(error.message);
    }
  
  }

  // Code for load the shop page.
const loadShop = async (req,res) => {
  try {

    const filterCategory = req.query.categoryFilter
    const sortValue = req.query.sort
    const products = await product.find({isListed:true}).populate('category');
    const category = await categoryModel.find({isListed:true});
    const fltrCategory = await product.find({category:filterCategory,isListed:true})

    console.log(sortValue,":srtvlueee")
    if(sortValue){
      if (sortValue === 'all') {
        products
        fltrCategory
      }
    else if (sortValue === 'low to high') {
      products.sort((a,b)=>a.price-b.price)
      fltrCategory.sort((a,b)=>a.price-b.price)
    } else if(sortValue === 'high to low') {
      products.sort((a,b)=>b.price-a.price)
      fltrCategory.sort((a,b)=>b.price-a.price)
    }
  }


    console.log(fltrCategory,":ctoooo")
    res.render('user/shopPage',{products,category,fltrCategory})
  } catch (error) {
    console.log(error.message)
  }
}

  module.exports = {
    loadProductDetail,
    loadShop
  }
const product = require('../../models/productModel');

// Code for load the product detail page.
const loadProductDetail = async (req,res) => {
    try {
      const id = req.query.id;
      const products = await product.findOne({_id:id});
      res.render('user/productDetails',{products})
    } catch (error) {
      console.log(error.message);
    }
  
  }

  // Code for load the shop page.
const loadShop = async (req,res) => {
  try {
    const id = req.query.id;
    const products = await product.find({isListed:true});
    res.render('user/shopPage',{products})
  } catch (error) {
    
  }
}

  module.exports = {
    loadProductDetail,
    loadShop
  }
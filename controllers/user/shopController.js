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
  const loadShop = async (req, res) => {
    try {
        const searchValue = req.query.search;
        const filterCategory = req.query.categoryFilter;
        const sortValue = req.query.sort;
        const pagination = req.query.pagination;

        let productsQuery = product.find({ isListed: true }).populate('category');

        if (filterCategory) {
            productsQuery = productsQuery.find({ category: filterCategory });
        }

        if (searchValue) {
            productsQuery = productsQuery.find({
                name: { $regex: searchValue, $options: 'i' }
            });
        }

        if (sortValue) {
            if (sortValue === 'low to high') {
                productsQuery = productsQuery.sort({ price: 1 });
            } else if (sortValue === 'high to low') {
                productsQuery = productsQuery.sort({ price: -1 });
            }
        }

        
        if (pagination === '2') {
            productsQuery = productsQuery.skip(5);
        } else {
            productsQuery = productsQuery.limit(5);
        }

        const products = await productsQuery;
        const category = await categoryModel.find({ isListed: true });

        const count = products.length;
        

        res.render('user/shopPage', { products, category,count,pagination });
    } catch (error) {
        console.log(error);
        console.log('Error occurred');
        res.status(500).send('Internal Server Error');
    }
};

  

  module.exports = {
    loadProductDetail,
    loadShop
  }
// requiring product model and category model.
const products = require("../../models/productModel");
const category = require('../../models/categoryModel');
const offerModel = require('../../models/offerModel')

// Code for load the products page.
const loadProducts = async (req, res) => {
  try {

    const offers = await offerModel.find({expiry_date:{$gt:new Date().toISOString()}})
 
    const product = await products.find().populate('category');
    res.render("admin/products", { product,offers });
  } catch (error) {
    console.log(error.message);
  }
};

// Code for load the add product page.
const loadAddProducts = async (req, res) => {
  try {
    const Category = await category.find({ isListed: true });
    res.render('admin/addProducts', { Category })
  } catch (error) {
    console.log(error);
  }
}

// Code for post the add product request.
const postAddProducts = async (req, res) => {

  try {
  let { name, quantity, category, price } = req.body;

  const files = req.files.map((item)=>{
    return item.filename;
  })

  const product = new products({
    images: files,
    name: name,
    quantity: quantity,
    category: category,
    price: price,


  });

    await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    // Handle the error here, e.g., send an error response
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Code for load the edit product page.
const loadEditProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await products.findOne({ _id: id });
    const Category = await category.find({ isListed: true })
    res.render('admin/editProducts', { product, Category })
  } catch (error) {
    console.log(error.message);
  }
  
}

// code for post the edit product request.
const postEditProducts = async (req, res) => {
  try {
    const { name, quantity, category, price } = req.body;
    const id = req.query.id;


    // Get filenames of uploaded images
    const files = req.files.map((file) => file.filename);

    // Find existing product data
    const existingData = await products.findOne({ _id: id });

    // Combine existing image filenames with newly uploaded filenames
    const updatedImages = files.concat(existingData.images.slice(files.length));

    // Construct updated product object
    const product = {
      name: name,
      quantity: quantity,
      category: category,
      price: price,
      images: updatedImages
    };

    // Update product in the database
    const result = await products.findOneAndUpdate({ _id: id }, product, { new: true });

    // Redirect to products page
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


// code for list the product
const listProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product1 = await products.findOne({ _id: id });
    if (product1.isListed) {
      product1.isListed = false;
    } else {
      product1.isListed = true;
    }
    await product1.save();
    res.status(200).json({ message: "true" })
  } catch (error) {
    console.log(error);
  }
}



// Exporting required modules.
module.exports = {
  loadProducts,
  loadAddProducts,
  postAddProducts,
  loadEditProducts,
  postEditProducts,
  listProducts
}
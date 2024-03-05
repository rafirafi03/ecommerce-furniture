// requiring product model and category model.
const products = require("../../models/productModel");
const category = require('../../models/categoryModel');

// Code for load the products page.
const loadProducts = async (req, res) => {
  try {
    const product = await products.find().populate('category');
    res.render("admin/products", { product });
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

  console.log(category)

  
  // let { image1, image2, image3, image4 } = req.files;

  // Ensure image1 is defined and is an array

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
    console.log('post errorrrrrrrrr');
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
  let { name, quantity, category, price } = req.body;
  let { images1,images2,images3,images4 } = req.body;
  console.log(req.body);
  const id = req.query.id;

  
  console.log(id," ","iddddddd",category)

  const files = req.files.map((item)=>{
    return item.filename;
  })
  console.log(files," ","filesssssssss");

  const existingData = await products.findOne({ _id: id });

  console.log(existingData," ","exstngdataaaaaaa")

  let img = []

  for (let i = 0; i < existingData.images.length; i++) {
    if (i < files.length) {
      img.push(files[i]);
    } else {
      img.push(existingData.images[i]);
    }
  }

  console.log(img," ","imagessssss")

  const product = {
    name: name,
    quantity: quantity,
    category: category,
    price: price,
    images:img
  }
  const result = await products.findOneAndUpdate({ _id: id }, product, { new: true });

    

res.redirect('/admin/products');
  }

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
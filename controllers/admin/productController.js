// requiring product model and category model.
const products = require("../../models/productModel");
const category = require('../../models/categoryModel');

// Code for load the products page.
const loadProducts = async (req, res) => {
  try {
    const product = await products.find();
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
  let { name, quantity, category, price } = req.body;
  // let { image1, image2, image3, image4 } = req.files;

  // Ensure image1 is defined and is an array

  const image = [
    req.files && req.files.image1 ? req.files.image1[0].filename : null,
    req.files && req.files.image2 ? req.files.image2[0].filename : null,
    req.files && req.files.image3 ? req.files.image3[0].filename : null,
    req.files && req.files.image4 ? req.files.image4[0].filename : null,
  ];


  const product = new products({
    images: {
      image1: image[0],
      image2: image[1],
      image3: image[2],
      image4: image[3],
    },

    name: name,
    quantity: quantity,
    category: category,
    price: price,


  });

  try {
    const result = await product.save();
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
  let { name, quantity, category, price } = req.body;
  const id = req.query.id;

  const files = req.files;

  const existingData = await products.findOne({ _id: id });

  const img = [
    files?.image1 ? (files.image1[0]?.filename || existingData.images.image1) : existingData.images.image1,
    files?.image2 ? (files.image2[0]?.filename || existingData.images.image2) : existingData.images.image2,
    files?.image3 ? (files.image3[0]?.filename || existingData.images.image3) : existingData.images.image3,
    files?.image4 ? (files.image4[0]?.filename || existingData.images.image4) : existingData.images.image4,
  ];

  const product = {
    name: name,
    quantity: quantity,
    category: category,
    price: price,
    images: {
      image1: img[0],
      image2: img[1],
      image3: img[2],
      image4: img[3],
    },
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
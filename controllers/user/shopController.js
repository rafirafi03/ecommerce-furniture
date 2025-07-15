const product = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");
const cartModel = require("../../models/cartModel");
const wishlistModel = require("../../models/wishlistModel");
const mongoose = require('mongoose')

// Code for load the product detail page.
const loadProductDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const userId = req.session.user_id;

    let cartCount = 0;

    if (userId) {
      const cartResult = await cartModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $project: { productCount: { $size: "$product" } } },
      ]);
      cartCount = cartResult.length > 0 ? cartResult[0].productCount : 0;
    }

    const products = await product
      .findOne({ _id: id, isListed: true })
      .populate("category");
    res.render("user/productDetails", { products, cartCount });
  } catch (error) {
    console.log(error.message);
  }
};

// Code for load the shop page.
const loadShop = async (req, res) => {
  try {
    const searchValue = req.query.search;
    const filterCategory = req.query.categoryFilter;
    const sortValue = req.query.sort;
    const pagination = req.query.pagination;
    const userId = req.session.user_id;

    let cartCount = 0;
    let wishlistCount = 0;

    if (userId) {
      const wishlistResult = await wishlistModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $project: { productCount: { $size: "$product" } } },
      ]);

      wishlistCount =
        wishlistResult.length > 0 ? wishlistResult[0].productCount : 0;

      const cartResult = await cartModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $project: { productCount: { $size: "$product" } } },
      ]);
      cartCount = cartResult.length > 0 ? cartResult[0].productCount : 0;
    }

    let productsQuery = product.find({ isListed: true }).populate("category");

    if (filterCategory) {
      productsQuery = productsQuery.find({ category: filterCategory });
    }

    if (searchValue) {
      productsQuery = productsQuery.find({
        name: { $regex: searchValue, $options: "i" },
      });
    }

    if (sortValue) {
      if (sortValue === "low to high") {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sortValue === "high to low") {
        productsQuery = productsQuery.sort({ price: -1 });
      }
    }

    if (pagination === "2") {
      productsQuery = productsQuery.skip(5);
    } else {
      productsQuery = productsQuery.limit(5);
    }

    const products = await productsQuery;
    const category = await categoryModel.find({ isListed: true });

    const count = products.length;

    res.render("user/shopPage", {
      products,
      category,
      count,
      pagination,
      cartCount,
      wishlistCount,
      userId,
    });
  } catch (error) {
    console.log(error);
    console.log("Error occurred");
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadProductDetail,
  loadShop,
};

const user = require('../../models/userModel');
const orderModel = require('../../models/orderModel');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel')
const bcrypt = require("bcrypt");

// Code for load the login page.
const loginLoad = async (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

// Code for post the login request.
const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await user.findOne({
      email: email,
      isAdmin: 1,
    });

    if (!admin) {
      // Admin does not exist
      return res.render("admin/login", {
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      // Password match, admin is authenticated
      // You can set up a session ot create a jwt token here for admin authentication.
      req.session.admin_id = admin._id;

      return res.redirect("/admin/home"); //redirect to the admins dashboard
    } else {
      // password do not match
      return res.render("admin/login", {
        message: "Invalid email or password.",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal server Error.");
  }
};

// Code for load the home page.
const loadHome = async (req, res) => {
  try {

    const orders = await orderModel.find({})
    const products = await productModel.find({})
    const categories = await categoryModel.find({})

    const revenue = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    console.log(revenue,":rvnuee")

    res.render("admin/home", {orders,products,categories,revenue});
  } catch (error) {
    console.log(error.message);
  }
};

// exporting modules
module.exports = {
  loadHome,
  loginLoad,
  loginPost
};

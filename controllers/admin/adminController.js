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
    
      req.session.admin_id = admin._id;

      return res.redirect("/admin/home"); 
    } else {
      
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

    const currentMonth = new Date();
    const currentMonthIndex = currentMonth.getMonth();
    const startOfMonth = new Date(currentMonth.getFullYear(),0,1);
    const endOfMonth = new Date(currentMonth.getFullYear()+1,0,1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds()-1);
    const currentMonthName = (new Date()).toLocaleString('default',{month:'long'});

    const monthlyRevenue = await orderModel.aggregate([
      {
        $match : {
          orderDate : {
            $gte:startOfMonth,
            $lt: endOfMonth
          }
        }
      },
      {
        $group : {
          _id : { $month : '$orderDate'},
          monthlyRevenue : { $sum : '$totalPrice'}
        }
      }
    ]);

    const graphValue = Array(12).fill(0);

    monthlyRevenue .forEach(entry => {
      const monthIndex = entry._id -1;
      graphValue[monthIndex] = entry.monthlyRevenue;
    })

    const COD = await orderModel.countDocuments({ payment : 'cash on delivery'});

    const Wallet = await orderModel.countDocuments({ payment : 'wallet'});

    const Razorpay = await orderModel.countDocuments({ payment : 'Razorpay'});

    const topSellingProducts = await orderModel.aggregate([
      { $unwind: "$product" },
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "joinedProduct"
        }
      },
      { $unwind: "$joinedProduct" }, 
      {
        $group: {
          _id: "$joinedProduct._id", 
          productName: { $first: "$joinedProduct.name" }, 
          totalSold: { $sum: "$product.quantity" }, 
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
    ]);
    
    const topProductLabels = topSellingProducts.map(product => product.productName);
    const topProductCounts = topSellingProducts.map(product => product.totalSold);

    const topSellingCategories = await orderModel.aggregate([
      { $unwind: "$product" }, 
      {
        $lookup: { 
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "joinedProduct"
        }
      },
      { $unwind: "$joinedProduct" }, 
      {
        $lookup: { 
          from: "categories",
          localField: "joinedProduct.category", 
          foreignField: "_id",
          as: "joinedCategory"
        }
      },
      { $unwind: "$joinedCategory" }, 
      {
        $group: {
          _id: "$joinedCategory._id", 
          categoryName: { $first: "$joinedCategory.name" }, 
          totalSold: { $sum: "$product.quantity" }, 
        }
      },
      { $sort: { totalSold: -1 } }, 
      { $limit: 3 }, 
    ]);
    
    const topCategoryLabels = topSellingCategories.map(category => category.categoryName);
    const topCategoryCounts = topSellingCategories.map(category => category.totalSold);

    console.log(topProductLabels,"labelsssssssss");

    console.log(topProductCounts,"countsssssss");

    res.render("admin/home", {orders,products,categories,revenue,graphValue,COD,Wallet,Razorpay,topProductLabels,topProductCounts,topCategoryLabels,topCategoryCounts});
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

const user = require('../../models/userModel');
const orderModel = require('../../models/orderModel');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel')
const bcryptjs = require("bcryptjs");

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

      console.log('not admin')
      // Admin does not exist
      return res.render("admin/login", {
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcryptjs.compare(password, admin.password);

    if (passwordMatch) {
    
      req.session.admin_id = admin._id;

      console.log('session done. successfull')

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

    const orders = await orderModel.find({orderStatus:'delivered'})
    const products = await productModel.find({})
    const categories = await categoryModel.find({})

    let labels;

    let graphValue;

    const filter = req.query.filter;

    const revenue = await orderModel.aggregate([
      { $match: { orderStatus: 'delivered' } }, 
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    if (filter === 'yearly') {

      const currentYear = new Date().getFullYear();

const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
labels = years

const yearlyRevenues = [];

for (const year of years) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    endOfYear.setMilliseconds(endOfYear.getMilliseconds() - 1);

    const yearlyRevenue = await orderModel.aggregate([
        {
            $match: {
                orderStatus: 'delivered',
                orderDate: {
                    $gte: startOfYear,
                    $lt: endOfYear
                }
            }
        },
        {
            $group: {
                _id: { $year: '$orderDate' },
                yearlyRevenue: { $sum: '$totalPrice' }
            }
        }
    ]);

    yearlyRevenues.push({ year, yearlyRevenue });
}

   graphValue = Array(5).fill(0);

yearlyRevenues.forEach((yearData, index) => {
    graphValue[index] = yearData.yearlyRevenue.length > 0 ? yearData.yearlyRevenue[0].yearlyRevenue : 0;
});


    } else {

    labels = [1, 2, 3, 4, 5,6, 7, 8,9, 10, 11, 12];


    const currentMonth = new Date();

    const startOfMonth = new Date(currentMonth.getFullYear(),0,1);
    const endOfMonth = new Date(currentMonth.getFullYear()+1,0,1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds()-1);

    const monthlyRevenue = await orderModel.aggregate([
      {
        $match : {
          orderStatus : 'delivered',
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

      graphValue = Array(12).fill(0);

    monthlyRevenue .forEach(entry => {
      const monthIndex = entry._id -1;
      graphValue[monthIndex] = entry.monthlyRevenue;
    })

  }

    const COD = await orderModel.countDocuments({ payment : 'cash on delivery',orderStatus:'delivered'});

    const Wallet = await orderModel.countDocuments({ payment : 'wallet',orderStatus:'delivered'});

    const Razorpay = await orderModel.countDocuments({ payment : 'Razorpay',orderStatus:'delivered'});

    const topSellingProducts = await orderModel.aggregate([
      { $match: { orderStatus: 'delivered' } },
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
      { $match: { orderStatus: 'delivered' } },
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



    res.render("admin/home", {orders,products,categories,revenue,graphValue,labels,COD,Wallet,Razorpay,topProductLabels,topProductCounts,topCategoryLabels,topCategoryCounts});
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

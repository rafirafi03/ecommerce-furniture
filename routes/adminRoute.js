// Importing necessary libraries
const express = require('express');
const adminRoute = express();
const session = require('express-session');
const path = require('path');
const config = require('../config/config');
const auth = require('../middleware/adminAuth');
const adminController = require('../controllers/admin/adminController');
const userController = require('../controllers/admin/userController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
const multer = require('../middleware/multer');


adminRoute.use(express.static('public'));
adminRoute.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
    })
);

// Route for admin login
adminRoute.get('/', auth.isLogout,adminController.loginLoad);
adminRoute.post('/',adminController.loginPost);
adminRoute.get('/home',auth.isLogin,adminController.loadHome);
adminRoute.get('/users',auth.isLogin,userController.loadUsers);
adminRoute.post('/blockUser/:id', userController.blockUser);
adminRoute.get('/products',auth.isLogin,productController.loadProducts);
adminRoute.get('/addProducts',auth.isLogin,productController.loadAddProducts);
adminRoute.post('/addProducts',multer.uploadproduct,productController.postAddProducts);
adminRoute.post('/listProducts/:id',productController.listProducts);
adminRoute.get('/editProducts',auth.isLogin,productController.loadEditProducts);
adminRoute.post('/editProducts',multer.uploadproduct,productController.postEditProducts);
adminRoute.get('/category',auth.isLogin,categoryController.loadCategory);
adminRoute.post('/listCategory/:id',categoryController.listCategory);
adminRoute.get('/addCategory',auth.isLogin,categoryController.loadAddCategory);
adminRoute.post('/addCategory',categoryController.postAddcategory);
adminRoute.get('/editCategory',auth.isLogin,categoryController.loadEditCategory);
adminRoute.post('/editCategory',categoryController.postEditCategory);

module.exports = adminRoute;
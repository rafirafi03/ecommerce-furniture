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
const orderController = require('../controllers/admin/orderController');
const couponController = require('../controllers/admin/couponController');
const offerController = require('../controllers/admin/offerController');
const salesController = require('../controllers/admin/salesController');
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
adminRoute.get('/order',auth.isLogin,orderController.getOrder);
adminRoute.get('/orderDetail',auth.isLogin,orderController.getOrderDetails);
adminRoute.patch('/changeOrderStatus',auth.isLogin,orderController.patchOrderStatus)
adminRoute.get('/coupon',auth.isLogin,couponController.getCoupons);
adminRoute.get('/addCoupon',auth.isLogin,couponController.getAddCoupon);
adminRoute.post('/addCoupon',auth.isLogin,couponController.postAddCoupon);
adminRoute.delete('/deleteCoupon',auth.isLogin,couponController.deleteCoupon);
adminRoute.get('/offer',auth.isLogin,offerController.getOffer);
adminRoute.get('/addOffer',auth.isLogin,offerController.getAddOffer);
adminRoute.post('/addOffer',auth.isLogin,offerController.postAddOffer);
adminRoute.delete('/deleteOffer',auth.isLogin,offerController.deleteOffer);
adminRoute.patch('/applyOffer',auth.isLogin,offerController.applyOffer);
adminRoute.patch('/removeOffer',auth.isLogin,offerController.removeOffer);
adminRoute.patch('/categoryOffer',auth.isLogin,offerController.categoryOffer);
adminRoute.patch('/removeCategoryOffer',auth.isLogin,offerController.removeCategoryOffer);
adminRoute.get('/sales',auth.isLogin,salesController.getSales);
adminRoute.get('/salesReport',auth.isLogin,salesController.salesReport);
adminRoute.get('/salerReportExcel',auth.isLogin,salesController.salesReportExel);
adminRoute.patch('/return',auth.isLogin,orderController.returnProduct);
adminRoute.patch('/returnCancel',auth.isLogin,orderController.returnCancel);
adminRoute.get('/salesChart',auth.isLogin,salesController.salesChart);

module.exports = adminRoute;
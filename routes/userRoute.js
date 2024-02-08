// Importing necessaty libraries
const express = require("express");
const userRoute = express();
const session = require("express-session");
const config = require("../config/config");
const auth = require('../middleware/auth');
const userController = require("../controllers/user/userController");
const shopController = require('../controllers/user/shopController');
const profileController = require('../controllers/user/profileController');
const cartController = require('../controllers/user/cartController');

userRoute.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

// Route for user registraton
userRoute.get("/signup",auth.isLogout, userController.loadRegister);

// Route for user completion of user registration
userRoute.post("/signup",auth.isLogout, userController.signUpPost);

// Routes for user login
userRoute.get("/login",auth.isLogout, userController.loginLoad);

// Route for user login completion
userRoute.post("/login", userController.loginPost);

// Route for the user's home page
userRoute.get("/",auth.isBlocked, userController.loadHome);

// Route for load home page

// Route for the otp page
userRoute.get("/otp",auth.isLogout,userController.loadOtp);

// Route for otp verification
userRoute.post("/otp",auth.isLogout, userController.verifyPost);

userRoute.get('/resendOtp',userController.resendOtp);


// Route for product detail page
userRoute.get('/productDetails',auth.isBlocked,shopController.loadProductDetail);

// Route for Shop page
userRoute.get('/shopPage',auth.isBlocked,shopController.loadShop);


// userRoute.post('/verifyOTP',userController.verifyPost)
userRoute.get('/otp',userController.verifyOTP);

userRoute.get('/profile',auth.isLogin,auth.isBlocked,profileController.loadProfile);

userRoute.post('/profile',profileController.editProfile);

userRoute.post('/addAddress',profileController.addAddress);

userRoute.get('/cart',cartController.loadCart);

userRoute.post('/addToCart',cartController.addToCart);

userRoute.delete('/cart/remove/:productId',cartController.removeFromCart);

userRoute.delete('/profile/address/:addressId', profileController.removeAddress);

userRoute.get('/logout',profileController.logout);

// Route for the user logout
// userRoute.get('/logout',userController.userLogout)

module.exports = userRoute;




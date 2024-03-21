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
const wishlistController = require('../controllers/user/wishlistController');
const checkoutController = require('../controllers/user/checkoutController');


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

userRoute.get('/resendOtp',auth.isLogout,userController.resendOtp);


// Route for product detail page
userRoute.get('/productDetails',auth.isBlocked,shopController.loadProductDetail);

// Route for Shop page
userRoute.get('/shopPage',auth.isBlocked,shopController.loadShop);


// userRoute.post('/verifyOTP',userController.verifyPost)
// userRoute.get('/otp',auth.isLogout,userController.verifyOTP);

userRoute.get('/profile',auth.isLogin,auth.isBlocked,profileController.loadProfile);

userRoute.post('/profile',profileController.editProfile);

userRoute.post('/addAddress',profileController.addAddress);

userRoute.patch('/editAddress',profileController.editAddress);

userRoute.get('/cart',auth.isLogin,cartController.loadCart);

userRoute.post('/addToCart',cartController.addToCart);

userRoute.delete('/cart/remove/:productId',cartController.removeFromCart);

userRoute.get('/wishlist',auth.isLogin,wishlistController.loadWishlist);

userRoute.post('/addToWishlist',wishlistController.addToWishlist);

userRoute.delete('/wishlist/remove/:productId', wishlistController.removeFromWishlist);

userRoute.get('/checkout',auth.isLogin,checkoutController.loadCheckout)

userRoute.delete('/profile/address/:addressId', profileController.removeAddress);

userRoute.patch('/quantity',cartController.quantity);

userRoute.post('/checkoutAddAddress',checkoutController.addCheckoutAddress);

userRoute.post('/order',auth.isLogin,checkoutController.order);

userRoute.get('/orderDetails',auth.isLogin,profileController.loadOrderDetails);

userRoute.patch('/cancelOrder',auth.isLogin,profileController.cancelOrder);

userRoute.patch('/razorpayVerify',checkoutController.razorpayVerify)

userRoute.patch('/resetPass',auth.isLogin,profileController.PatchResetPass)

userRoute.patch('/applyCoupon',auth.isLogin,checkoutController.applyCoupon);

userRoute.delete('/removeCoupon',auth.isLogin,checkoutController.removeCoupon)

userRoute.get('/logout',auth.isLogin,profileController.logout);

// Route for the user logout
// userRoute.get('/logout',userController.userLogout)

module.exports = userRoute;





const User = require("../../models/userModel");
const UserOTPVerification = require("../../models/userOtpVerification");
const product = require('../../models/productModel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const wishlistModel = require("../../models/wishlistModel");
const cartModel = require('../../models/cartModel')
require("dotenv").config();

// // signup
const signUpPost = async (req, res) => {

  try {
    let { referral, UserName, email, password, mobile } = req.body;
  const userExists = await User.findOne({ email,verified: true});
  await User.findOneAndDelete({email,verified:false});

  // checking if user already exists
  if (userExists) {
    // A user alreaddy exists
    return res.render("user/signup", {
      message: "User with the provided email already exists.",
    });
  }if(referral){
    
    const refUser = await User.findOne({referral:referral});

    if (!refUser) {
      return res.render("user/signup", {
        message: "Invalid referral code entered.",
      });
    } 
  }

      const saltRounds = 10;
    bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
      const newUser = new User({
        name: UserName,
        email,
        mobile,
        password: hashedPassword
      });
      const result = await newUser.save();
      
      sendOTPVerificationEmail(result, res,req,referral);
    });
        
  
  } catch (error) {
    console.log(error.message)
  }
  
};

// Login
const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });



    if (!user) {
      // User does not exist
      return res.render("user/login", {
        message: "Invalid email or password.",
      });
    } else if(user.isBlocked) {
      return res.render('user/login',{ message: "You are blocked by admin."})
    } else if (!user.verified) {
      return res.render('user/login',{message:"Not a User. Please signup!"})
    }

    
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      
      req.session.user_id = user._id;

      return res.redirect("/"); 
    } else {
      // Passwords do not match
      return res.render("user/login", {
        message: "Invalid email or password.",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Code for load the home page
const loadHome = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const wishlistCount = await wishlistModel.find({user:userId}).countDocuments()
    const cartCount = await cartModel.find({user:userId}).countDocuments()
    
    const products = await product.find({isListed:true}).populate('category')
    res.render("user/home",{products,userId,wishlistCount,cartCount});
  } catch (error) {
    console.log(error.message);
  }
};

// Code for load the login page.
const loginLoad = async (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};

// Code for load the register/signup page.
const loadRegister = async (req, res) => {
  try {
    res.render("user/signup");
  } catch (error) {
    console.log(error.message);
  }
};

// Code for load the otp page.
const loadOtp = async (req, res) => {
  try {
    const id = req.query.id;
    const ref = req.query.ref;
    res.render("user/otp",{id,ref});
  } catch (error) {
    console.log(error.message);
  }
};

// Code for send the otp for email verification.
const sendOTPVerificationEmail = async (result, res,req,referral) => {
  const { _id, email } = result;
  try {

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const expirationTime = Date.now() + 30000;

    req.session.otpExpirationTime = expirationTime;

    // mail options
    const mailoptions = {
      from: process.env.user_email,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the Signup</p><p>This code <b>expires in 30 seconds</b>.</p>`,
    };

    console.log(mailoptions,":mailoptionsinside")

    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: expirationTime,
    });
    console.log(newOTPVerification,":newotpverficationinside")

    // save otp record
    await newOTPVerification.save();
    await transporter.sendMail(mailoptions);
    res.redirect(`/otp?id=${_id}&ref=${referral}`);
  } catch (error) {
    console.log(error.message)

  }
};

// verify otp email
const verifyPost = async (req, res) => {
  try {
    let { otp,user_id ,ref} = req.body;
    const user = await UserOTPVerification.find();
    if (!otp) {
     return res.render('user/otp',{message: "Incorrect OTP.",id:user_id})
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({
        userId: user_id,
      });
      if (UserOTPVerificationRecords.length <= 0) {
        // no record found
        throw new Error(
          "Account record doesn't exist or has been verified already. Please signup or log in"
        );
      } else {
        // user otp record exists
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          // user otp record has expired
          await UserOTPVerification.deleteMany({ user_id });
          return res.render("user/otp", {
            message: "Code has expired. Please request again.",id:user_id,ref
          });
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            // supplied otp is wrong
            return res.render("user/otp", { message: "Invalid OTP.",id:user_id,ref });
          } else {
            // success

            let referralCode;

            const generateReferralCode = () => {

              const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              referralCode = '';
          
              for (let i = 0; i < 6; i++) {
                  referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
              }
          
              return referralCode;
          };
        
          generateReferralCode();

            await User.updateOne({ _id: user_id }, {
               verified: true ,
               referral : referralCode ? referralCode : null,
            });

            if (ref) {
              await User.updateOne({_id:user_id},{
                $inc:{
                  wallet : 200
                },
                $push: {
                  walletHistory : {
                      date: Date.now(),
                      amount: 200
                  }
              }
              });

              await User.updateOne({referral : ref},{
                $inc:{
                  wallet : 500
                },
                $push: {
                  walletHistory : {
                      date: Date.now(),
                      amount: 500
                  }
              }
              })
            }
            await UserOTPVerification.deleteMany({ user_id });
            req.session.user_id = user_id
            res.redirect("/");
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.findOne({ _id: userId});


    if (!user) {
      throw new Error("User not found or already verified.");
    }else{
      // Delete existing records and resend OTP
      await UserOTPVerification.deleteMany({userId: userId});
    sendOTPVerificationEmail(user, res,req);
    }

  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};


// Transporter code.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.user_email,
    pass: process.env.user_password,
  },
});


module.exports = {
  loadHome,
  loginLoad,
  loginPost,
  loadRegister,
  loadOtp,
  signUpPost,
  verifyPost,
  resendOtp
};

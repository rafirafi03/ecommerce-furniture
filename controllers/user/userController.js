const express = require("express");
const User = require("../../models/userModel");
const UserOTPVerification = require("../../models/userOtpVerification");
const product = require('../../models/productModel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();

// // signup
const signUpPost = async (req, res) => {
  let { UserName, email, password, mobile } = req.body;
  const userExists = await User.findOne({ email,verified: true});

  // checking if user already exists
  if (userExists) {
    // A user alreaddy exists
    res.render("user/signup", {
      message: "User with the provided email already exists.",
    });
  } else {
    // Try to create new user

    // password handling
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
      const newUser = new User({
        name: UserName,
        email,
        mobile,
        password: hashedPassword,
      });
      const result = await newUser.save();
      // req.session.user_id = result._id;
      sendOTPVerificationEmail(result, res);
    });
  }
};

// Login
const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    const isBlocked = await User.findOne({email:email,isBlocked:true});



    if (!user) {
      // User does not exist
      return res.render("user/login", {
        message: "Invalid email or password.",
      });
    } else if(isBlocked) {
      return res.render('user/login',{ message: "You are blocked by admin."})
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Passwords match, user is authenticated
      // You can set up a session or create a JWT token here for user authentication
      req.session.user_id = user._id;

      return res.redirect("/"); // Redirect to the user's dashboard or any desired page
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
    
    const products = await product.find({isListed:true})
    res.render("user/home",{products,userId});
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
    res.render("user/otp",{id});
  } catch (error) {
    console.log(error.message);
  }
};

// Code for send the otp for email verification.
const sendOTPVerificationEmail = async (result, res) => {
  const { _id, email } = result;
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    // mail options
    const mailoptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the Signup</p><p>This code <b>expires in 30 seconds</b>.</p>`,
    };

    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30000,
    });

    // save otp record
    await newOTPVerification.save();
    await transporter.sendMail(mailoptions);
    res.redirect(`/otp?id=${_id}`);
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

// verify otp email
const verifyPost = async (req, res) => {
  try {
    let { otp,user_id } = req.body;
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
            message: "Code has expired. Please request again.",id:user_id
          });
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            // supplied otp is wrong
            return res.render("user/otp", { message: "Invalid OTP.",id:user_id });
          } else {
            // success
            await User.updateOne({ _id: user_id }, { verified: true });
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

// resend verification
const verifyOTP = async (req, res) => {
  try {
    let { userId, email } = req.body;

    if (!userId || !email) {
      throw Error("Empty user details are not allowed");
    } else {
      // delete existing records and resend
      await UserOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);
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
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId, verified: false });

    if (!user) {
      throw new Error("User not found or already verified.");
    }

    // Delete existing records and resend OTP
    await UserOTPVerification.deleteMany({ userId });
    sendOTPVerificationEmail({ _id: userId, email: user.email }, res);
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

// Exporting required modules.
module.exports = {
  loadHome,
  loginLoad,
  loginPost,
  loadRegister,
  loadOtp,
  signUpPost,
  verifyPost,
  verifyOTP,
  resendOtp
};

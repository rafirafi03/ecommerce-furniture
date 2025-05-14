const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const nocache = require("nocache");
const adminRoute = require("../routes/adminRoute");
const userRoute = require("../routes/userRoute");
require("dotenv").config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.dbUrl);
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error : ", err);
});

// Set up view engine and middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/", userRoute);
app.use("/admin", adminRoute);

// Export the app as serverless function
module.exports = serverless(app);

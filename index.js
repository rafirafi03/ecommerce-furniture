// Import necessary libraries
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const session = require("express-session");
app.set("view engine", "ejs");
app.set("views", "./views");
const path = require("path");
const nocache = require("nocache");
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");

// Define the MongoDB connection URL
const dbUrl = "mongodb://127.0.0.1:27017/ecommerse";

// Connect to MongoDB with the specified options
mongoose.connect(dbUrl);

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the 'nocache' middleware to prevent caching
app.use(nocache());

// Listen for the 'connected' event when MongoDB connection is established
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

// Listen for the 'error' event in case of MongoDB connection errors
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Serve static dile from the 'public' directory
app.use(express.static("public"));

// User Routes
app.use("/", userRoute);

// Admin Route
app.use("/admin", adminRoute);

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log("server is running at http://localhost:3000");
});
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

// Setup basic session without MongoDB to avoid timeout
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysitesessionsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // Removed NODE_ENV check
      sameSite: "lax",
    }
    // No store specified - will use MemoryStore temporarily
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
app.use(express.static(path.join(__dirname, "../public")));

// Lazy-load database connection
let dbConnection = null;
const getDbConnection = async () => {
  if (!dbConnection) {
    try {
      const dbUrl = process.env.dbUrl || "mongodb+srv://ahamedrafirafi03:ASJbzrESHgYqEmZa@cluster0.22yemjn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
      
      // Ultra lightweight connection options for serverless
      dbConnection = await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        maxPoolSize: 1,
        minPoolSize: 0,
        autoIndex: false
      });
      
      console.log("MongoDB connected");
      return dbConnection;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      // Return null on failure so we can retry next time
      dbConnection = null;
      // Don't throw - let the app work without DB if needed
      return null;
    }
  }
  return dbConnection;
};

// Health check endpoint
app.get("/_health", async (req, res) => {
  res.status(200).send("OK");
});

// Database connection middleware - only connect when needed
app.use(async (req, res, next) => {
  // Skip DB connection for static files to improve performance
  if (req.url.startsWith('/public/') || req.url.includes('favicon.ico')) {
    return next();
  }
  
  try {
    // Don't wait for DB connection - it will be available when needed
    getDbConnection();
    next();
  } catch (err) {
    console.error("Error in DB middleware:", err);
    // Continue anyway - don't block the request
    next();
  }
});

app.use("/", userRoute);
app.use("/admin", adminRoute);

app.use((req, res) => {
  res.status(404).send("404", { title: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("error", { 
    title: "Error", 
    message: "Something went wrong" 
  });
});

// // For local development - removed NODE_ENV check
// const PORT = process.env.PORT || 3000;
// if (!process.env.VERCEL) {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// Optimize the handler
const handler = serverless(app, {
  binary: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
});

// Export the handler with timeout protection
module.exports = async (req, res) => {
  // Set a timeout to avoid hanging
  const timeout = setTimeout(() => {
    console.log("Handler timeout triggered");
    if (!res.headersSent) {
      res.status(504).send("Server timeout");
    }
  }, 50000);
  
  try {
    // Run the serverless handler
    return await handler(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    if (!res.headersSent) {
      res.status(500).send("Server error");
    }
  } finally {
    clearTimeout(timeout);
  }
};
const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongodb-session')(session); // Add this package
const path = require("path");
const nocache = require("nocache");
const adminRoute = require("../routes/adminRoute");
const userRoute = require("../routes/userRoute");
require("dotenv").config();

const app = express();

// Improved database connection with timeout and pooling
const dbUrl = process.env.dbUrl || 'mongodb+srv://ahamedrafirafi03:ASJbzrESHgYqEmZa@cluster0.22yemjn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connection options to improve performance
const connectWithRetry = async () => {
  try {
    await mongoose.connect(dbUrl, {
      maxPoolSize: 10, // Limit the number of connections
      socketTimeoutMS: 30000, // Reduce socket timeout
      connectTimeoutMS: 30000, // Reduce connection timeout
      serverSelectionTimeoutMS: 5000 // Reduce server selection timeout
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Create a MongoDB store for sessions
const store = new MongoStore({
  uri: dbUrl,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 7, // 1 week in milliseconds
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
});

store.on('error', function(error) {
  console.error('Session store error:', error);
});

// Set up view engine and middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
app.use(express.static(path.join(__dirname, "../public")));

// Configure session with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week in milliseconds
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Health check endpoint for Vercel
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

// Routes with basic error handling
app.use("/", userRoute);
app.use("/admin", adminRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Something went wrong',
    error: process.env.NODE_ENV === 'production' ? {} : err 
  });
});

// Export the app as serverless function
module.exports = serverless(app, {
  basePath: '',  // Set this if your app is not at the root path
  binary: ['image/png', 'image/jpeg', 'image/gif'], // Add binary MIME types if needed
  provider: {
    timeout: 50000, // Slightly less than Vercel's 60s limit
  }
});
const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const path = require("path");
const nocache = require("nocache");
const adminRoute = require("../routes/adminRoute");
const userRoute = require("../routes/userRoute");
require("dotenv").config();

const app = express();

const dbUrl = "mongodb+srv://ahamedrafirafi03:ASJbzrESHgYqEmZa@cluster0.22yemjn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Configure MongoDB connection options for serverless environment
const mongooseOptions = {
  maxPoolSize: 1, // Reduced pool size for serverless
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 30000, // Timeout after 30 seconds
};

// Initialize store outside request handler
const store = new MongoStore({
  uri: dbUrl,
  collection: "sessions",
  expires: 1000 * 60 * 60 * 24 * 7, // 7 days
  connectionOptions: mongooseOptions,
});

// Handle store errors
store.on("error", function (error) {
  console.error("Session store error:", error);
});

// Connect to MongoDB - will be cached across function invocations
let isConnected = false;
const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(dbUrl, mongooseOptions);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Initialize connection outside of request handler
connectDB().catch(console.error);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
app.use(express.static(path.join(__dirname, "../public")));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysitesessionsecret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// Health check endpoint
app.get("/_health", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).send("OK");
  }
  res.status(503).send("Database not connected");
});

app.use("/", userRoute);
app.use("/admin", adminRoute);

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = serverless(app);
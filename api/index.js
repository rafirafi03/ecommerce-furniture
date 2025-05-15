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

const dbUrl = "mongodb+srv://ahamedrafirafi03:ASJbzrESHgYqEmZa@cluster0.22yemjn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Cached connection
let cachedConn = null;

async function connectToDatabase() {
  if (cachedConn) return cachedConn;

  mongoose.set('strictQuery', false); // optional: to avoid deprecation warnings
  cachedConn = await mongoose.connect(dbUrl, {
    maxPoolSize: 10,
    // useNewUrlParser: true,   // usually recommended
    // useUnifiedTopology: true // usually recommended
  });
  console.log("MongoDB connected");
  return cachedConn;
}

// Session store - create only once
let store = null;
function getSessionStore() {
  if (!store) {
    store = new MongoStore({
      uri: dbUrl,
      collection: "sessions",
      expires: 1000 * 60 * 60 * 24 * 7, // 1 week
    });
    store.on("error", (error) => {
      console.error("Session store error:", error);
    });
  }
  return store;
}

// Middleware to connect DB once per cold start
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("DB connection error", error);
    res.status(500).send("Database connection failed");
  }
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: getSessionStore(),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

app.get("/_health", (req, res) => {
  res.status(200).send("OK");
});

console.log("Inside index.js is success");

app.use("/", userRoute);
app.use("/admin", adminRoute);

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// Export serverless function for Vercel
module.exports = serverless(app);

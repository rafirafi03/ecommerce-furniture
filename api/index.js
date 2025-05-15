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

let store;

// Connect to MongoDB once
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return; // already connected
  }
  await mongoose.connect(dbUrl, {
    maxPoolSize: 10,
  });
  // Initialize MongoStore only after DB connected
  store = new MongoStore({
    uri: dbUrl,
    collection: "sessions",
    expires: 1000 * 60 * 60 * 24 * 7,
  });
  store.on("error", function (error) {
    console.error("Session store error:", error);
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
app.use(express.static(path.join(__dirname, "../public")));

// Middleware to connect to DB and setup session
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!store) {
      return next(new Error("Session store not initialized"));
    }
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    return res.status(500).send("Database connection failed");
  }
});

// Use session after DB and store initialized
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

app.get("/_health", (req, res) => {
  res.status(200).send("OK");
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

module.exports = serverless(app);

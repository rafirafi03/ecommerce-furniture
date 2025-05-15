const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongodb-session')(session);
const path = require("path");
const nocache = require("nocache");
const adminRoute = require("../routes/adminRoute");
const userRoute = require("../routes/userRoute");
require("dotenv").config();

const app = express();

const dbUrl = process.env.dbUrl || 'mongodb+srv://ahamedrafirafi03:ASJbzrESHgYqEmZa@cluster0.22yemjn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Global cached connection across lambda warm starts
let cachedConn = null;

async function connectToDatabase() {
  if (cachedConn) {
    return cachedConn;
  }
  cachedConn = await mongoose.connect(dbUrl, {
    maxPoolSize: 10,
    // Use these options if needed:
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");
  return cachedConn;
}

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("DB connection failed", err);
    res.status(500).send("Database connection error");
  }
});

// Create MongoDB store for sessions after DB connection is ready
// We need to create the store dynamically because it requires an active DB connection
function createSessionStore() {
  return new MongoStore({
    uri: dbUrl,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 7, // 1 week
  });
}

const store = createSessionStore();

store.on('error', (error) => {
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
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
}));

// Health check endpoint for Vercel
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

console.log('inside index.js is success >>>> <<<<<');

// Routes
app.use("/", userRoute);
app.use("/admin", adminRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// Export the app wrapped with serverless-http for Vercel
module.exports = serverless(app);

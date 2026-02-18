import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import chatbotRoutes from "./routes/api/chatbot.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";


const app = express();
const PORT = process.env.PORT || 3000;

// 🔧 REQUIRED FOR ES MODULE PATH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// SECURITY MIDDLEWARE
// =======================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(compression());

// CORS - configure for production
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
}));

// =======================
// VIEW ENGINE
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =======================
// MIDDLEWARE
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =======================
// SESSION
// =======================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "smartedu-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// =======================
// STATIC FILES
// =======================
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// ROUTES
// =======================
app.get('/', (req, res) => {
  res.render('landing', { title: 'SmartEdu - Smart Learning Platform' });
});

app.use("/", authRoutes);
app.use("/student", studentRoutes);
app.use("/admin", adminRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/calendar", calendarRoutes);

// =======================
// MONGODB
// =======================
// Check if MONGODB_URI is provided
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  console.error('Please set MONGODB_URI in your .env file or Render dashboard.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Production mode enabled`);
      }
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// =======================
// ERROR HANDLING MIDDLEWARE
// =======================

// 404 Handler - Catch undefined routes
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: { status: 404 }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred. Please try again later.' 
    : err.message;

  // Check if request expects JSON
  if (req.headers.accept?.includes('application/json') || req.xhr) {
    return res.status(status).json({
      success: false,
      error: message
    });
  }

  // Render error page for HTML requests
  res.status(status).render('error', {
    title: 'Error',
    message: message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

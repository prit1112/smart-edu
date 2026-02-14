import mongoose from 'mongoose';
import express from 'express';
import serverless from 'serverless-http';

// Import your routes
import authRoutes from '../../routes/auth.routes.js';
import studentRoutes from '../../routes/student.routes.js';
import adminRoutes from '../../routes/admin.routes.js';

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/", authRoutes);
app.use("/student", studentRoutes);
app.use("/admin", adminRoutes);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

export const handler = serverless(app);

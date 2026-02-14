import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import adminRoutes from "./routes/admin.routes.js";


const app = express();
const PORT = 3003;

// 🔧 REQUIRED FOR ES MODULE PATH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



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
    secret: "smartedu-secret",
    resave: false,
    saveUninitialized: false
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

// =======================
// MONGODB
// =======================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-edu";

mongoose
  .connect(MONGODB_URI)
  .then(() => {

    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => console.error(err));
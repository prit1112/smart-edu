import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/* ======================
   REGISTER PAGE
====================== */
router.get("/register", (req, res) => {
  res.render("auth", { title: "Register - SmartEdu" });
});

/* ======================
   REGISTER POST
====================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, classLevel } = req.body;

    // Validation
    if (password !== confirmPassword) {
      return res.render("auth", {
        title: "Register - SmartEdu",
        error: "Passwords do not match"
      });
    }

    if (password.length < 6) {
      return res.render("auth", {
        title: "Register - SmartEdu",
        error: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render("auth", {
        title: "Register - SmartEdu",
        error: "Email already registered. Please login instead."
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      classLevel: role === "student" ? parseInt(classLevel) : null
    });

    // Auto login after registration
    const user = await User.findOne({ email });
    req.session.userId = user._id;
    req.session.role = user.role;

    // Redirect based on role
    if (user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/student");
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.render("auth", {
      title: "Register - SmartEdu",
      error: "Registration failed. Please try again."
    });
  }
});

/* ======================
   LOGIN PAGE
====================== */
router.get("/login", (req, res) => {
  res.render("auth", { title: "Login - SmartEdu" });
});

/* ======================
   LOGIN POST
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.render("auth", {
        title: "Login - SmartEdu",
        error: "Invalid email or password"
      });
    }

    // Email verification removed - users are automatically verified

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.render("auth", {
        title: "Login - SmartEdu",
        error: "Invalid email or password"
      });
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    // Redirect based on role
    if (user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/student");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render("auth", {
      title: "Login - SmartEdu",
      error: "Login failed. Please try again."
    });
  }
});

/* ======================
   LOGOUT
====================== */
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/login");
  });
});

export default router;

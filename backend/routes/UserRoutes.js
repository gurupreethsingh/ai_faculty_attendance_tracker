const express = require("express");

const router = express.Router();

// =====================================================
// USER CONTROLLER
// =====================================================

const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserRole,
} = require("../controllers/UserController");

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const { requireSignIn, isSuperAdmin } = require("../middleware/authMiddleware");

// =====================================================
// PUBLIC ROUTES
// =====================================================

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/refresh-token", refreshToken);

router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

// =====================================================
// LOGGED-IN USER ROUTES
// =====================================================

router.get("/me", requireSignIn, getMyProfile);

router.put("/update-profile", requireSignIn, updateMyProfile);

// =====================================================
// SUPER ADMIN ROUTES
// =====================================================

router.get("/all-users", requireSignIn, isSuperAdmin, getAllUsers);

router.put("/update-role/:id", requireSignIn, isSuperAdmin, updateUserRole);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;

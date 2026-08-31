const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getMyProfile,
  updateMyProfile,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  searchUsers,
  updateUserRole,
  getUsersByRole,
  activateUser,
  deactivateUser,
  getActiveUsers,
  getInactiveUsers,
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkUpdateRole,
  bulkDeleteUsers,
  getUserStatistics,
  checkEmailAvailability,
} = require("../controllers/UserController");

const { requireSignIn, isSuperAdmin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/me", requireSignIn, getMyProfile);
router.put("/update-profile", requireSignIn, updateMyProfile);
router.put("/change-password", requireSignIn, changePassword);
router.get("/check-email", requireSignIn, isSuperAdmin, checkEmailAvailability);
router.get("/all-users", requireSignIn, isSuperAdmin, getAllUsers);
router.post("/create-user", requireSignIn, isSuperAdmin, createUser);
router.get("/get-user/:id", requireSignIn, isSuperAdmin, getUserById);
router.put("/update-user/:id", requireSignIn, isSuperAdmin, updateUser);
router.delete("/delete-user/:id", requireSignIn, isSuperAdmin, deleteUser);
router.put("/update-role/:id", requireSignIn, isSuperAdmin, updateUserRole);
router.get("/by-role/:role", requireSignIn, isSuperAdmin, getUsersByRole);
router.put("/activate-user/:id", requireSignIn, isSuperAdmin, activateUser);
router.put("/deactivate-user/:id", requireSignIn, isSuperAdmin, deactivateUser);
router.get("/active-users", requireSignIn, isSuperAdmin, getActiveUsers);
router.get("/inactive-users", requireSignIn, isSuperAdmin, getInactiveUsers);
router.put("/bulk-activate", requireSignIn, isSuperAdmin, bulkActivateUsers);

router.put(
  "/bulk-deactivate",
  requireSignIn,
  isSuperAdmin,
  bulkDeactivateUsers,
);

router.put("/bulk-update-role", requireSignIn, isSuperAdmin, bulkUpdateRole);
router.delete("/bulk-delete", requireSignIn, isSuperAdmin, bulkDeleteUsers);
router.get("/search", requireSignIn, isSuperAdmin, searchUsers);
router.get("/statistics", requireSignIn, isSuperAdmin, getUserStatistics);

module.exports = router;

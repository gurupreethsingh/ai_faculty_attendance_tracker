const express = require("express");
const router = express.Router();

const {
  createContactMessage,
  getAllContactMessages,
  getSingleContactMessage,
  markContactMessageAsRead,
  addReplyToContactMessage,
  deleteContactMessage,
  bulkDeleteContactMessages,
} = require("../controllers/ContactController");

const { requireSignIn, isSuperAdmin } = require("../middleware/authMiddleware");

// public route
router.post("/create-contact-message", createContactMessage);

// superadmin only routes
router.get(
  "/all-contact-messages",
  requireSignIn,
  isSuperAdmin,
  getAllContactMessages,
);

router.get(
  "/single-message/:id",
  requireSignIn,
  isSuperAdmin,
  getSingleContactMessage,
);

router.patch(
  "/mark-as-read/:id",
  requireSignIn,
  isSuperAdmin,
  markContactMessageAsRead,
);

router.post(
  "/reply-message/:id",
  requireSignIn,
  isSuperAdmin,
  addReplyToContactMessage,
);

router.delete(
  "/delete-message/:id",
  requireSignIn,
  isSuperAdmin,
  deleteContactMessage,
);

router.post(
  "/bulk-delete-messages",
  requireSignIn,
  isSuperAdmin,
  bulkDeleteContactMessages,
);

module.exports = router;

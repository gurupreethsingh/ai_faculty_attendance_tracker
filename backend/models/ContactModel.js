const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Reply name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Reply email is required"],
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: [true, "Reply message is required"],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    replies: {
      type: [ReplySchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema);

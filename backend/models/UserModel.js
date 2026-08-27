const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    // =================================================
    // BASIC USER INFORMATION
    // =================================================

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // =================================================
    // APPLICATION ROLE
    // =================================================

    role: {
      type: String,

      enum: [
        "superadmin",
        "admin",
        "faculty",
        "student",
        "accountant",
        "hr",
        "librarian",
        "exam_controller",
        "registrar",
        "alumni_relations",
        "event_coordinator",
        "maintenance_staff",
        "user",
      ],

      default: "user",

      index: true,
    },

    // =================================================
    // ACCOUNT STATUS
    // =================================================

    /*
     * This belongs to the User account itself.
     *
     * Example:
     *
     * Faculty leaves college:
     *
     * user.role = "user"
     * user.isActive = true
     *
     * Their account still exists.
     */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =================================================
    // CONTACT
    // =================================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // PERSONAL INFORMATION
    // =================================================

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // ADDRESS
    // =================================================

    addressLine1: {
      type: String,
      default: "",
      trim: true,
    },

    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    nationality: {
      type: String,
      default: "",
      trim: true,
    },

    preferredCurrency: {
      type: String,
      default: "INR",
      trim: true,
    },

    // =================================================
    // PROFILE
    // =================================================

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // PASSWORD RESET
    // =================================================

    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// =====================================================
// PASSWORD HASHING
// =====================================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// =====================================================
// COMPARE PASSWORD
// =====================================================

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(String(enteredPassword || ""), this.password);
};

// =====================================================
// GENERATE JWT
// =====================================================

userSchema.methods.getJwtToken = function () {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id: this._id.toString(),
      role: this.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
    },
  );
};

// =====================================================
// PASSWORD RESET TOKEN
// =====================================================

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

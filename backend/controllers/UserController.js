const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/UserModel");

// =====================================================
// JWT CONFIGURATION
// =====================================================

const ACCESS_TOKEN_SECRET =
  process.env.JWT_SECRET || "dev_access_secret_change_me";

const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me";

const ACCESS_TOKEN_EXPIRE = process.env.JWT_ACCESS_EXPIRE || "15m";

const REFRESH_TOKEN_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d";

// =====================================================
// HELPERS
// =====================================================

const normalizeEmail = (email = "") => {
  return String(email).trim().toLowerCase();
};

const normalizeText = (value = "") => {
  return String(value).trim();
};

// =====================================================
// ALLOWED ROLES
// =====================================================

const ALLOWED_ROLES = [
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
];

// =====================================================
// SAFE USER RESPONSE
// =====================================================

const buildUserResponse = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  dateOfBirth: user.dateOfBirth,
  gender: user.gender,
  addressLine1: user.addressLine1,
  addressLine2: user.addressLine2,
  city: user.city,
  state: user.state,
  country: user.country,
  postalCode: user.postalCode,
  nationality: user.nationality,
  preferredCurrency: user.preferredCurrency,
  profileImage: user.profileImage,
});

// =====================================================
// ACCESS TOKEN
// =====================================================

const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRE,
    },
  );
};

// =====================================================
// REFRESH TOKEN
// =====================================================

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRE,
    },
  );
};

// =====================================================
// COOKIE OPTIONS
// =====================================================

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/api/users",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// =====================================================
// AUTH RESPONSE
// =====================================================

const sendAuthResponse = (user, statusCode, res, message) => {
  const accessToken = createAccessToken(user);

  const refreshToken = createRefreshToken(user);

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  return res.status(statusCode).json({
    success: true,
    message,
    token: accessToken,
    user: buildUserResponse(user),
  });
};

// =====================================================
// REGISTER USER
// =====================================================

exports.registerUser = async (req, res) => {
  try {
    const fullName = normalizeText(req.body.fullName);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: "user",
    });

    return sendAuthResponse(user, 201, res, "User registered successfully.");
  } catch (error) {
    console.error("REGISTER USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

// =====================================================
// LOGIN USER
// =====================================================

exports.loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return sendAuthResponse(user, 200, res, "Login successful.");
  } catch (error) {
    console.error("LOGIN USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
};

// =====================================================
// REFRESH TOKEN
// =====================================================

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing.",
      });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    const accessToken = createAccessToken(user);

    return res.status(200).json({
      success: true,
      token: accessToken,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token.",
    });
  }
};

// =====================================================
// LOGOUT
// =====================================================

exports.logoutUser = async (_req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/users",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("LOGOUT USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email.",
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Email matched. You can now reset your password.",
      resetToken,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Forgot password failed.",
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

exports.resetPassword = async (req, res) => {
  try {
    const password = String(req.body.password || "");

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired.",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Reset password failed.",
    });
  }
};

// =====================================================
// GET MY PROFILE
// =====================================================

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID not found.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch profile.",
    });
  }
};

// =====================================================
// UPDATE MY PROFILE
// =====================================================

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID not found.",
      });
    }

    const updateData = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth || null,
      gender: req.body.gender,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      postalCode: req.body.postalCode,
      nationality: req.body.nationality,
      preferredCurrency: req.body.preferredCurrency,
      profileImage: req.body.profileImage,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update profile.",
    });
  }
};

// =====================================================
// GET ALL USERS
// =====================================================

exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch users.",
    });
  }
};

// =====================================================
// UPDATE USER ROLE
// =====================================================

exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;

    const role = normalizeText(req.body.role).toLowerCase();

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required.",
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role: ${role}`,
        allowedRoles: ALLOWED_ROLES,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        role,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update role.",
    });
  }
};

// =====================================================
// DELETE USER
// =====================================================

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("====================================");
    console.log("DELETE USER REQUEST");
    console.log("User ID:", userId);
    console.log("Logged-in user:", req.user);
    console.log("====================================");

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // -------------------------------------------------
    // LOGGED-IN USER
    // -------------------------------------------------

    const loggedInUserId = req.user?._id || req.user?.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID not found.",
      });
    }

    // -------------------------------------------------
    // PREVENT SELF DELETE
    // -------------------------------------------------

    if (String(loggedInUserId) === String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // -------------------------------------------------
    // PREVENT SUPERADMIN DELETE
    // -------------------------------------------------

    if (String(user.role || "").toLowerCase() === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "A SuperAdmin account cannot be deleted.",
      });
    }

    // -------------------------------------------------
    // DELETE
    // -------------------------------------------------

    await User.findByIdAndDelete(userId);

    console.log(`USER DELETED: ${user.fullName} (${userId})`);

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: `"${user.fullName}" was deleted successfully.`,
      deletedUserId: userId,
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to delete user.",
    });
  }
};

const User = require("../models/UserModel");
const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  return userObj;
};

const allowedRoles = [
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

const isValidRole = (role) => allowedRoles.includes(role);

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
};

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

exports.registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phone,
      dateOfBirth,
      gender,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      nationality,
      preferredCurrency,
      profileImage,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const userRole = role && isValidRole(role) ? role : "user";

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      phone: phone || "",
      dateOfBirth: dateOfBirth || null,
      gender: gender || "",
      addressLine1: addressLine1 || "",
      addressLine2: addressLine2 || "",
      city: city || "",
      state: state || "",
      country: country || "",
      postalCode: postalCode || "",
      nationality: nationality || "",
      preferredCurrency: preferredCurrency || "INR",
      profileImage: profileImage || "",
    });

    const token = user.getJwtToken();

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("registerUser error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register user.",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = user.getJwtToken();

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("loginUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const bodyToken =
      req.body?.token || req.body?.accessToken || req.body?.access_token || "";

    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.substring(7)
      : "";

    const cookieToken =
      req.cookies?.token ||
      req.cookies?.accessToken ||
      req.cookies?.access_token ||
      "";

    const token = bodyToken || headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    const userId = decoded?.id || decoded?._id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive.",
      });
    }

    const newToken = user.getJwtToken();

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      token: newToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("refreshToken error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to refresh token.",
      error: error.message,
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("logoutUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
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
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("getMyProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const allowedFields = [
      "fullName",
      "phone",
      "dateOfBirth",
      "gender",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "country",
      "postalCode",
      "nationality",
      "preferredCurrency",
      "profileImage",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();

      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Another user already uses this email.",
        });
      }

      updates.email = email;
    }

    delete updates.role;
    delete updates.isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
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
      message: "Profile updated successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("updateMyProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const valid = await user.comparePassword(currentPassword);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("changePassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, password reset instructions have been generated.",
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
      validateBeforeSave: false,
    });

    const response = {
      success: true,
      message:
        "If an account exists with this email, password reset instructions have been generated.",
    };

    if (process.env.NODE_ENV === "development") {
      response.resetToken = resetToken;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("forgotPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process forgot password request.",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token.",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("getUserById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user.",
      error: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      isActive,
      phone,
      dateOfBirth,
      gender,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      nationality,
      preferredCurrency,
      profileImage,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    if (role && !isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password,
      role: role || "user",
      isActive: typeof isActive === "boolean" ? isActive : true,
      phone: phone || "",
      dateOfBirth: dateOfBirth || null,
      gender: gender || "",
      addressLine1: addressLine1 || "",
      addressLine2: addressLine2 || "",
      city: city || "",
      state: state || "",
      country: country || "",
      postalCode: postalCode || "",
      nationality: nationality || "",
      preferredCurrency: preferredCurrency || "INR",
      profileImage: profileImage || "",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("createUser error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user.",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role,
      isActive,
      city,
      state,
      country,
      gender,
      nationality,
      sortBy = "createdAt",
      sortOrder = "desc",
      fromDate,
      toDate,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);

    const filter = {};

    if (String(search).trim()) {
      const regex = new RegExp(escapeRegex(String(search).trim()), "i");

      filter.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { city: regex },
        { state: regex },
        { country: regex },
        { postalCode: regex },
      ];
    }

    if (role) {
      const roles = String(role)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const invalidRole = roles.find((item) => !isValidRole(item));

      if (invalidRole) {
        return res.status(400).json({
          success: false,
          message: `Invalid role: ${invalidRole}`,
        });
      }

      filter.role = roles.length === 1 ? roles[0] : { $in: roles };
    }

    const activeValue = parseBoolean(isActive);

    if (activeValue !== undefined) {
      filter.isActive = activeValue;
    }

    if (city) {
      filter.city = new RegExp(`^${escapeRegex(String(city).trim())}$`, "i");
    }

    if (state) {
      filter.state = new RegExp(`^${escapeRegex(String(state).trim())}$`, "i");
    }

    if (country) {
      filter.country = new RegExp(
        `^${escapeRegex(String(country).trim())}$`,
        "i",
      );
    }

    if (gender) {
      filter.gender = new RegExp(
        `^${escapeRegex(String(gender).trim())}$`,
        "i",
      );
    }

    if (nationality) {
      filter.nationality = new RegExp(
        `^${escapeRegex(String(nationality).trim())}$`,
        "i",
      );
    }

    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        const start = new Date(fromDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate.",
          });
        }

        filter.createdAt.$gte = start;
      }

      if (toDate) {
        const end = new Date(toDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate.",
          });
        }

        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const allowedSortFields = [
      "fullName",
      "email",
      "role",
      "createdAt",
      "updatedAt",
      "city",
      "state",
      "country",
      "dateOfBirth",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const safeSortOrder = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

    const sort = {
      [safeSortBy]: safeSortOrder,
    };

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalUsers / limitNumber);

    return res.status(200).json({
      success: true,
      users: users.map(sanitizeUser),
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalUsers,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
      filters: {
        search,
        role,
        isActive,
        city,
        state,
        country,
        gender,
        nationality,
        sortBy: safeSortBy,
        sortOrder: safeSortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    console.error("getAllUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const allowedFields = [
      "fullName",
      "email",
      "phone",
      "dateOfBirth",
      "gender",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "country",
      "postalCode",
      "nationality",
      "preferredCurrency",
      "profileImage",
      "isActive",
      "role",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.email !== undefined) {
      updates.email = String(updates.email).trim().toLowerCase();

      const emailExists = await User.findOne({
        email: updates.email,
        _id: { $ne: id },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Another user already uses this email.",
        });
      }
    }

    if (updates.role !== undefined && !isValidRole(updates.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
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
      message: "User updated successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("updateUser error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
      error: error.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (!role || !isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          role,
        },
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
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("updateUserRole error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role.",
      error: error.message,
    });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: true,
        },
      },
      {
        new: true,
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
      message: "User activated successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("activateUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate user.",
      error: error.message,
    });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
        },
      },
      {
        new: true,
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
      message: "User deactivated successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("deactivateUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate user.",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      deletedUserId: id,
    });
  } catch (error) {
    console.error("deleteUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message,
    });
  }
};

exports.bulkActivateUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array.",
      });
    }

    const result = await User.updateMany(
      {
        _id: { $in: userIds },
      },
      {
        $set: {
          isActive: true,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Users activated successfully.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("bulkActivateUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate users.",
      error: error.message,
    });
  }
};

exports.bulkDeactivateUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array.",
      });
    }

    const result = await User.updateMany(
      {
        _id: { $in: userIds },
      },
      {
        $set: {
          isActive: false,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Users deactivated successfully.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("bulkDeactivateUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate users.",
      error: error.message,
    });
  }
};

exports.bulkUpdateRole = async (req, res) => {
  try {
    const { userIds, role } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array.",
      });
    }

    if (!role || !isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const result = await User.updateMany(
      {
        _id: { $in: userIds },
      },
      {
        $set: {
          role,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "User roles updated successfully.",
      role,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("bulkUpdateRole error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user roles.",
      error: error.message,
    });
  }
};

exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array.",
      });
    }

    const result = await User.deleteMany({
      _id: { $in: userIds },
    });

    return res.status(200).json({
      success: true,
      message: "Users deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("bulkDeleteUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete users.",
      error: error.message,
    });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const users = await User.find({
      role,
    }).sort({
      fullName: 1,
    });

    return res.status(200).json({
      success: true,
      role,
      count: users.length,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error("getUsersByRole error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users by role.",
      error: error.message,
    });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({
      isActive: true,
    }).sort({
      fullName: 1,
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error("getActiveUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active users.",
      error: error.message,
    });
  }
};

exports.getInactiveUsers = async (req, res) => {
  try {
    const users = await User.find({
      isActive: false,
    }).sort({
      fullName: 1,
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error("getInactiveUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inactive users.",
      error: error.message,
    });
  }
};

exports.getUserStatistics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStatistics,
      cityStatistics,
      stateStatistics,
      countryStatistics,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        isActive: true,
      }),
      User.countDocuments({
        isActive: false,
      }),
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            city: {
              $nin: ["", null],
            },
          },
        },
        {
          $group: {
            _id: "$city",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            state: {
              $nin: ["", null],
            },
          },
        },
        {
          $group: {
            _id: "$state",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            country: {
              $nin: ["", null],
            },
          },
        },
        {
          $group: {
            _id: "$country",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleStatistics,
        cityStatistics,
        stateStatistics,
        countryStatistics,
      },
    });
  } catch (error) {
    console.error("getUserStatistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate user statistics.",
      error: error.message,
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !String(q).trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const regex = new RegExp(escapeRegex(String(q).trim()), "i");

    const users = await User.find({
      $or: [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { city: regex },
        { state: regex },
        { country: regex },
      ],
    })
      .sort({
        fullName: 1,
      })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error("searchUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search users.",
      error: error.message,
    });
  }
};

exports.checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).select("_id");

    return res.status(200).json({
      success: true,
      email: normalizedEmail,
      available: !existingUser,
    });
  } catch (error) {
    console.error("checkEmailAvailability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check email availability.",
      error: error.message,
    });
  }
};

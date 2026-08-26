const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// =====================================================
// JWT SECRET
// =====================================================

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured in the backend environment.");
  }

  return secret;
};

// =====================================================
// VERIFY ACCESS TOKEN
// =====================================================

const verifyAccessToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

// =====================================================
// REQUIRE SIGN IN
// =====================================================

const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("=================================");
    console.log("AUTH MIDDLEWARE");
    console.log("Authorization:", authHeader ? "PRESENT" : "MISSING");
    console.log("=================================");

    // =================================================
    // CHECK AUTH HEADER
    // =================================================

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing.",
        code: "TOKEN_MISSING",
      });
    }

    // =================================================
    // EXTRACT TOKEN
    // =================================================

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing.",
        code: "TOKEN_MISSING",
      });
    }

    // =================================================
    // VERIFY TOKEN
    // =================================================

    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (jwtError) {
      console.error("JWT VERIFICATION ERROR:", jwtError.name, jwtError.message);

      // -----------------------------------------------
      // TOKEN EXPIRED
      // -----------------------------------------------

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Authentication token has expired.",
          code: "TOKEN_EXPIRED",
        });
      }

      // -----------------------------------------------
      // INVALID TOKEN
      // -----------------------------------------------

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token.",
          code: "INVALID_TOKEN",
        });
      }

      // -----------------------------------------------
      // OTHER JWT ERROR
      // -----------------------------------------------

      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
        code: "AUTHENTICATION_FAILED",
      });
    }

    console.log("Decoded JWT:", decoded);

    // =================================================
    // CHECK USER ID
    // =================================================

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
        code: "INVALID_TOKEN",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user = await User.findById(decoded.id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
        code: "USER_NOT_FOUND",
      });
    }

    // =================================================
    // CHECK ACTIVE
    // =================================================

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // =================================================
    // ATTACH USER
    // =================================================

    req.user = user;

    console.log("Authenticated User:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    next();
  } catch (error) {
    console.error("AUTHENTICATION ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTHENTICATION_FAILED",
    });
  }
};

// =====================================================
// ROLE CHECK
// =====================================================

const checkRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access.",
          code: "UNAUTHORIZED",
        });
      }

      const currentRole = String(req.user.role || "").toLowerCase();

      const normalizedAllowedRoles = allowedRoles.map((role) =>
        String(role).toLowerCase(),
      );

      if (!normalizedAllowedRoles.includes(currentRole)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to access this resource.",
          code: "FORBIDDEN",
        });
      }

      next();
    } catch (error) {
      console.error("ROLE AUTHORIZATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization check failed.",
      });
    }
  };
};

// =====================================================
// ROLE MIDDLEWARE
// =====================================================

const isSuperAdmin = checkRoles("superadmin");

const isAdmin = checkRoles("superadmin", "admin");

const adminMiddleware = checkRoles("superadmin", "admin");

const authorizeRoles = (...roles) => checkRoles(...roles);

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  requireSignIn,
  requireSignin: requireSignIn,
  isAuthenticatedUser: requireSignIn,
  protect: requireSignIn,
  verifyToken: requireSignIn,

  isSuperAdmin,
  isAdmin,
  adminMiddleware,
  authorizeRoles,
};

const mongoose = require("mongoose");

const Faculty = require("../models/FacultyModel");
const User = require("../models/UserModel");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// EMPLOYMENT TYPE NORMALIZER
// =====================================================

// ============================================================
// EMPLOYMENT TYPE NORMALIZER
// MUST MATCH FacultyModel.js ENUM EXACTLY
// ============================================================

const normalizeEmploymentType = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value).trim();

  if (!raw) {
    return "";
  }

  const normalized = raw
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const mapping = {
    "": "",

    permanent: "Permanent",
    "full time": "Permanent",
    "full-time": "Permanent",
    fulltime: "Permanent",

    contract: "Contract",

    guest: "Guest",

    visiting: "Visiting",
    "visiting faculty": "Visiting",

    "part time": "Part Time",
    "part-time": "Part Time",
    parttime: "Part Time",
  };

  return mapping[normalized] || "";
};

// =====================================================
// STATUS NORMALIZER
// =====================================================

const normalizeStatus = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "active";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");

  const allowedStatuses = ["active", "inactive", "on_leave", "retired"];

  return allowedStatuses.includes(normalized) ? normalized : null;
};

// =====================================================
// DATE NORMALIZER
// =====================================================

const normalizeDate = (value, fieldName) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return {
      valid: true,
      value: null,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      valid: false,
      message: `Invalid ${fieldName}.`,
    };
  }

  return {
    valid: true,
    value: date,
  };
};

// =====================================================
// VALIDATE EXPERIENCE
// =====================================================

const normalizeExperience = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return {
      valid: true,
      value: 0,
    };
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return {
      valid: false,
      message: "Experience must be a valid number greater than or equal to 0.",
    };
  }

  return {
    valid: true,
    value: number,
  };
};

// =====================================================
// GET ALL FACULTY
// =====================================================

exports.getAllFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.find()
      .populate("userId", "-password -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: faculties.length,
      data: faculties,
    });
  } catch (error) {
    console.error("GET ALL FACULTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch faculties.",
      error: error.message,
    });
  }
};

// =====================================================
// GET FACULTY BY ID
// =====================================================

exports.getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id).populate(
      "userId",
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error("GET FACULTY BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch faculty.",
      error: error.message,
    });
  }
};

// =====================================================
// GET FACULTY BY USER ID
// =====================================================

exports.getFacultyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID.",
      });
    }

    const faculty = await Faculty.findOne({ userId }).populate(
      "userId",
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error("GET FACULTY BY USER ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch faculty.",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY FACULTY PROFILE
// =====================================================

exports.getMyFacultyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid authenticated User ID.",
      });
    }

    const faculty = await Faculty.findOne({ userId }).populate(
      "userId",
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error("GET MY FACULTY PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your faculty profile.",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE FACULTY
// =====================================================

exports.createFaculty = async (req, res) => {
  let createdNewUser = false;
  let user = null;

  try {
    const {
      fullName,
      email,
      password,
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

      employeeId,
      designation,
      department,
      qualification,
      specialization,
      experience,
      joiningDate,
      employmentType,
      status,

      subjects,
      classes,

      dummyAttendance,
      dummyTimetable,
    } = req.body;

    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!employeeId || !String(employeeId).trim()) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required.",
      });
    }

    if (!designation || !String(designation).trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation is required.",
      });
    }

    if (!department || !String(department).trim()) {
      return res.status(400).json({
        success: false,
        message: "Department is required.",
      });
    }

    // =================================================
    // NORMALIZATION
    // =================================================

    const normalizedEmail = String(email).trim().toLowerCase();

    const normalizedEmployeeId = String(employeeId).trim();

    const normalizedEmploymentType = normalizeEmploymentType(employmentType);

    const normalizedStatus = normalizeStatus(status);

    const normalizedExperience = normalizeExperience(experience);

    // =================================================
    // VALIDATE
    // =================================================

    if (normalizedEmploymentType === null) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid employment type. Allowed values are Permanent, Part Time, Contract, Guest, Visiting or empty.",
      });
    }

    if (normalizedStatus === null) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid faculty status. Allowed values are active, inactive, on_leave or retired.",
      });
    }

    if (!normalizedExperience.valid) {
      return res.status(400).json({
        success: false,
        message: normalizedExperience.message,
      });
    }

    // =================================================
    // EMPLOYEE ID CHECK
    // =================================================

    const existingEmployee = await Faculty.findOne({
      employeeId: normalizedEmployeeId,
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: `Faculty with employee ID "${normalizedEmployeeId}" already exists.`,
      });
    }

    // =================================================
    // USER CHECK
    // =================================================

    user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // =================================================
    // EXISTING USER
    // =================================================

    if (user) {
      const existingFaculty = await Faculty.findOne({
        userId: user._id,
      });

      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: "A Faculty profile already exists for this email address.",
        });
      }

      if (user.role !== "faculty") {
        return res.status(400).json({
          success: false,
          message: `A User already exists with this email and has role "${user.role}". A Faculty profile cannot be created for this user.`,
        });
      }

      user.fullName = String(fullName).trim();

      if (phone !== undefined) {
        user.phone = String(phone).trim();
      }

      if (dateOfBirth !== undefined) {
        const result = normalizeDate(dateOfBirth, "date of birth");

        if (!result.valid) {
          return res.status(400).json({
            success: false,
            message: result.message,
          });
        }

        user.dateOfBirth = result.value;
      }

      if (gender !== undefined) {
        user.gender = String(gender).trim();
      }

      if (addressLine1 !== undefined) {
        user.addressLine1 = String(addressLine1).trim();
      }

      if (addressLine2 !== undefined) {
        user.addressLine2 = String(addressLine2).trim();
      }

      if (city !== undefined) {
        user.city = String(city).trim();
      }

      if (state !== undefined) {
        user.state = String(state).trim();
      }

      if (country !== undefined) {
        user.country = String(country).trim();
      }

      if (postalCode !== undefined) {
        user.postalCode = String(postalCode).trim();
      }

      if (nationality !== undefined) {
        user.nationality = String(nationality).trim();
      }

      if (preferredCurrency !== undefined) {
        user.preferredCurrency = String(preferredCurrency).trim() || "INR";
      }

      user.role = "faculty";
      user.isActive = normalizedStatus !== "inactive";

      await user.save();
    }

    // =================================================
    // NEW USER
    // =================================================
    else {
      if (!password || !String(password).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required because no existing User was found for this email.",
        });
      }

      if (String(password).length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
      }

      const dobResult = normalizeDate(dateOfBirth, "date of birth");

      if (!dobResult.valid) {
        return res.status(400).json({
          success: false,
          message: dobResult.message,
        });
      }

      user = new User({
        fullName: String(fullName).trim(),

        email: normalizedEmail,

        password: String(password),

        role: "faculty",

        isActive: normalizedStatus !== "inactive",

        phone: String(phone || "").trim(),

        dateOfBirth: dobResult.value,

        gender: String(gender || "").trim(),

        addressLine1: String(addressLine1 || "").trim(),

        addressLine2: String(addressLine2 || "").trim(),

        city: String(city || "").trim(),

        state: String(state || "").trim(),

        country: String(country || "").trim(),

        postalCode: String(postalCode || "").trim(),

        nationality: String(nationality || "").trim(),

        preferredCurrency: String(preferredCurrency || "INR").trim() || "INR",
      });

      await user.save();

      createdNewUser = true;
    }

    // =================================================
    // JOINING DATE
    // =================================================

    const normalizedJoiningDate = normalizeDate(joiningDate, "joining date");

    if (!normalizedJoiningDate.valid) {
      if (createdNewUser && user?._id) {
        await User.findByIdAndDelete(user._id);
      }

      return res.status(400).json({
        success: false,
        message: normalizedJoiningDate.message,
      });
    }

    // =================================================
    // CREATE FACULTY
    // =================================================

    const faculty = new Faculty({
      userId: user._id,

      employeeId: normalizedEmployeeId,

      designation: String(designation).trim(),

      department: String(department).trim(),

      qualification: String(qualification || "").trim(),

      specialization: String(specialization || "").trim(),

      experience: normalizedExperience.value,

      joiningDate: normalizedJoiningDate.value,

      employmentType: normalizedEmploymentType,

      status: normalizedStatus,

      subjects: Array.isArray(subjects)
        ? subjects.map((subject) => ({
            subjectCode: String(subject?.subjectCode || "").trim(),

            subjectName: String(subject?.subjectName || "").trim(),
          }))
        : [],

      classes: Array.isArray(classes)
        ? classes.map((item) => String(item).trim()).filter(Boolean)
        : [],

      dummyAttendance: Array.isArray(dummyAttendance) ? dummyAttendance : [],

      dummyTimetable: Array.isArray(dummyTimetable) ? dummyTimetable : [],
    });

    await faculty.save();

    return res.status(201).json({
      success: true,

      message: createdNewUser
        ? "Faculty and User account created successfully."
        : "Faculty profile created successfully using the existing User account.",

      data: {
        faculty,

        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },

        userCreated: createdNewUser,
      },
    });
  } catch (error) {
    console.error("==========================================");
    console.error("CREATE FACULTY ERROR");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Errors:", error.errors);
    console.error("Stack:", error.stack);
    console.error("==========================================");

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "email") {
        return res.status(409).json({
          success: false,
          message: "A User with this email address already exists.",
        });
      }

      if (duplicateField === "employeeId") {
        return res.status(409).json({
          success: false,
          message: "A Faculty with this Employee ID already exists.",
        });
      }

      if (duplicateField === "userId") {
        return res.status(409).json({
          success: false,
          message: "A Faculty profile already exists for this User.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Duplicate data already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((item) => item.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
        errors: error.errors,
      });
    }

    if (createdNewUser && user?._id) {
      try {
        await User.findByIdAndDelete(user._id);
      } catch (rollbackError) {
        console.error("USER ROLLBACK ERROR:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create faculty.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE FACULTY
// =====================================================

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    console.log("==========================================");
    console.log("UPDATE FACULTY REQUEST");
    console.log("Faculty ID:", id);
    console.log("Request body:", body);
    console.log("Authenticated user:", req.user);
    console.log("==========================================");

    // =================================================
    // VALIDATE ID
    // =================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    // =================================================
    // FIND FACULTY
    // =================================================

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    if (!faculty.userId) {
      return res.status(400).json({
        success: false,
        message: "Faculty record is not linked to a User account.",
      });
    }

    const user = await User.findById(faculty.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Linked user account not found.",
      });
    }

    // =================================================
    // USER INFORMATION
    // =================================================

    if (body.fullName !== undefined) {
      const fullName = String(body.fullName).trim();

      if (!fullName) {
        return res.status(400).json({
          success: false,
          message: "Full name is required.",
        });
      }

      if (fullName.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Full name must be at least 3 characters.",
        });
      }

      user.fullName = fullName;
    }

    // =================================================
    // EMAIL
    // =================================================

    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered.",
        });
      }

      user.email = email;
    }

    if (body.phone !== undefined) {
      user.phone = String(body.phone).trim();
    }

    if (body.dateOfBirth !== undefined) {
      const result = normalizeDate(body.dateOfBirth, "date of birth");

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      user.dateOfBirth = result.value;
    }

    if (body.gender !== undefined) {
      user.gender = String(body.gender).trim();
    }

    if (body.addressLine1 !== undefined) {
      user.addressLine1 = String(body.addressLine1).trim();
    }

    if (body.addressLine2 !== undefined) {
      user.addressLine2 = String(body.addressLine2).trim();
    }

    if (body.city !== undefined) {
      user.city = String(body.city).trim();
    }

    if (body.state !== undefined) {
      user.state = String(body.state).trim();
    }

    if (body.country !== undefined) {
      user.country = String(body.country).trim();
    }

    if (body.postalCode !== undefined) {
      user.postalCode = String(body.postalCode).trim();
    }

    if (body.nationality !== undefined) {
      user.nationality = String(body.nationality).trim();
    }

    if (body.preferredCurrency !== undefined) {
      user.preferredCurrency = String(body.preferredCurrency).trim() || "INR";
    }

    // =================================================
    // EMPLOYEE ID
    // =================================================

    if (body.employeeId !== undefined) {
      const employeeId = String(body.employeeId).trim();

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required.",
        });
      }

      const existingFaculty = await Faculty.findOne({
        employeeId,
        _id: { $ne: faculty._id },
      });

      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: "Employee ID is already assigned to another faculty.",
        });
      }

      faculty.employeeId = employeeId;
    }

    // =================================================
    // DESIGNATION
    // =================================================

    if (body.designation !== undefined) {
      const designation = String(body.designation).trim();

      if (!designation) {
        return res.status(400).json({
          success: false,
          message: "Designation is required.",
        });
      }

      faculty.designation = designation;
    }

    // =================================================
    // DEPARTMENT
    // =================================================

    if (body.department !== undefined) {
      const department = String(body.department).trim();

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department is required.",
        });
      }

      faculty.department = department;
    }

    // =================================================
    // QUALIFICATION
    // =================================================

    if (body.qualification !== undefined) {
      faculty.qualification = String(body.qualification).trim();
    }

    // =================================================
    // SPECIALIZATION
    // =================================================

    if (body.specialization !== undefined) {
      faculty.specialization = String(body.specialization).trim();
    }

    // =================================================
    // EXPERIENCE
    // =================================================

    if (body.experience !== undefined) {
      const result = normalizeExperience(body.experience);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      faculty.experience = result.value;
    }

    // =================================================
    // EMPLOYMENT TYPE
    // =================================================

    if (body.employmentType !== undefined) {
      console.log("Original employmentType:", body.employmentType);

      const employmentType = normalizeEmploymentType(body.employmentType);

      console.log("Normalized employmentType:", employmentType);

      if (employmentType === null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid employment type. Allowed values are Permanent, Part Time, Contract, Guest, Visiting or empty.",
        });
      }

      faculty.employmentType = employmentType;
    }

    // =================================================
    // JOINING DATE
    // =================================================

    if (body.joiningDate !== undefined) {
      const result = normalizeDate(body.joiningDate, "joining date");

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      faculty.joiningDate = result.value;
    }

    // =================================================
    // STATUS
    // =================================================

    if (body.status !== undefined) {
      const status = normalizeStatus(body.status);

      if (status === null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid faculty status. Allowed values are active, inactive, on_leave or retired.",
        });
      }

      faculty.status = status;

      user.isActive = status !== "inactive";
    }

    // =================================================
    // SUBJECTS
    // =================================================

    if (body.subjects !== undefined) {
      if (!Array.isArray(body.subjects)) {
        return res.status(400).json({
          success: false,
          message: "Subjects must be an array.",
        });
      }

      const subjects = [];

      for (const subject of body.subjects) {
        const subjectCode = String(subject?.subjectCode || "").trim();

        const subjectName = String(subject?.subjectName || "").trim();

        if (!subjectCode || !subjectName) {
          return res.status(400).json({
            success: false,
            message: "Every subject must contain subjectCode and subjectName.",
          });
        }

        subjects.push({
          subjectCode,
          subjectName,
        });
      }

      faculty.subjects = subjects;
    }

    // =================================================
    // CLASSES
    // =================================================

    if (body.classes !== undefined) {
      if (!Array.isArray(body.classes)) {
        return res.status(400).json({
          success: false,
          message: "Classes must be an array.",
        });
      }

      faculty.classes = body.classes
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    // =================================================
    // DUMMY ATTENDANCE
    // =================================================

    if (body.dummyAttendance !== undefined) {
      if (!Array.isArray(body.dummyAttendance)) {
        return res.status(400).json({
          success: false,
          message: "dummyAttendance must be an array.",
        });
      }

      faculty.dummyAttendance = body.dummyAttendance;
    }

    // =================================================
    // DUMMY TIMETABLE
    // =================================================

    if (body.dummyTimetable !== undefined) {
      if (!Array.isArray(body.dummyTimetable)) {
        return res.status(400).json({
          success: false,
          message: "dummyTimetable must be an array.",
        });
      }

      faculty.dummyTimetable = body.dummyTimetable;
    }

    // =================================================
    // SAVE USER
    // =================================================

    await user.save();

    // =================================================
    // SAVE FACULTY
    // =================================================

    await faculty.save();

    // =================================================
    // GET UPDATED FACULTY
    // =================================================

    const updatedFaculty = await Faculty.findById(faculty._id).populate(
      "userId",
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    console.log("FACULTY UPDATE SUCCESSFUL:", faculty._id);

    return res.status(200).json({
      success: true,
      message: "Faculty updated successfully.",
      data: updatedFaculty,
      faculty: updatedFaculty,
    });
  } catch (error) {
    console.error("==========================================");
    console.error("UPDATE FACULTY ERROR");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Path:", error.path);
    console.error("Value:", error.value);
    console.error("Errors:", error.errors);
    console.error("Key Pattern:", error.keyPattern);
    console.error("Key Value:", error.keyValue);
    console.error("Stack:", error.stack);
    console.error("==========================================");

    // =================================================
    // VALIDATION ERROR
    // =================================================

    if (error.name === "ValidationError") {
      const validationErrors = {};

      Object.keys(error.errors || {}).forEach((field) => {
        validationErrors[field] =
          error.errors[field]?.message || "Invalid value";
      });

      const messages = Object.values(validationErrors);

      return res.status(400).json({
        success: false,
        message:
          messages.length > 0
            ? messages.join(", ")
            : "Faculty validation failed.",
        errors: validationErrors,
      });
    }

    // =================================================
    // CAST ERROR
    // =================================================

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid value for ${error.path}.`,
        path: error.path,
        value: error.value,
      });
    }

    // =================================================
    // DUPLICATE KEY
    // =================================================

    if (error.code === 11000) {
      const duplicateFields = Object.keys(error.keyPattern || {});

      if (duplicateFields.includes("email")) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered.",
          fields: duplicateFields,
        });
      }

      if (duplicateFields.includes("employeeId")) {
        return res.status(409).json({
          success: false,
          message: "Employee ID is already assigned.",
          fields: duplicateFields,
        });
      }

      if (duplicateFields.includes("userId")) {
        return res.status(409).json({
          success: false,
          message: "A Faculty profile already exists for this User.",
          fields: duplicateFields,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Duplicate data already exists.",
        fields: duplicateFields,
      });
    }

    // =================================================
    // GENERAL ERROR
    // =================================================

    return res.status(500).json({
      success: false,
      message: "Failed to update faculty.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MY FACULTY PROFILE
// =====================================================

exports.updateMyFacultyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid authenticated User ID.",
      });
    }

    const faculty = await Faculty.findOne({
      userId,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const {
      fullName,
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
      qualification,
      specialization,
    } = req.body;

    // =================================================
    // USER
    // =================================================

    if (fullName !== undefined) {
      const normalizedFullName = String(fullName).trim();

      if (normalizedFullName.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Full name must be at least 3 characters.",
        });
      }

      user.fullName = normalizedFullName;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (dateOfBirth !== undefined) {
      const result = normalizeDate(dateOfBirth, "date of birth");

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      user.dateOfBirth = result.value;
    }

    if (gender !== undefined) {
      user.gender = String(gender).trim();
    }

    if (addressLine1 !== undefined) {
      user.addressLine1 = String(addressLine1).trim();
    }

    if (addressLine2 !== undefined) {
      user.addressLine2 = String(addressLine2).trim();
    }

    if (city !== undefined) {
      user.city = String(city).trim();
    }

    if (state !== undefined) {
      user.state = String(state).trim();
    }

    if (country !== undefined) {
      user.country = String(country).trim();
    }

    if (postalCode !== undefined) {
      user.postalCode = String(postalCode).trim();
    }

    if (nationality !== undefined) {
      user.nationality = String(nationality).trim();
    }

    if (preferredCurrency !== undefined) {
      user.preferredCurrency = String(preferredCurrency).trim() || "INR";
    }

    // =================================================
    // FACULTY
    // =================================================

    if (qualification !== undefined) {
      faculty.qualification = String(qualification).trim();
    }

    if (specialization !== undefined) {
      faculty.specialization = String(specialization).trim();
    }

    await user.save();

    await faculty.save();

    const updatedFaculty = await Faculty.findById(faculty._id).populate(
      "userId",
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    return res.status(200).json({
      success: true,
      message: "Faculty profile updated successfully.",
      data: updatedFaculty,
    });
  } catch (error) {
    console.error("UPDATE MY FACULTY PROFILE ERROR:", error);

    if (error.name === "ValidationError") {
      const validationErrors = {};

      Object.keys(error.errors || {}).forEach((field) => {
        validationErrors[field] =
          error.errors[field]?.message || "Invalid value";
      });

      return res.status(400).json({
        success: false,
        message: Object.values(validationErrors).join(", "),
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update faculty profile.",
      error: error.message,
    });
  }
};

// =====================================================
// ADD SUBJECT
// =====================================================

exports.addSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const { subjectCode, subjectName } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    if (!subjectCode || !String(subjectCode).trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject code is required.",
      });
    }

    if (!subjectName || !String(subjectName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const code = String(subjectCode).trim();

    const exists = faculty.subjects.some(
      (subject) =>
        String(subject.subjectCode).toLowerCase() === code.toLowerCase(),
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Subject already assigned.",
      });
    }

    faculty.subjects.push({
      subjectCode: code,
      subjectName: String(subjectName).trim(),
    });

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Subject added successfully.",
      data: faculty,
    });
  } catch (error) {
    console.error("ADD SUBJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add subject.",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE SUBJECT
// =====================================================

exports.removeSubject = async (req, res) => {
  try {
    const { id, subject } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const decodedSubject = decodeURIComponent(subject);

    faculty.subjects = faculty.subjects.filter(
      (item) =>
        String(item.subjectCode).toLowerCase() !== decodedSubject.toLowerCase(),
    );

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Subject removed successfully.",
      data: faculty,
    });
  } catch (error) {
    console.error("REMOVE SUBJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove subject.",
      error: error.message,
    });
  }
};

// =====================================================
// ADD CLASS
// =====================================================

exports.addClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    if (!className || !String(className).trim()) {
      return res.status(400).json({
        success: false,
        message: "Class name is required.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const normalizedClass = String(className).trim();

    const exists = faculty.classes.some(
      (item) => String(item).toLowerCase() === normalizedClass.toLowerCase(),
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Class already assigned.",
      });
    }

    faculty.classes.push(normalizedClass);

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Class added successfully.",
      data: faculty,
    });
  } catch (error) {
    console.error("ADD CLASS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add class.",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE CLASS
// =====================================================

exports.removeClass = async (req, res) => {
  try {
    const { id, className } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const decodedClass = decodeURIComponent(className);

    faculty.classes = faculty.classes.filter(
      (item) => String(item).toLowerCase() !== decodedClass.toLowerCase(),
    );

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Class removed successfully.",
      data: faculty,
    });
  } catch (error) {
    console.error("REMOVE CLASS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove class.",
      error: error.message,
    });
  }
};

// =====================================================
// ADD DUMMY ATTENDANCE
// =====================================================

exports.addDummyAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const {
      date,
      subjectCode,
      subjectName,
      className,
      totalStudents,
      presentStudents,
      absentStudents,
      status,
      cancellationReason,
      rescheduleRequired,
      rescheduleDate,
      remarks,
    } = req.body;

    const normalizedStatus = ["taken", "not_taken", "cancelled"].includes(
      status,
    )
      ? status
      : "taken";

    const total = Math.max(0, Number(totalStudents || 0));

    const present = Math.max(0, Number(presentStudents || 0));

    const absent = Math.max(
      0,
      Number(absentStudents !== undefined ? absentStudents : total - present),
    );

    if (present > total) {
      return res.status(400).json({
        success: false,
        message: "Present students cannot be greater than total students.",
      });
    }

    const attendance = {
      date: date || new Date(),

      subjectCode: String(subjectCode || "").trim(),

      subjectName: String(subjectName || "").trim(),

      className: String(className || "").trim(),

      totalStudents: total,

      presentStudents: present,

      absentStudents: absent,

      status: normalizedStatus,

      cancellationReason: String(cancellationReason || "").trim(),

      rescheduleRequired: Boolean(rescheduleRequired),

      rescheduleDate: rescheduleDate || null,

      remarks: String(remarks || "").trim(),
    };

    faculty.dummyAttendance.push(attendance);

    await faculty.save();

    return res.status(201).json({
      success: true,
      message: "Dummy attendance added successfully.",
      data: faculty.dummyAttendance[faculty.dummyAttendance.length - 1],
    });
  } catch (error) {
    console.error("ADD DUMMY ATTENDANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add dummy attendance.",
      error: error.message,
    });
  }
};

// =====================================================
// GET FACULTY ATTENDANCE
// =====================================================

exports.getFacultyAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id).select("dummyAttendance");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: faculty.dummyAttendance.length,
      data: faculty.dummyAttendance,
    });
  } catch (error) {
    console.error("GET FACULTY ATTENDANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch faculty attendance.",
      error: error.message,
    });
  }
};

// =====================================================
// GET FACULTY TIMETABLE
// =====================================================

exports.getFacultyTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id).select("dummyTimetable");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: faculty.dummyTimetable.length,
      data: faculty.dummyTimetable,
    });
  } catch (error) {
    console.error("GET FACULTY TIMETABLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch faculty timetable.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE FACULTY
// =====================================================

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const userId = faculty.userId;

    await Faculty.findByIdAndDelete(id);

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          isActive: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Faculty deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE FACULTY ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Faculty ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete faculty.",
      error: error.message,
    });
  }
};

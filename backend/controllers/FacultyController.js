const mongoose = require("mongoose");

const Faculty = require("../models/FacultyModel");
const User = require("../models/UserModel");

// HELPER FUNCTIONS

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === true || value === "true" || value === "1") {
    return true;
  }

  if (value === false || value === "false" || value === "0") {
    return false;
  }

  return undefined;
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const sendError = (res, error, defaultMessage = "Something went wrong.") => {
  console.error(error);

  if (error?.code === 11000) {
    const duplicateFields = Object.keys(error.keyPattern || {});

    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${
        duplicateFields.join(", ") || "unique field"
      }.`,
    });
  }

  if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);

    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: error?.message || defaultMessage,
  });
};

// GET ALL FACULTY
// SEARCH + FILTER + SORT + PAGINATION

exports.getAllFaculty = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 20), 100);

    const skip = (page - 1) * limit;

    const {
      search,
      employeeId,
      department,
      designation,
      employmentType,
      status,
      userId,
    } = req.query;

    const isDeleted = parseBoolean(req.query.isDeleted);

    // SORTING

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "employeeId",
      "designation",
      "department",
      "experience",
      "joiningDate",
      "status",
      "employmentType",
    ];

    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";

    const sortOrder =
      String(req.query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

    // FILTER

    const filter = {};

    if (isDeleted !== undefined) {
      filter.isDeleted = isDeleted;
    } else {
      filter.isDeleted = false;
    }

    if (employeeId) {
      filter.employeeId = {
        $regex: `^${escapeRegex(employeeId)}$`,
        $options: "i",
      };
    }

    if (department) {
      filter.department = {
        $regex: escapeRegex(department),
        $options: "i",
      };
    }

    if (designation) {
      filter.designation = {
        $regex: escapeRegex(designation),
        $options: "i",
      };
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (status) {
      filter.status = status;
    }

    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID.",
        });
      }

      filter.userId = userId;
    }

    // SEARCH

    if (search && search.trim()) {
      const searchRegex = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };

      const matchingUsers = await User.find({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select("_id");

      const matchingUserIds = matchingUsers.map((user) => user._id);

      filter.$or = [
        { employeeId: searchRegex },
        { department: searchRegex },
        { designation: searchRegex },
        { qualification: searchRegex },
        { specialization: searchRegex },
        { userId: { $in: matchingUserIds } },
      ];
    }

    // QUERY

    const [faculty, total] = await Promise.all([
      Faculty.find(filter)
        .populate({
          path: "userId",
          select:
            "fullName email phone dateOfBirth gender addressLine1 addressLine2 city state country postalCode nationality preferredCurrency profileImage role isActive",
        })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      Faculty.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      count: faculty.length,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to get faculty.");
  }
};

// GET FACULTY BY ID

exports.getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id).populate({
      path: "userId",
      select:
        "fullName email phone dateOfBirth gender addressLine1 addressLine2 city state country postalCode nationality preferredCurrency profileImage role isActive",
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    return res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to get faculty.");
  }
};

// GET FACULTY BY USER ID

exports.getFacultyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const faculty = await Faculty.findOne({
      userId,
    }).populate({
      path: "userId",
      select:
        "fullName email phone dateOfBirth gender addressLine1 addressLine2 city state country postalCode nationality preferredCurrency profileImage role isActive",
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to get faculty by user ID.");
  }
};

// GET MY FACULTY PROFILE

exports.getMyFacultyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user could not be identified.",
      });
    }

    const faculty = await Faculty.findOne({
      userId,
      isDeleted: false,
    }).populate({
      path: "userId",
      select:
        "fullName email phone dateOfBirth gender addressLine1 addressLine2 city state country postalCode nationality preferredCurrency profileImage role isActive",
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to get your faculty profile.");
  }
};

// CREATE FACULTY

exports.createFaculty = async (req, res) => {
  try {
    const {
      userId,
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
    } = req.body;

    // REQUIRED FIELDS

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!employeeId || !employeeId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required.",
      });
    }

    if (!designation || !designation.trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation is required.",
      });
    }

    if (!department || !department.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department is required.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // CHECK USER

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // CHECK EXISTING FACULTY PROFILE

    const existingFaculty = await Faculty.findOne({
      userId,
    });

    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "A faculty profile already exists for this user.",
      });
    }

    // CHECK EMPLOYEE ID

    const existingEmployee = await Faculty.findOne({
      employeeId: employeeId.trim(),
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee ID already exists.",
      });
    }

    // CREATE FACULTY

    const faculty = await Faculty.create({
      userId,
      employeeId: employeeId.trim(),
      designation: designation.trim(),
      department: department.trim(),
      qualification: qualification || "",
      specialization: specialization || "",
      experience:
        experience === undefined || experience === "" ? 0 : Number(experience),
      joiningDate: joiningDate || null,
      employmentType: employmentType || "",
      status: status || "active",
      subjects: normalizeArray(subjects),
      classes: normalizeArray(classes),
      isDeleted: false,
      deletedAt: null,
    });

    // MAKE USER A FACULTY

    if (user.role !== "faculty") {
      user.role = "faculty";
      await user.save();
    }

    const populatedFaculty = await Faculty.findById(faculty._id).populate({
      path: "userId",
      select:
        "fullName email phone dateOfBirth gender addressLine1 addressLine2 city state country postalCode nationality preferredCurrency profileImage role isActive",
    });

    return res.status(201).json({
      success: true,
      message: "Faculty created successfully.",
      faculty: populatedFaculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to create faculty.");
  }
};

// UPDATE FACULTY

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    let faculty = await Faculty.findById(id);
    let user = null;

    if (faculty) {
      user = await User.findById(faculty.userId);
    } else {
      user = await User.findById(id);

      if (user) {
        faculty = await Faculty.findOne({ userId: user._id });
      }
    }

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found.",
      });
    }

    if (!faculty.userId) {
      return res.status(400).json({
        success: false,
        message: "Faculty profile is not linked to a user account.",
      });
    }

    if (!user) {
      user = await User.findById(faculty.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Linked user account not found.",
      });
    }

    const {
      fullName,
      email,
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
      employmentType,
      joiningDate,
      status,
    } = req.body;

    if (fullName !== undefined) {
      const value = String(fullName).trim();

      if (value.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Full name must be at least 3 characters.",
        });
      }

      user.fullName = value;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      const emailRegex = /^\S+@\S+\.\S+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email address is already in use.",
        });
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (dateOfBirth !== undefined) {
      if (!dateOfBirth) {
        user.dateOfBirth = null;
      } else {
        const parsedDate = new Date(dateOfBirth);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid date of birth.",
          });
        }

        user.dateOfBirth = parsedDate;
      }
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
      user.preferredCurrency =
        String(preferredCurrency).trim().toUpperCase() || "INR";
    }

    user.role = "faculty";

    if (employeeId !== undefined) {
      const normalizedEmployeeId = String(employeeId).trim();

      if (!normalizedEmployeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required.",
        });
      }

      const existingFaculty = await Faculty.findOne({
        employeeId: normalizedEmployeeId,
        _id: { $ne: faculty._id },
      });

      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: "Employee ID already exists.",
        });
      }

      faculty.employeeId = normalizedEmployeeId;
    }

    if (designation !== undefined) {
      const value = String(designation).trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: "Designation is required.",
        });
      }

      faculty.designation = value;
    }

    if (department !== undefined) {
      if (department === null || department === "") {
        faculty.department = department;
      } else if (typeof department === "object" && department._id) {
        faculty.department = department._id;
      } else {
        faculty.department = String(department).trim();
      }
    }

    if (qualification !== undefined) {
      faculty.qualification = String(qualification).trim();
    }

    if (specialization !== undefined) {
      faculty.specialization = String(specialization).trim();
    }

    if (experience !== undefined) {
      const numericExperience = experience === "" ? 0 : Number(experience);

      if (!Number.isFinite(numericExperience) || numericExperience < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Experience must be a valid number greater than or equal to 0.",
        });
      }

      faculty.experience = numericExperience;
    }

    if (employmentType !== undefined) {
      const allowedEmploymentTypes = [
        "",
        "Permanent",
        "Contract",
        "Guest",
        "Visiting",
        "Part Time",
      ];

      const normalizedEmploymentType = String(employmentType).trim();

      if (!allowedEmploymentTypes.includes(normalizedEmploymentType)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid employment type. Allowed values are Permanent, Contract, Guest, Visiting, Part Time.",
        });
      }

      faculty.employmentType = normalizedEmploymentType;
    }

    if (joiningDate !== undefined) {
      if (!joiningDate) {
        faculty.joiningDate = null;
      } else {
        const parsedJoiningDate = new Date(joiningDate);

        if (Number.isNaN(parsedJoiningDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid joining date.",
          });
        }

        faculty.joiningDate = parsedJoiningDate;
      }
    }

    if (status !== undefined) {
      const allowedStatuses = ["active", "inactive", "on_leave", "retired"];

      const normalizedStatus = String(status).trim().toLowerCase();

      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty status.",
        });
      }

      faculty.status = normalizedStatus;

      if (normalizedStatus === "active") {
        user.isActive = true;
      } else {
        user.isActive = false;
      }
    }

    await user.save();
    await faculty.save();

    const updatedFaculty = await Faculty.findById(faculty._id).populate({
      path: "userId",
      select:
        "fullName email phone dateOfBirth gender addressLine1 addressLine2 city state country postalCode nationality preferredCurrency profileImage role isActive createdAt updatedAt",
    });

    if (!updatedFaculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty could not be retrieved after update.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Faculty and user details updated successfully.",
      faculty: updatedFaculty,
      data: updatedFaculty,
      user: updatedFaculty.userId,
    });
  } catch (error) {
    console.error("UPDATE FACULTY ERROR:", error);

    if (error.code === 11000) {
      const duplicateFields = Object.keys(
        error.keyPattern || error.keyValue || {},
      );

      return res.status(409).json({
        success: false,
        message: `Duplicate value for: ${
          duplicateFields.join(", ") || "unique field"
        }.`,
      });
    }

    if (error.name === "ValidationError") {
      const errors = {};

      Object.keys(error.errors || {}).forEach((field) => {
        errors[field] = error.errors[field]?.message || "Invalid value";
      });

      return res.status(400).json({
        success: false,
        message: Object.values(errors).join(", ") || "Validation failed.",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update faculty and user.",
    });
  }
};

// UPDATE MY FACULTY PROFILE

exports.updateMyFacultyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user could not be identified.",
      });
    }

    const faculty = await Faculty.findOne({
      userId,
      isDeleted: false,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found.",
      });
    }

    const allowedFields = [
      "qualification",
      "specialization",
      "experience",
      "phone",
      "joiningDate",
      "subjects",
      "classes",
    ];

    // FACULTY FIELDS

    const facultyFields = [
      "qualification",
      "specialization",
      "experience",
      "joiningDate",
      "subjects",
      "classes",
    ];

    facultyFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "subjects" || field === "classes") {
          faculty[field] = normalizeArray(req.body[field]);
        } else if (field === "experience") {
          faculty[field] = req.body[field] === "" ? 0 : Number(req.body[field]);
        } else if (field === "joiningDate") {
          faculty[field] = req.body[field] || null;
        } else if (typeof req.body[field] === "string") {
          faculty[field] = req.body[field].trim();
        } else {
          faculty[field] = req.body[field];
        }
      }
    });

    await faculty.save();

    // USER FIELDS

    const user = await User.findById(userId);

    if (user) {
      if (req.body.phone !== undefined) {
        user.phone = String(req.body.phone).trim();
      }

      const userFields = [
        "fullName",
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

      userFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] =
            typeof req.body[field] === "string"
              ? req.body[field].trim()
              : req.body[field];
        }
      });

      await user.save();
    }

    const updatedFaculty = await Faculty.findById(faculty._id).populate({
      path: "userId",
      select:
        "fullName email phone dateOfBirth gender addressLine1 addressLine2 city state country postalCode nationality preferredCurrency profileImage role isActive",
    });

    return res.status(200).json({
      success: true,
      message: "Faculty profile updated successfully.",
      faculty: updatedFaculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update faculty profile.");
  }
};

// UPDATE FACULTY STATUS

exports.updateFacultyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "inactive", "on_leave", "retired"];

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid faculty status. Allowed values: active, inactive, on_leave, retired.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    faculty.status = status;

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Faculty status updated successfully.",
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update faculty status.");
  }
};

// ACTIVATE FACULTY

exports.activateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    faculty.status = "active";
    faculty.isDeleted = false;
    faculty.deletedAt = null;

    await faculty.save();

    // Keep linked account active
    await User.findByIdAndUpdate(faculty.userId, {
      isActive: true,
      role: "faculty",
    });

    return res.status(200).json({
      success: true,
      message: "Faculty activated successfully.",
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to activate faculty.");
  }
};

// DEACTIVATE FACULTY

exports.deactivateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    faculty.status = "inactive";

    await faculty.save();

    // Prevent login while faculty is inactive
    await User.findByIdAndUpdate(faculty.userId, {
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message: "Faculty deactivated successfully.",
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to deactivate faculty.");
  }
};

// DELETE FACULTY
// SOFT DELETE

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    if (faculty.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Faculty is already deleted.",
      });
    }

    faculty.isDeleted = true;
    faculty.deletedAt = new Date();
    faculty.status = "inactive";

    await faculty.save();

    // Account remains in database but cannot login
    await User.findByIdAndUpdate(faculty.userId, {
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message: "Faculty deleted successfully.",
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete faculty.");
  }
};

// RESTORE FACULTY

exports.restoreFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    if (!faculty.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Faculty is already active in the system.",
      });
    }

    faculty.isDeleted = false;
    faculty.deletedAt = null;
    faculty.status = "active";

    await faculty.save();

    await User.findByIdAndUpdate(faculty.userId, {
      isActive: true,
      role: "faculty",
    });

    return res.status(200).json({
      success: true,
      message: "Faculty restored successfully.",
      faculty,
    });
  } catch (error) {
    return sendError(res, error, "Failed to restore faculty.");
  }
};

// ADD SUBJECT

exports.addSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectCode, subjectName } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    if (!subjectCode || !subjectName) {
      return res.status(400).json({
        success: false,
        message: "Subject code and subject name are required.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const exists = faculty.subjects.some(
      (subject) =>
        subject.subjectCode.toLowerCase() === subjectCode.trim().toLowerCase(),
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Subject already exists for this faculty.",
      });
    }

    faculty.subjects.push({
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
    });

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Subject added successfully.",
      subjects: faculty.subjects,
    });
  } catch (error) {
    return sendError(res, error, "Failed to add subject.");
  }
};

// UPDATE SUBJECT

exports.updateSubject = async (req, res) => {
  try {
    const { id, subjectCode } = req.params;

    const { newSubjectCode, subjectName } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const subject = faculty.subjects.find(
      (item) =>
        item.subjectCode.toLowerCase() ===
        decodeURIComponent(subjectCode).toLowerCase(),
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    if (newSubjectCode !== undefined) {
      subject.subjectCode = String(newSubjectCode).trim();
    }

    if (subjectName !== undefined) {
      subject.subjectName = String(subjectName).trim();
    }

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully.",
      subjects: faculty.subjects,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update subject.");
  }
};

// REMOVE SUBJECT

exports.removeSubject = async (req, res) => {
  try {
    const { id, subject } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const subjectCode = decodeURIComponent(subject);

    const oldLength = faculty.subjects.length;

    faculty.subjects = faculty.subjects.filter(
      (item) => item.subjectCode.toLowerCase() !== subjectCode.toLowerCase(),
    );

    if (faculty.subjects.length === oldLength) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Subject removed successfully.",
      subjects: faculty.subjects,
    });
  } catch (error) {
    return sendError(res, error, "Failed to remove subject.");
  }
};

// ADD CLASS

exports.addClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
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
      (item) => item.toLowerCase() === normalizedClass.toLowerCase(),
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Class already exists for this faculty.",
      });
    }

    faculty.classes.push(normalizedClass);

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Class added successfully.",
      classes: faculty.classes,
    });
  } catch (error) {
    return sendError(res, error, "Failed to add class.");
  }
};

// UPDATE CLASS

exports.updateClass = async (req, res) => {
  try {
    const { id, className } = req.params;
    const { newClassName } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    if (!newClassName || !String(newClassName).trim()) {
      return res.status(400).json({
        success: false,
        message: "New class name is required.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const decodedClassName = decodeURIComponent(className);

    const index = faculty.classes.findIndex(
      (item) => item.toLowerCase() === decodedClassName.toLowerCase(),
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const normalizedNewClass = String(newClassName).trim();

    const duplicate = faculty.classes.some(
      (item, itemIndex) =>
        itemIndex !== index &&
        item.toLowerCase() === normalizedNewClass.toLowerCase(),
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "The new class name already exists.",
      });
    }

    faculty.classes[index] = normalizedNewClass;

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Class updated successfully.",
      classes: faculty.classes,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update class.");
  }
};

// REMOVE CLASS

exports.removeClass = async (req, res) => {
  try {
    const { id, className } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const decodedClassName = decodeURIComponent(className);

    const oldLength = faculty.classes.length;

    faculty.classes = faculty.classes.filter(
      (item) => item.toLowerCase() !== decodedClassName.toLowerCase(),
    );

    if (faculty.classes.length === oldLength) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Class removed successfully.",
      classes: faculty.classes,
    });
  } catch (error) {
    return sendError(res, error, "Failed to remove class.");
  }
};

// ADD DUMMY ATTENDANCE

exports.addDummyAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
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

    const total = Number(totalStudents || 0);
    const present = Number(presentStudents || 0);

    const calculatedAbsent =
      absentStudents !== undefined
        ? Number(absentStudents)
        : Math.max(total - present, 0);

    if (total < 0 || present < 0 || calculatedAbsent < 0) {
      return res.status(400).json({
        success: false,
        message: "Student counts cannot be negative.",
      });
    }

    if (present > total) {
      return res.status(400).json({
        success: false,
        message: "Present students cannot exceed total students.",
      });
    }

    if (status && !["taken", "not_taken", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    faculty.dummyAttendance.push({
      date: date || new Date(),
      subjectCode: subjectCode || "",
      subjectName: subjectName || "",
      className: className || "",
      totalStudents: total,
      presentStudents: present,
      absentStudents: calculatedAbsent,
      status: status || "taken",
      cancellationReason: cancellationReason || "",
      rescheduleRequired: Boolean(rescheduleRequired),
      rescheduleDate: rescheduleDate || null,
      remarks: remarks || "",
    });

    await faculty.save();

    return res.status(201).json({
      success: true,
      message: "Attendance added successfully.",
      attendance: faculty.dummyAttendance[faculty.dummyAttendance.length - 1],
    });
  } catch (error) {
    return sendError(res, error, "Failed to add attendance.");
  }
};

// GET FACULTY ATTENDANCE

exports.getFacultyAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id).select(
      "employeeId dummyAttendance",
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    let attendance = [...faculty.dummyAttendance];

    const { subjectCode, className, status, fromDate, toDate, sortOrder } =
      req.query;

    if (subjectCode) {
      attendance = attendance.filter(
        (item) =>
          item.subjectCode.toLowerCase() === String(subjectCode).toLowerCase(),
      );
    }

    if (className) {
      attendance = attendance.filter(
        (item) =>
          item.className.toLowerCase() === String(className).toLowerCase(),
      );
    }

    if (status) {
      attendance = attendance.filter((item) => item.status === status);
    }

    if (fromDate) {
      const start = new Date(fromDate);

      if (!Number.isNaN(start.getTime())) {
        attendance = attendance.filter((item) => new Date(item.date) >= start);
      }
    }

    if (toDate) {
      const end = new Date(toDate);

      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);

        attendance = attendance.filter((item) => new Date(item.date) <= end);
      }
    }

    attendance.sort((a, b) => {
      const difference = new Date(a.date) - new Date(b.date);

      return String(sortOrder).toLowerCase() === "asc"
        ? difference
        : -difference;
    });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    return sendError(res, error, "Failed to get faculty attendance.");
  }
};

// UPDATE DUMMY ATTENDANCE

exports.updateDummyAttendance = async (req, res) => {
  try {
    const { id, attendanceId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty or attendance ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const attendance = faculty.dummyAttendance.id(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    const allowedFields = [
      "date",
      "subjectCode",
      "subjectName",
      "className",
      "totalStudents",
      "presentStudents",
      "absentStudents",
      "status",
      "cancellationReason",
      "rescheduleRequired",
      "rescheduleDate",
      "remarks",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        attendance[field] = req.body[field];
      }
    });

    const total = Number(attendance.totalStudents || 0);

    const present = Number(attendance.presentStudents || 0);

    if (present > total) {
      return res.status(400).json({
        success: false,
        message: "Present students cannot exceed total students.",
      });
    }

    if (req.body.absentStudents === undefined) {
      attendance.absentStudents = Math.max(total - present, 0);
    }

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      attendance,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update attendance.");
  }
};

// DELETE DUMMY ATTENDANCE

exports.deleteDummyAttendance = async (req, res) => {
  try {
    const { id, attendanceId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty or attendance ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const attendance = faculty.dummyAttendance.id(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    attendance.deleteOne();

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete attendance.");
  }
};

// GET FACULTY TIMETABLE

exports.getFacultyTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findById(id).select(
      "employeeId dummyTimetable",
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: faculty.dummyTimetable.length,
      timetable: faculty.dummyTimetable,
    });
  } catch (error) {
    return sendError(res, error, "Failed to get faculty timetable.");
  }
};

// ADD DUMMY TIMETABLE ENTRY

exports.addDummyTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
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
      day,
      startTime,
      endTime,
      subjectCode,
      subjectName,
      className,
      room,
    } = req.body;

    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Day, start time and end time are required.",
      });
    }

    faculty.dummyTimetable.push({
      day: String(day).trim(),
      startTime: String(startTime).trim(),
      endTime: String(endTime).trim(),
      subjectCode: subjectCode || "",
      subjectName: subjectName || "",
      className: className || "",
      room: room || "",
    });

    await faculty.save();

    return res.status(201).json({
      success: true,
      message: "Timetable entry added successfully.",
      timetable: faculty.dummyTimetable[faculty.dummyTimetable.length - 1],
    });
  } catch (error) {
    return sendError(res, error, "Failed to add timetable entry.");
  }
};

// UPDATE DUMMY TIMETABLE

exports.updateDummyTimetable = async (req, res) => {
  try {
    const { id, timetableId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(timetableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty or timetable ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const timetable = faculty.dummyTimetable.id(timetableId);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found.",
      });
    }

    const allowedFields = [
      "day",
      "startTime",
      "endTime",
      "subjectCode",
      "subjectName",
      "className",
      "room",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        timetable[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Timetable entry updated successfully.",
      timetable,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update timetable entry.");
  }
};

// DELETE DUMMY TIMETABLE

exports.deleteDummyTimetable = async (req, res) => {
  try {
    const { id, timetableId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(timetableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty or timetable ID.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const timetable = faculty.dummyTimetable.id(timetableId);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found.",
      });
    }

    timetable.deleteOne();

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Timetable entry deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete timetable entry.");
  }
};

exports.bulkUpdateFaculty = async (req, res) => {
  try {
    const { facultyIds, updates } = req.body;

    if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "facultyIds must be a non-empty array.",
      });
    }
    if (!updates || typeof updates !== "object") {
      return res.status(400).json({
        success: false,
        message: "Updates object is required.",
      });
    }
    const invalidIds = facultyIds.filter((id) => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more faculty IDs are invalid.",
        invalidIds,
      });
    }
    const allowedFields = [
      "designation",
      "department",
      "qualification",
      "specialization",
      "experience",
      "employmentType",
      "status",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields were supplied for bulk update.",
      });
    }

    const result = await Faculty.updateMany(
      {
        _id: { $in: facultyIds },
        isDeleted: false,
      },
      {
        $set: updateData,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Faculty records updated successfully.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendError(res, error, "Failed to bulk update faculty.");
  }
};

exports.bulkDeleteFaculty = async (req, res) => {
  try {
    const { facultyIds } = req.body;

    if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "facultyIds must be a non-empty array.",
      });
    }

    const invalidIds = facultyIds.filter((id) => !isValidObjectId(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more faculty IDs are invalid.",
        invalidIds,
      });
    }

    const facultyRecords = await Faculty.find({
      _id: { $in: facultyIds },
    }).select("userId");

    const result = await Faculty.updateMany(
      {
        _id: { $in: facultyIds },
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          status: "inactive",
        },
      },
    );

    const userIds = facultyRecords.map((faculty) => faculty.userId);

    if (userIds.length > 0) {
      await User.updateMany(
        {
          _id: { $in: userIds },
        },
        {
          $set: {
            isActive: false,
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Faculty records deleted successfully.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendError(res, error, "Failed to bulk delete faculty.");
  }
};

// BULK ACTIVATE FACULTY
exports.bulkActivateFaculty = async (req, res) => {
  try {
    const { facultyIds } = req.body;

    if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "facultyIds must be a non-empty array.",
      });
    }
    const invalidIds = facultyIds.filter((id) => !isValidObjectId(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more faculty IDs are invalid.",
        invalidIds,
      });
    }
    const facultyRecords = await Faculty.find({
      _id: { $in: facultyIds },
    }).select("userId");
    const result = await Faculty.updateMany(
      {
        _id: { $in: facultyIds },
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          status: "active",
        },
      },
    );

    const userIds = facultyRecords.map((faculty) => faculty.userId);
    if (userIds.length > 0) {
      await User.updateMany(
        {
          _id: { $in: userIds },
        },
        {
          $set: {
            isActive: true,
            role: "faculty",
          },
        },
      );
    }
    return res.status(200).json({
      success: true,
      message: "Faculty records activated successfully.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendError(res, error, "Failed to bulk activate faculty.");
  }
};

// BULK DEACTIVATE FACULTY
exports.bulkDeactivateFaculty = async (req, res) => {
  try {
    const { facultyIds } = req.body;

    if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "facultyIds must be a non-empty array.",
      });
    }

    const invalidIds = facultyIds.filter((id) => !isValidObjectId(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more faculty IDs are invalid.",
        invalidIds,
      });
    }

    const facultyRecords = await Faculty.find({
      _id: { $in: facultyIds },
    }).select("userId");

    const result = await Faculty.updateMany(
      {
        _id: { $in: facultyIds },
      },
      {
        $set: {
          status: "inactive",
        },
      },
    );

    const userIds = facultyRecords.map((faculty) => faculty.userId);

    if (userIds.length > 0) {
      await User.updateMany(
        {
          _id: { $in: userIds },
        },
        {
          $set: {
            isActive: false,
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Faculty records deactivated successfully.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendError(res, error, "Failed to bulk deactivate faculty.");
  }
};

// BULK RESTORE FACULTY

exports.bulkRestoreFaculty = async (req, res) => {
  try {
    const { facultyIds } = req.body;

    if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "facultyIds must be a non-empty array.",
      });
    }

    const invalidIds = facultyIds.filter((id) => !isValidObjectId(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more faculty IDs are invalid.",
        invalidIds,
      });
    }

    const facultyRecords = await Faculty.find({
      _id: { $in: facultyIds },
    }).select("userId");

    const result = await Faculty.updateMany(
      {
        _id: { $in: facultyIds },
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          status: "active",
        },
      },
    );

    const userIds = facultyRecords.map((faculty) => faculty.userId);

    if (userIds.length > 0) {
      await User.updateMany(
        {
          _id: { $in: userIds },
        },
        {
          $set: {
            isActive: true,
            role: "faculty",
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Faculty records restored successfully.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendError(res, error, "Failed to bulk restore faculty.");
  }
};

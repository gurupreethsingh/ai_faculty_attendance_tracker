const express = require("express");

const router = express.Router();

const {
  getAllFaculty,
  getFacultyById,
  getFacultyByUserId,
  getMyFacultyProfile,

  createFaculty,
  updateFaculty,
  updateMyFacultyProfile,

  addSubject,
  removeSubject,

  addClass,
  removeClass,

  addDummyAttendance,
  getFacultyAttendance,

  getFacultyTimetable,

  deleteFaculty,
} = require("../controllers/FacultyController");

const { protect } = require("../middleware/authMiddleware");

// =====================================================
// FACULTY LIST
// =====================================================

router.get("/get-all-faculties", protect, getAllFaculty);

// =====================================================
// FACULTY BY ID
// =====================================================

router.get("/get-faculty-by-id/:id", protect, getFacultyById);

// =====================================================
// FACULTY BY USER ID
// =====================================================

router.get("/get-faculty-by-user-id/:userId", protect, getFacultyByUserId);

// =====================================================
// MY FACULTY PROFILE
// =====================================================

router.get("/get-my-faculty-profile", protect, getMyFacultyProfile);

// =====================================================
// CREATE FACULTY
// =====================================================

router.post("/create-faculty", protect, createFaculty);

// =====================================================
// UPDATE FACULTY
// =====================================================

router.put("/update-faculty/:id", protect, updateFaculty);

// =====================================================
// UPDATE MY FACULTY PROFILE
// =====================================================

router.put("/update-my-faculty-profile", protect, updateMyFacultyProfile);

// =====================================================
// SUBJECTS
// =====================================================

router.post("/add-subject/:id", protect, addSubject);

router.delete("/remove-subject/:id/:subject", protect, removeSubject);

// =====================================================
// CLASSES
// =====================================================

router.post("/add-class/:id", protect, addClass);

router.delete("/remove-class/:id/:className", protect, removeClass);

// =====================================================
// DUMMY ATTENDANCE
// =====================================================

router.post("/add-dummy-attendance/:id", protect, addDummyAttendance);

router.get("/get-faculty-attendance/:id", protect, getFacultyAttendance);

// =====================================================
// DUMMY TIMETABLE
// =====================================================

router.get("/get-faculty-timetable/:id", protect, getFacultyTimetable);

// =====================================================
// DELETE FACULTY
// =====================================================

router.delete("/delete-faculty/:id", protect, deleteFaculty);

module.exports = router;

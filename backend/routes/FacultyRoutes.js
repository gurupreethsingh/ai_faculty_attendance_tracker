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
  updateFacultyStatus,
  activateFaculty,
  deactivateFaculty,
  deleteFaculty,
  restoreFaculty,
  addSubject,
  updateSubject,
  removeSubject,
  addClass,
  updateClass,
  removeClass,
  addDummyAttendance,
  getFacultyAttendance,
  updateDummyAttendance,
  deleteDummyAttendance,
  getFacultyTimetable,
  addDummyTimetable,
  updateDummyTimetable,
  deleteDummyTimetable,
  bulkUpdateFaculty,
  bulkDeleteFaculty,
  bulkActivateFaculty,
  bulkDeactivateFaculty,
  bulkRestoreFaculty,
} = require("../controllers/FacultyController");

const { protect } = require("../middleware/authMiddleware");

router.get("/get-all-faculties", protect, getAllFaculty);
router.get("/get-faculty-by-id/:id", protect, getFacultyById);
router.get("/get-faculty-by-user-id/:userId", protect, getFacultyByUserId);
router.get("/get-my-faculty-profile", protect, getMyFacultyProfile);
router.post("/create-faculty", protect, createFaculty);
router.put("/update-faculty/:id", protect, updateFaculty);
router.put("/update-my-faculty-profile", protect, updateMyFacultyProfile);
router.put("/update-status/:id", protect, updateFacultyStatus);
router.put("/activate-faculty/:id", protect, activateFaculty);
router.put("/deactivate-faculty/:id", protect, deactivateFaculty);
router.delete("/delete-faculty/:id", protect, deleteFaculty);
router.put("/restore-faculty/:id", protect, restoreFaculty);
router.post("/add-subject/:id", protect, addSubject);
router.put("/update-subject/:id/:subjectCode", protect, updateSubject);
router.delete("/remove-subject/:id/:subject", protect, removeSubject);
router.post("/add-class/:id", protect, addClass);
router.put("/update-class/:id/:className", protect, updateClass);
router.delete("/remove-class/:id/:className", protect, removeClass);
router.post("/add-dummy-attendance/:id", protect, addDummyAttendance);
router.get("/get-faculty-attendance/:id", protect, getFacultyAttendance);
router.put(
  "/update-dummy-attendance/:id/:attendanceId",
  protect,
  updateDummyAttendance,
);

router.delete(
  "/delete-dummy-attendance/:id/:attendanceId",
  protect,
  deleteDummyAttendance,
);

router.get("/get-faculty-timetable/:id", protect, getFacultyTimetable);
router.post("/add-dummy-timetable/:id", protect, addDummyTimetable);
router.put(
  "/update-dummy-timetable/:id/:timetableId",
  protect,
  updateDummyTimetable,
);

router.delete(
  "/delete-dummy-timetable/:id/:timetableId",
  protect,
  deleteDummyTimetable,
);

router.put("/bulk-update", protect, bulkUpdateFaculty);
router.delete("/bulk-delete", protect, bulkDeleteFaculty);
router.put("/bulk-activate", protect, bulkActivateFaculty);
router.put("/bulk-deactivate", protect, bulkDeactivateFaculty);
router.put("/bulk-restore", protect, bulkRestoreFaculty);

module.exports = router;

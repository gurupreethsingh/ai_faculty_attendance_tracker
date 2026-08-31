const express = require("express");

const router = express.Router();

const {
  createTimetable,
  getTimetableById,
  getFacultyTimetable,
  getAllTimetables,
  updateTimetable,
  deleteTimetable,
  restoreTimetable,
  permanentlyDeleteTimetable,
  getDaySchedule,
  getWeeklySchedule,
  getTimetableStatistics,
  getTimetableOptions,
  addEntry,
  updateEntry,
  deleteEntry,
  clearEntries,
  replaceEntries,
  bulkCreateTimetables,
  bulkUpdateTimetables,
  bulkDeleteTimetables,
  bulkRestoreTimetables,
  cloneTimetable,
  checkConflicts,
  getFacultyTimetableByUser,
  getMyTimetable,
  updateMyTimetable,
  getFacultyAssignedData,
  getSubjectSchedule,
  getClassSchedule,
  getRoomSchedule,
} = require("../controllers/TimeTableController");

const { protect } = require("../middleware/AuthMiddleware");

router.post("/create-timetable", protect, createTimetable);

router.get("/get-all-timetables", protect, getAllTimetables);
router.get("/get-timetable-by-id/:id", protect, getTimetableById);
router.get("/get-faculty-timetable/:facultyId", protect, getFacultyTimetable);
router.get("/get-day-schedule/:facultyId/:day", protect, getDaySchedule);
router.get("/get-weekly-schedule/:facultyId", protect, getWeeklySchedule);

router.get(
  "/get-timetable-statistics/:facultyId",
  protect,
  getTimetableStatistics,
);

router.get("/get-timetable-options/:facultyId", protect, getTimetableOptions);
router.put("/update-timetable/:id", protect, updateTimetable);
router.delete("/delete-timetable/:id", protect, deleteTimetable);
router.patch("/restore-timetable/:id", protect, restoreTimetable);

router.delete(
  "/permanently-delete-timetable/:id",
  protect,
  permanentlyDeleteTimetable,
);

router.post("/add-entry/:id", protect, addEntry);
router.put("/update-entry/:id/:entryId", protect, updateEntry);
router.delete("/delete-entry/:id/:entryId", protect, deleteEntry);
router.delete("/clear-entries/:id", protect, clearEntries);
router.put("/replace-entries/:id", protect, replaceEntries);
router.post("/bulk-create-timetables", protect, bulkCreateTimetables);
router.put("/bulk-update-timetables", protect, bulkUpdateTimetables);
router.delete("/bulk-delete-timetables", protect, bulkDeleteTimetables);

router.patch("/bulk-restore-timetables", protect, bulkRestoreTimetables);
router.post("/clone-timetable/:id", protect, cloneTimetable);
router.post("/check-timetable-conflicts", protect, checkConflicts);

router.get(
  "/get-faculty-timetable-by-user/:userId",
  protect,
  getFacultyTimetableByUser,
);

router.get("/get-my-timetable", protect, getMyTimetable);
router.put("/update-my-timetable", protect, updateMyTimetable);
router.get(
  "/get-faculty-assigned-data/:facultyId",
  protect,
  getFacultyAssignedData,
);

router.get("/get-subject-schedule/:subjectCode", protect, getSubjectSchedule);
router.get("/get-class-schedule/:className", protect, getClassSchedule);
router.get("/get-room-schedule/:roomNo", protect, getRoomSchedule);

module.exports = router;

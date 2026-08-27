const mongoose = require("mongoose");

// SUBJECT SCHEMA

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },

    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// ATTENDANCE SCHEMA
// TEMPORARY
// WILL MOVE TO AttendanceModel.js

const dummyAttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },

    subjectCode: {
      type: String,
      default: "",
      trim: true,
    },

    subjectName: {
      type: String,
      default: "",
      trim: true,
    },

    className: {
      type: String,
      default: "",
      trim: true,
    },

    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    presentStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    absentStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["taken", "not_taken", "cancelled"],
      default: "taken",
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    rescheduleRequired: {
      type: Boolean,
      default: false,
    },

    rescheduleDate: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  },
);

// TIMETABLE SCHEMA
// TEMPORARY
// WILL MOVE TO TimeTableModel.js

const dummyTimetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      default: "",
      trim: true,
    },

    startTime: {
      type: String,
      default: "",
      trim: true,
    },

    endTime: {
      type: String,
      default: "",
      trim: true,
    },

    subjectCode: {
      type: String,
      default: "",
      trim: true,
    },

    subjectName: {
      type: String,
      default: "",
      trim: true,
    },

    className: {
      type: String,
      default: "",
      trim: true,
    },

    room: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  },
);

// FACULTY SCHEMA

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // FACULTY IDENTIFICATION

    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      index: true,
    },

    // PROFESSIONAL INFORMATION

    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    qualification: {
      type: String,
      default: "",
      trim: true,
    },

    specialization: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    // EMPLOYMENT INFORMATION

    joiningDate: {
      type: Date,
      default: null,
    },

    employmentType: {
      type: String,
      enum: ["", "Permanent", "Contract", "Guest", "Visiting", "Part Time"],
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on_leave", "retired"],
      default: "active",
      index: true,
    },

    // SOFT DELETE

    /*
     * We preserve the Faculty document instead of
     * physically deleting it.
     *
     * This protects historical data.
     */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // SUBJECTS

    subjects: {
      type: [subjectSchema],
      default: [],
    },

    // CLASSES

    classes: {
      type: [String],
      default: [],
    },

    // TEMPORARY ATTENDANCE

    dummyAttendance: {
      type: [dummyAttendanceSchema],
      default: [],
    },

    // TEMPORARY TIMETABLE

    dummyTimetable: {
      type: [dummyTimetableSchema],
      default: [],
    },
  },

  {
    timestamps: true,
  },
);

// EXPORT

module.exports =
  mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);

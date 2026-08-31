const mongoose = require("mongoose");

const timetableEntrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      trim: true,
    },

    period: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    slotType: {
      type: String,
      enum: [
        "subject",
        "lab",
        "break",
        "short-break",
        "lunch",
        "sports",
        "library",
        "activity",
        "doubt-session",
        "cultural",
        "outdoor-activity",
        "indoor-activity",
        "free",
        "other",
      ],
      default: "subject",
      trim: true,
    },

    subjectCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
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

    program: {
      type: String,
      default: "",
      trim: true,
    },

    branch: {
      type: String,
      default: "",
      trim: true,
    },

    semester: {
      type: String,
      default: "",
      trim: true,
    },

    section: {
      type: String,
      default: "",
      trim: true,
    },

    roomNo: {
      type: String,
      default: "",
      trim: true,
    },

    sessionType: {
      type: String,
      enum: ["theory", "lab", "activity", "other"],
      default: "theory",
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

const timetableSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    facultyName: {
      type: String,
      default: "",
      trim: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    issueDate: {
      type: Date,
      default: null,
    },

    effectiveFrom: {
      type: Date,
      default: null,
    },

    revisionNumber: {
      type: String,
      default: "1.0",
      trim: true,
    },

    program: {
      type: String,
      default: "",
      trim: true,
    },

    branch: {
      type: String,
      default: "",
      trim: true,
    },

    semester: {
      type: String,
      default: "",
      trim: true,
    },

    roomNo: {
      type: String,
      default: "",
      trim: true,
    },

    classCoordinator: {
      type: String,
      default: "",
      trim: true,
    },

    institutionName: {
      type: String,
      default: "COLLEGE OF ENGINEERING & COMPUTER APPLICATION(CECA)",
      trim: true,
    },

    timetableTitle: {
      type: String,
      default: "Time Table",
      trim: true,
    },

    lunchStartTime: {
      type: String,
      default: "12:30PM",
      trim: true,
    },

    lunchEndTime: {
      type: String,
      default: "1:20PM",
      trim: true,
    },

    periods: {
      type: [
        {
          period: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
          },

          startTime: {
            type: String,
            required: true,
            trim: true,
          },

          endTime: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },

    entries: {
      type: [timetableEntrySchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

timetableSchema.index(
  {
    facultyId: 1,
    academicYear: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

timetableSchema.index({
  facultyId: 1,
  academicYear: 1,
  "entries.day": 1,
  "entries.period": 1,
});

module.exports =
  mongoose.models.TimeTable || mongoose.model("TimeTable", timetableSchema);

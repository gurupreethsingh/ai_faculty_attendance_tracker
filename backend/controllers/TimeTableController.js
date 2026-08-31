const mongoose = require("mongoose");

const TimeTable = require("../models/TimeTableModel");
const Faculty = require("../models/FacultyModel");

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SLOT_TYPES = [
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
];

const SESSION_TYPES = ["theory", "lab", "activity", "other"];

const STATUSES = ["draft", "active", "inactive"];

const SPECIAL_SLOT_LABELS = {
  break: "Break",
  "short-break": "Short Break",
  lunch: "Lunch Break",
  sports: "Sports",
  library: "Library",
  activity: "Activity",
  "doubt-session": "Doubt Session",
  cultural: "Cultural Club Activity",
  "outdoor-activity": "Outdoor Activity",
  "indoor-activity": "Indoor Activity",
  free: "Free Period",
  other: "Other",
};

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const normalize = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeLower = (value) => {
  return normalize(value).toLowerCase();
};

const getLoggedInUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.auth?.userId ||
    null
  );
};

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "yes", "y"].includes(String(value).trim().toLowerCase());
};

const toNumber = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : defaultValue;
};

const parseArray = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalize(item)).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => normalize(item))
    .filter(Boolean);
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getFacultyName = (faculty) => {
  if (!faculty) {
    return "";
  }

  let name =
    faculty.facultyName ||
    faculty.fullName ||
    faculty.name ||
    faculty.employeeName ||
    "";

  if (faculty.userId && typeof faculty.userId === "object") {
    name = faculty.userId.fullName || faculty.userId.name || name;
  }

  return normalize(name);
};

const getFacultyUserId = (faculty) => {
  if (!faculty || !faculty.userId) {
    return null;
  }

  if (typeof faculty.userId === "object" && faculty.userId._id) {
    return faculty.userId._id;
  }

  return faculty.userId;
};

const getAssignedSubjectMap = (faculty) => {
  const map = new Map();

  const subjects = Array.isArray(faculty?.subjects) ? faculty.subjects : [];

  subjects.forEach((subject) => {
    if (!subject) {
      return;
    }

    if (typeof subject === "string") {
      const code = normalize(subject);

      if (code) {
        map.set(code.toLowerCase(), {
          subjectCode: code,
          subjectName: "",
        });
      }

      return;
    }

    const subjectCode = normalize(
      subject.subjectCode ||
        subject.code ||
        subject.courseCode ||
        subject.course_code,
    );

    const subjectName = normalize(
      subject.subjectName || subject.name || subject.title || "",
    );

    if (subjectCode) {
      map.set(subjectCode.toLowerCase(), {
        subjectCode,
        subjectName,
      });
    }
  });

  return map;
};

const getAssignedClassSet = (faculty) => {
  const set = new Set();

  const classes = Array.isArray(faculty?.classes) ? faculty.classes : [];

  classes.forEach((item) => {
    if (!item) {
      return;
    }

    if (typeof item === "string") {
      const value = normalizeLower(item);

      if (value) {
        set.add(value);
      }

      return;
    }

    const className = normalize(
      item.className || item.name || item.class || item.class_name || "",
    );

    if (className) {
      set.add(className.toLowerCase());
    }
  });

  return set;
};

const validatePeriods = (periods) => {
  if (!Array.isArray(periods)) {
    return {
      valid: false,
      message: "Periods must be an array.",
    };
  }

  const periodNumbers = new Set();

  for (const item of periods) {
    if (!item) {
      return {
        valid: false,
        message: "Invalid period configuration.",
      };
    }

    const period = Number(item.period);

    if (!Number.isInteger(period) || period < 1 || period > 10) {
      return {
        valid: false,
        message: `Invalid period number: ${item.period}.`,
      };
    }

    if (periodNumbers.has(period)) {
      return {
        valid: false,
        message: `Duplicate period configuration: Period ${period}.`,
      };
    }

    periodNumbers.add(period);

    const startTime = normalize(item.startTime);
    const endTime = normalize(item.endTime);

    if (!startTime || !endTime) {
      return {
        valid: false,
        message: `Start time and end time are required for Period ${period}.`,
      };
    }
  }

  return {
    valid: true,
  };
};

const validateEntries = (entries, faculty) => {
  if (!Array.isArray(entries)) {
    return {
      valid: false,
      message: "Entries must be an array.",
    };
  }

  const assignedSubjects = getAssignedSubjectMap(faculty);
  const assignedClasses = getAssignedClassSet(faculty);

  const usedPeriods = new Set();
  const normalizedEntries = [];

  for (const rawEntry of entries) {
    if (!rawEntry) {
      continue;
    }

    const day = normalize(rawEntry.day);

    if (!DAYS.includes(day)) {
      return {
        valid: false,
        message: `Invalid day: ${day}.`,
      };
    }

    const period = Number(rawEntry.period);

    if (!Number.isInteger(period) || period < 1 || period > 10) {
      return {
        valid: false,
        message: `${day}: Invalid period ${rawEntry.period}.`,
      };
    }

    const periodKey = `${day}-${period}`;

    if (usedPeriods.has(periodKey)) {
      return {
        valid: false,
        message: `Duplicate timetable entry found for ${day}, Period ${period}.`,
      };
    }

    usedPeriods.add(periodKey);

    const startTime = normalize(rawEntry.startTime);
    const endTime = normalize(rawEntry.endTime);

    if (!startTime || !endTime) {
      return {
        valid: false,
        message: `${day}, Period ${period}: Start time and end time are required.`,
      };
    }

    const slotType = normalize(rawEntry.slotType || "subject");

    if (!SLOT_TYPES.includes(slotType)) {
      return {
        valid: false,
        message: `${day}, Period ${period}: Invalid slot type ${slotType}.`,
      };
    }

    let subjectCode = normalize(rawEntry.subjectCode).toUpperCase();

    let subjectName = normalize(rawEntry.subjectName);

    let className = normalize(rawEntry.className);

    const program = normalize(rawEntry.program);

    const branch = normalize(rawEntry.branch);

    const semester = normalize(rawEntry.semester);

    const section = normalize(rawEntry.section);

    const roomNo = normalize(rawEntry.roomNo);

    const remarks = normalize(rawEntry.remarks);

    let sessionType = normalize(rawEntry.sessionType);

    if (!sessionType) {
      if (slotType === "lab") {
        sessionType = "lab";
      } else if (slotType === "activity") {
        sessionType = "activity";
      } else if (slotType === "subject") {
        sessionType = "theory";
      } else {
        sessionType = "other";
      }
    }

    if (!SESSION_TYPES.includes(sessionType)) {
      return {
        valid: false,
        message: `${day}, Period ${period}: Invalid session type.`,
      };
    }

    const specialSlot = slotType !== "subject" && slotType !== "lab";

    if (specialSlot) {
      subjectCode = "";

      if (!subjectName) {
        subjectName = SPECIAL_SLOT_LABELS[slotType] || "Other";
      }

      if (slotType !== "activity" && slotType !== "lab") {
        className = "";
      }
    }

    if (slotType === "subject" || slotType === "lab") {
      if (!subjectCode) {
        return {
          valid: false,
          message: `${day}, Period ${period}: Subject code is required.`,
        };
      }

      if (!subjectName) {
        const assignedSubject = assignedSubjects.get(subjectCode.toLowerCase());

        if (assignedSubject?.subjectName) {
          subjectName = assignedSubject.subjectName;
        } else {
          return {
            valid: false,
            message: `${day}, Period ${period}: Subject name is required.`,
          };
        }
      }

      if (
        assignedSubjects.size > 0 &&
        !assignedSubjects.has(subjectCode.toLowerCase())
      ) {
        return {
          valid: false,
          message: `${subjectCode} is not assigned to this faculty.`,
        };
      }

      if (!className) {
        return {
          valid: false,
          message: `${day}, Period ${period}: Class is required.`,
        };
      }

      if (
        assignedClasses.size > 0 &&
        !assignedClasses.has(className.toLowerCase())
      ) {
        return {
          valid: false,
          message: `${className} is not assigned to this faculty.`,
        };
      }
    }

    normalizedEntries.push({
      ...(rawEntry._id ? { _id: rawEntry._id } : {}),
      day,
      period,
      startTime,
      endTime,
      slotType,
      subjectCode,
      subjectName,
      className,
      program,
      branch,
      semester,
      section,
      roomNo,
      sessionType,
      remarks,
    });
  }

  return {
    valid: true,
    entries: normalizedEntries,
  };
};

const populateTimetable = (query) => {
  return query
    .populate({
      path: "facultyId",
    })
    .populate({
      path: "userId",
      select: "fullName name email phone role",
    })
    .populate({
      path: "createdBy",
      select: "fullName name email role",
    })
    .populate({
      path: "updatedBy",
      select: "fullName name email role",
    });
};

const getSortObject = (sortBy, sortOrder) => {
  const allowedSortFields = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    academicYear: "academicYear",
    facultyName: "facultyName",
    program: "program",
    branch: "branch",
    semester: "semester",
    status: "status",
    issueDate: "issueDate",
    effectiveFrom: "effectiveFrom",
  };

  const field = allowedSortFields[sortBy] || "createdAt";

  const order = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

  return {
    [field]: order,
  };
};

const buildTimetableFilter = (query) => {
  const filter = {};

  const includeDeleted = toBoolean(query.includeDeleted, false);

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  const facultyId = normalize(query.facultyId);

  if (facultyId) {
    if (isValidObjectId(facultyId)) {
      filter.facultyId = facultyId;
    }
  }

  const userId = normalize(query.userId);

  if (userId) {
    if (isValidObjectId(userId)) {
      filter.userId = userId;
    }
  }

  const academicYear = normalize(query.academicYear);

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  const program = normalize(query.program);

  if (program) {
    filter.program = new RegExp(`^${escapeRegex(program)}$`, "i");
  }

  const branch = normalize(query.branch);

  if (branch) {
    filter.branch = new RegExp(`^${escapeRegex(branch)}$`, "i");
  }

  const semester = normalize(query.semester);

  if (semester) {
    filter.semester = new RegExp(`^${escapeRegex(semester)}$`, "i");
  }

  const section = normalize(query.section);

  if (section) {
    filter["entries.section"] = new RegExp(`^${escapeRegex(section)}$`, "i");
  }

  const roomNo = normalize(query.roomNo || query.room);

  if (roomNo) {
    filter.$or = [
      {
        roomNo: new RegExp(escapeRegex(roomNo), "i"),
      },
      {
        "entries.roomNo": new RegExp(escapeRegex(roomNo), "i"),
      },
    ];
  }

  const status = normalize(query.status);

  if (status && STATUSES.includes(status)) {
    filter.status = status;
  }

  const search = normalize(query.search);

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    const searchConditions = [
      { facultyName: regex },
      { academicYear: regex },
      { program: regex },
      { branch: regex },
      { semester: regex },
      { classCoordinator: regex },
      { institutionName: regex },
      { "entries.subjectCode": regex },
      { "entries.subjectName": regex },
      { "entries.className": regex },
      { "entries.roomNo": regex },
      { "entries.program": regex },
      { "entries.branch": regex },
      { "entries.semester": regex },
      { "entries.section": regex },
    ];

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];

      delete filter.$or;
    } else {
      filter.$or = searchConditions;
    }
  }

  const day = normalize(query.day);

  if (day && DAYS.includes(day)) {
    filter["entries.day"] = day;
  }

  const days = parseArray(query.days).filter((item) => DAYS.includes(item));

  if (days.length > 0) {
    filter["entries.day"] = {
      $in: days,
    };
  }

  const subjectCode = normalize(query.subjectCode).toUpperCase();

  if (subjectCode) {
    filter["entries.subjectCode"] = subjectCode;
  }

  const subjectCodes = parseArray(query.subjectCodes).map((item) =>
    item.toUpperCase(),
  );

  if (subjectCodes.length > 0) {
    filter["entries.subjectCode"] = {
      $in: subjectCodes,
    };
  }

  const subjectName = normalize(query.subjectName);

  if (subjectName) {
    filter["entries.subjectName"] = new RegExp(escapeRegex(subjectName), "i");
  }

  const className = normalize(query.className || query.class);

  if (className) {
    filter["entries.className"] = new RegExp(
      `^${escapeRegex(className)}$`,
      "i",
    );
  }

  const slotType = normalize(query.slotType);

  if (slotType && SLOT_TYPES.includes(slotType)) {
    filter["entries.slotType"] = slotType;
  }

  const sessionType = normalize(query.sessionType);

  if (sessionType && SESSION_TYPES.includes(sessionType)) {
    filter["entries.sessionType"] = sessionType;
  }

  const period = toNumber(query.period);

  if (Number.isInteger(period) && period >= 1 && period <= 10) {
    filter["entries.period"] = period;
  }

  const minPeriod = toNumber(query.minPeriod);

  const maxPeriod = toNumber(query.maxPeriod);

  if (minPeriod !== null || maxPeriod !== null) {
    filter["entries.period"] = {};

    if (minPeriod !== null) {
      filter["entries.period"].$gte = minPeriod;
    }

    if (maxPeriod !== null) {
      filter["entries.period"].$lte = maxPeriod;
    }
  }

  const issueDateFrom = parseDate(query.issueDateFrom);

  const issueDateTo = parseDate(query.issueDateTo);

  if (issueDateFrom || issueDateTo) {
    filter.issueDate = {};

    if (issueDateFrom) {
      filter.issueDate.$gte = issueDateFrom;
    }

    if (issueDateTo) {
      filter.issueDate.$lte = issueDateTo;
    }
  }

  const effectiveFrom = parseDate(query.effectiveFrom);

  if (effectiveFrom) {
    filter.effectiveFrom = {
      $gte: effectiveFrom,
    };
  }

  const createdFrom = parseDate(query.createdFrom);

  const createdTo = parseDate(query.createdTo);

  if (createdFrom || createdTo) {
    filter.createdAt = {};

    if (createdFrom) {
      filter.createdAt.$gte = createdFrom;
    }

    if (createdTo) {
      filter.createdAt.$lte = createdTo;
    }
  }

  return filter;
};

const applyEntryFilters = (entries, query) => {
  let result = Array.isArray(entries) ? [...entries] : [];

  const day = normalize(query.day);

  if (day && DAYS.includes(day)) {
    result = result.filter((entry) => entry.day === day);
  }

  const days = parseArray(query.days).filter((item) => DAYS.includes(item));

  if (days.length > 0) {
    result = result.filter((entry) => days.includes(entry.day));
  }

  const period = toNumber(query.period);

  if (Number.isInteger(period)) {
    result = result.filter((entry) => entry.period === period);
  }

  const minPeriod = toNumber(query.minPeriod);

  if (minPeriod !== null) {
    result = result.filter((entry) => entry.period >= minPeriod);
  }

  const maxPeriod = toNumber(query.maxPeriod);

  if (maxPeriod !== null) {
    result = result.filter((entry) => entry.period <= maxPeriod);
  }

  const subjectCode = normalize(query.subjectCode).toUpperCase();

  if (subjectCode) {
    result = result.filter(
      (entry) =>
        normalizeLower(entry.subjectCode) === subjectCode.toLowerCase(),
    );
  }

  const subjectName = normalize(query.subjectName);

  if (subjectName) {
    result = result.filter((entry) =>
      normalizeLower(entry.subjectName).includes(subjectName.toLowerCase()),
    );
  }

  const className = normalize(query.className || query.class);

  if (className) {
    result = result.filter(
      (entry) => normalizeLower(entry.className) === className.toLowerCase(),
    );
  }

  const slotType = normalize(query.slotType);

  if (slotType) {
    result = result.filter((entry) => entry.slotType === slotType);
  }

  const sessionType = normalize(query.sessionType);

  if (sessionType) {
    result = result.filter((entry) => entry.sessionType === sessionType);
  }

  const roomNo = normalize(query.roomNo || query.room);

  if (roomNo) {
    result = result.filter((entry) =>
      normalizeLower(entry.roomNo).includes(roomNo.toLowerCase()),
    );
  }

  const section = normalize(query.section);

  if (section) {
    result = result.filter(
      (entry) => normalizeLower(entry.section) === section.toLowerCase(),
    );
  }

  return result;
};

const sortEntries = (entries, sortBy = "period", sortOrder = "asc") => {
  const result = [...entries];

  const order = String(sortOrder).toLowerCase() === "desc" ? -1 : 1;

  const dayOrder = new Map(DAYS.map((day, index) => [day, index]));

  result.sort((a, b) => {
    if (sortBy === "day") {
      return (
        ((dayOrder.get(a.day) ?? 99) - (dayOrder.get(b.day) ?? 99)) * order
      );
    }

    if (sortBy === "subjectCode") {
      return (
        normalizeLower(a.subjectCode).localeCompare(
          normalizeLower(b.subjectCode),
        ) * order
      );
    }

    if (sortBy === "subjectName") {
      return (
        normalizeLower(a.subjectName).localeCompare(
          normalizeLower(b.subjectName),
        ) * order
      );
    }

    if (sortBy === "className") {
      return (
        normalizeLower(a.className).localeCompare(normalizeLower(b.className)) *
        order
      );
    }

    return (Number(a.period) - Number(b.period)) * order;
  });

  return result;
};

const buildDayWiseSchedule = (entries) => {
  const schedule = {};

  DAYS.forEach((day) => {
    schedule[day] = [];
  });

  entries.forEach((entry) => {
    if (schedule[entry.day]) {
      schedule[entry.day].push(entry);
    }
  });

  DAYS.forEach((day) => {
    schedule[day].sort((a, b) => a.period - b.period);
  });

  return schedule;
};

const getEntryStatistics = (entries) => {
  const statistics = {
    totalEntries: entries.length,
    subjectEntries: 0,
    labEntries: 0,
    specialEntries: 0,
    theoryEntries: 0,
    activityEntries: 0,
    otherEntries: 0,
    byDay: {},
    byPeriod: {},
    bySubject: {},
    byClass: {},
    byRoom: {},
    bySlotType: {},
    bySessionType: {},
  };

  DAYS.forEach((day) => {
    statistics.byDay[day] = 0;
  });

  for (let period = 1; period <= 10; period += 1) {
    statistics.byPeriod[period] = 0;
  }

  entries.forEach((entry) => {
    if (entry.slotType === "subject") {
      statistics.subjectEntries += 1;
    }

    if (entry.slotType === "lab") {
      statistics.labEntries += 1;
    }

    if (entry.slotType !== "subject" && entry.slotType !== "lab") {
      statistics.specialEntries += 1;
    }

    if (entry.sessionType === "theory") {
      statistics.theoryEntries += 1;
    }

    if (entry.sessionType === "activity") {
      statistics.activityEntries += 1;
    }

    if (entry.sessionType === "other") {
      statistics.otherEntries += 1;
    }

    if (statistics.byDay[entry.day] !== undefined) {
      statistics.byDay[entry.day] += 1;
    }

    if (statistics.byPeriod[entry.period] !== undefined) {
      statistics.byPeriod[entry.period] += 1;
    }

    if (entry.subjectCode) {
      const key = entry.subjectCode;

      if (!statistics.bySubject[key]) {
        statistics.bySubject[key] = {
          subjectCode: entry.subjectCode,
          subjectName: entry.subjectName,
          count: 0,
        };
      }

      statistics.bySubject[key].count += 1;
    }

    if (entry.className) {
      const key = entry.className;

      statistics.byClass[key] = (statistics.byClass[key] || 0) + 1;
    }

    if (entry.roomNo) {
      const key = entry.roomNo;

      statistics.byRoom[key] = (statistics.byRoom[key] || 0) + 1;
    }

    statistics.bySlotType[entry.slotType] =
      (statistics.bySlotType[entry.slotType] || 0) + 1;

    statistics.bySessionType[entry.sessionType] =
      (statistics.bySessionType[entry.sessionType] || 0) + 1;
  });

  return statistics;
};

exports.createTimetable = async (req, res) => {
  try {
    const {
      facultyId,
      userId,
      facultyName,
      academicYear,
      issueDate,
      effectiveFrom,
      revisionNumber,
      program,
      branch,
      semester,
      roomNo,
      classCoordinator,
      institutionName,
      timetableTitle,
      lunchStartTime,
      lunchEndTime,
      periods,
      entries,
      status,
    } = req.body;

    if (!facultyId || !isValidObjectId(facultyId)) {
      return res.status(400).json({
        success: false,
        message: "Valid faculty ID is required.",
      });
    }

    const faculty = await Faculty.findOne({
      _id: facultyId,
      isDeleted: false,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const normalizedAcademicYear = normalize(academicYear);

    if (!normalizedAcademicYear) {
      return res.status(400).json({
        success: false,
        message: "Academic year is required.",
      });
    }

    const existing = await TimeTable.findOne({
      facultyId,
      academicYear: normalizedAcademicYear,
      isDeleted: false,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "A timetable already exists for this faculty and academic year.",
        timetableId: existing._id,
      });
    }

    const periodValidation = validatePeriods(
      Array.isArray(periods) ? periods : [],
    );

    if (!periodValidation.valid) {
      return res.status(400).json({
        success: false,
        message: periodValidation.message,
      });
    }

    const entryValidation = validateEntries(
      Array.isArray(entries) ? entries : [],
      faculty,
    );

    if (!entryValidation.valid) {
      return res.status(400).json({
        success: false,
        message: entryValidation.message,
      });
    }

    const loggedInUserId = getLoggedInUserId(req);

    const facultyUserId = getFacultyUserId(faculty);

    const finalUserId =
      userId && isValidObjectId(userId) ? userId : facultyUserId;

    if (!finalUserId) {
      return res.status(400).json({
        success: false,
        message: "Faculty user ID could not be determined.",
      });
    }

    const timetable = await TimeTable.create({
      facultyId: faculty._id,

      userId: finalUserId,

      facultyName: normalize(facultyName) || getFacultyName(faculty),

      academicYear: normalizedAcademicYear,

      issueDate: parseDate(issueDate),

      effectiveFrom: parseDate(effectiveFrom),

      revisionNumber: normalize(revisionNumber) || "1.0",

      program: normalize(program),

      branch: normalize(branch),

      semester: normalize(semester),

      roomNo: normalize(roomNo),

      classCoordinator: normalize(classCoordinator),

      institutionName:
        normalize(institutionName) ||
        "COLLEGE OF ENGINEERING & COMPUTER APPLICATION(CECA)",

      timetableTitle: normalize(timetableTitle) || "Time Table",

      lunchStartTime: normalize(lunchStartTime) || "12:30PM",

      lunchEndTime: normalize(lunchEndTime) || "1:20PM",

      periods: periods || [],

      entries: entryValidation.entries,

      status: STATUSES.includes(status) ? status : "draft",

      isDeleted: false,

      deletedAt: null,

      createdBy: loggedInUserId,

      updatedBy: loggedInUserId,
    });

    const populated = await populateTimetable(
      TimeTable.findById(timetable._id),
    ).lean();

    return res.status(201).json({
      success: true,
      message: "Faculty timetable created successfully.",
      timetable: populated,
      data: populated,
    });
  } catch (error) {
    console.error("CREATE TIMETABLE ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A timetable already exists for this faculty and academic year.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create timetable.",
      error: error.message,
    });
  }
};

exports.getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    const timetable = await populateTimetable(
      TimeTable.findOne({
        _id: id,
        isDeleted: false,
      }),
    ).lean();

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    return res.status(200).json({
      success: true,
      timetable,
      data: timetable,
    });
  } catch (error) {
    console.error("GET TIMETABLE BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load timetable.",
      error: error.message,
    });
  }
};

exports.getFacultyTimetable = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const { academicYear = "2026-2027" } = req.query;

    if (!isValidObjectId(facultyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const timetable = await populateTimetable(
      TimeTable.findOne({
        facultyId,
        academicYear: normalize(academicYear),
        isDeleted: false,
      }),
    ).lean();

    if (!timetable) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "No timetable found for this faculty.",
        timetable: null,
        entries: [],
        schedule: buildDayWiseSchedule([]),
      });
    }

    const filteredEntries = applyEntryFilters(timetable.entries, req.query);

    const sortedEntries = sortEntries(
      filteredEntries,
      req.query.entrySortBy || "period",
      req.query.entrySortOrder || "asc",
    );

    return res.status(200).json({
      success: true,
      exists: true,
      timetable: {
        ...timetable,
        entries: sortedEntries,
      },
      entries: sortedEntries,
      schedule: buildDayWiseSchedule(sortedEntries),
      statistics: getEntryStatistics(sortedEntries),
    });
  } catch (error) {
    console.error("GET FACULTY TIMETABLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load faculty timetable.",
      error: error.message,
    });
  }
};

exports.getAllTimetables = async (req, res) => {
  try {
    const page = Math.max(toNumber(req.query.page, 1), 1);

    const limit = Math.min(Math.max(toNumber(req.query.limit, 20), 1), 100);

    const skip = (page - 1) * limit;

    const filter = buildTimetableFilter(req.query);

    const sort = getSortObject(req.query.sortBy, req.query.sortOrder);

    const [timetables, total] = await Promise.all([
      populateTimetable(
        TimeTable.find(filter).sort(sort).skip(skip).limit(limit),
      ).lean(),

      TimeTable.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      timetables,
      data: timetables,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPreviousPage: page > 1,
      },
      filters: req.query,
    });
  } catch (error) {
    console.error("GET ALL TIMETABLES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load timetables.",
      error: error.message,
    });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    const requestedFacultyId =
      req.body.facultyId !== undefined
        ? req.body.facultyId
        : timetable.facultyId;

    if (!isValidObjectId(requestedFacultyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findOne({
      _id: requestedFacultyId,
      isDeleted: false,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const academicYear =
      req.body.academicYear !== undefined
        ? normalize(req.body.academicYear)
        : timetable.academicYear;

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: "Academic year is required.",
      });
    }

    const duplicate = await TimeTable.findOne({
      _id: {
        $ne: timetable._id,
      },
      facultyId: faculty._id,
      academicYear,
      isDeleted: false,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "An active timetable already exists for this faculty and academic year.",
        existingTimetableId: duplicate._id,
      });
    }

    let validatedPeriods = timetable.periods || [];

    if (req.body.periods !== undefined) {
      if (!Array.isArray(req.body.periods)) {
        return res.status(400).json({
          success: false,
          message: "Periods must be an array.",
        });
      }

      const periodValidation = validatePeriods(req.body.periods);

      if (!periodValidation.valid) {
        return res.status(400).json({
          success: false,
          message: periodValidation.message,
        });
      }

      validatedPeriods = req.body.periods;
    }

    let validatedEntries = timetable.entries || [];

    if (req.body.entries !== undefined) {
      if (!Array.isArray(req.body.entries)) {
        return res.status(400).json({
          success: false,
          message: "Entries must be an array.",
        });
      }

      const entryValidation = validateEntries(req.body.entries, faculty);

      if (!entryValidation.valid) {
        return res.status(400).json({
          success: false,
          message: entryValidation.message,
        });
      }

      validatedEntries = entryValidation.entries;
    }

    timetable.facultyId = faculty._id;
    timetable.userId = getFacultyUserId(faculty);
    timetable.facultyName = getFacultyName(faculty);
    timetable.academicYear = academicYear;

    if (req.body.periods !== undefined) {
      timetable.periods = validatedPeriods;
    }

    if (req.body.entries !== undefined) {
      timetable.entries = validatedEntries;
    }

    const stringFields = [
      "program",
      "branch",
      "semester",
      "roomNo",
      "classCoordinator",
      "institutionName",
      "timetableTitle",
      "lunchStartTime",
      "lunchEndTime",
    ];

    stringFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        timetable[field] = normalize(req.body[field]);
      }
    });

    if (req.body.issueDate !== undefined) {
      const parsedIssueDate = parseDate(req.body.issueDate);

      if (
        req.body.issueDate !== null &&
        req.body.issueDate !== "" &&
        !parsedIssueDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid issue date.",
        });
      }

      timetable.issueDate = parsedIssueDate;
    }

    if (req.body.effectiveFrom !== undefined) {
      const parsedEffectiveFrom = parseDate(req.body.effectiveFrom);

      if (
        req.body.effectiveFrom !== null &&
        req.body.effectiveFrom !== "" &&
        !parsedEffectiveFrom
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid effective from date.",
        });
      }

      timetable.effectiveFrom = parsedEffectiveFrom;
    }

    // 13. REVISION NUMBER

    if (req.body.revisionNumber !== undefined) {
      const revisionNumber = Number(req.body.revisionNumber);

      if (!Number.isFinite(revisionNumber) || revisionNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Revision number must be a valid non-negative number.",
        });
      }

      timetable.revisionNumber = revisionNumber;
    }

    // 14. STATUS

    if (req.body.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable status.",
          allowedStatuses: STATUSES,
        });
      }

      timetable.status = req.body.status;
    }
    timetable.isDeleted = false;
    timetable.deletedAt = null;
    const loggedInUserId = getLoggedInUserId(req);
    if (loggedInUserId) {
      timetable.updatedBy = loggedInUserId;
    }

    await timetable.save();
    const populatedTimetable = await populateTimetable(
      TimeTable.findById(timetable._id),
    ).lean();

    // 19. SORT ENTRIES

    const sortedEntries = sortEntries(
      populatedTimetable?.entries || [],
      "period",
      "asc",
    );

    const finalTimetable = populatedTimetable
      ? {
          ...populatedTimetable,
          entries: sortedEntries,
        }
      : null;

    return res.status(200).json({
      success: true,
      message: "Timetable updated successfully.",
      timetable: finalTimetable,
      data: finalTimetable,
      entries: sortedEntries,
      schedule: buildDayWiseSchedule(sortedEntries),
      statistics: getEntryStatistics(sortedEntries),
    });
  } catch (error) {
    console.error("UPDATE TIMETABLE ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Timetable validation failed.",
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A timetable with the same faculty and academic year already exists.",
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable data.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update timetable.",
      error: error.message,
    });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    timetable.isDeleted = true;
    timetable.deletedAt = new Date();
    timetable.status = "inactive";
    timetable.updatedBy = getLoggedInUserId(req);
    await timetable.save();
    return res.status(200).json({
      success: true,
      message: "Timetable deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE TIMETABLE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete timetable.",
      error: error.message,
    });
  }
};

exports.restoreTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: true,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Deleted timetable not found.",
      });
    }

    const duplicate = await TimeTable.findOne({
      _id: {
        $ne: timetable._id,
      },
      facultyId: timetable.facultyId,
      academicYear: timetable.academicYear,
      isDeleted: false,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot restore timetable because an active timetable already exists for this faculty and academic year.",
      });
    }

    timetable.isDeleted = false;
    timetable.deletedAt = null;
    timetable.status = "active";
    timetable.updatedBy = getLoggedInUserId(req);
    await timetable.save();
    const populated = await populateTimetable(
      TimeTable.findById(timetable._id),
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Timetable restored successfully.",
      timetable: populated,
      data: populated,
    });
  } catch (error) {
    console.error("RESTORE TIMETABLE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restore timetable.",
      error: error.message,
    });
  }
};

exports.permanentlyDeleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    const timetable = await TimeTable.findById(id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    await TimeTable.deleteOne({
      _id: id,
    });

    return res.status(200).json({
      success: true,
      message: "Timetable permanently deleted.",
    });
  } catch (error) {
    console.error("PERMANENT DELETE TIMETABLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete timetable.",
      error: error.message,
    });
  }
};

exports.getDaySchedule = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { academicYear = "2026-2027", day } = req.query;
    if (!isValidObjectId(facultyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }
    if (!DAYS.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "Valid day is required.",
        allowedDays: DAYS,
      });
    }
    const timetable = await TimeTable.findOne({
      facultyId,
      academicYear: normalize(academicYear),
      isDeleted: false,
    }).lean();

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    let entries = timetable.entries.filter((entry) => entry.day === day);
    entries = applyEntryFilters(entries, req.query);
    entries = sortEntries(
      entries,
      req.query.entrySortBy || "period",
      req.query.entrySortOrder || "asc",
    );

    return res.status(200).json({
      success: true,
      day,
      entries,
      totalEntries: entries.length,
    });
  } catch (error) {
    console.error("GET DAY SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load day schedule.",
      error: error.message,
    });
  }
};

exports.getWeeklySchedule = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { academicYear = "2026-2027" } = req.query;
    if (!isValidObjectId(facultyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      facultyId,
      academicYear: normalize(academicYear),
      isDeleted: false,
    }).lean();

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    let entries = applyEntryFilters(timetable.entries, req.query);
    entries = sortEntries(entries, "period", "asc");
    const schedule = buildDayWiseSchedule(entries);
    return res.status(200).json({
      success: true,
      facultyId,
      academicYear: timetable.academicYear,
      periods: timetable.periods,
      schedule,
      entries,
      statistics: getEntryStatistics(entries),
    });
  } catch (error) {
    console.error("GET WEEKLY SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load weekly schedule.",
      error: error.message,
    });
  }
};

exports.getTimetableStatistics = async (req, res) => {
  try {
    const filter = buildTimetableFilter(req.query);
    const timetables = await TimeTable.find(filter).lean();
    let allEntries = [];
    timetables.forEach((timetable) => {
      allEntries = allEntries.concat(timetable.entries || []);
    });

    allEntries = applyEntryFilters(allEntries, req.query);
    const statistics = getEntryStatistics(allEntries);
    return res.status(200).json({
      success: true,
      totalTimetables: timetables.length,
      statistics,
    });
  } catch (error) {
    console.error("GET TIMETABLE STATISTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate timetable statistics.",
      error: error.message,
    });
  }
};

exports.getTimetableOptions = async (req, res) => {
  try {
    const filter = buildTimetableFilter(req.query);
    const timetables = await TimeTable.find(filter).lean();
    const academicYears = new Set();
    const programs = new Set();
    const branches = new Set();
    const semesters = new Set();
    const sections = new Set();
    const classes = new Set();
    const subjects = new Map();
    const rooms = new Set();
    const facultyIds = new Set();
    timetables.forEach((timetable) => {
      if (timetable.academicYear) {
        academicYears.add(timetable.academicYear);
      }

      if (timetable.program) {
        programs.add(timetable.program);
      }

      if (timetable.branch) {
        branches.add(timetable.branch);
      }

      if (timetable.semester) {
        semesters.add(timetable.semester);
      }

      if (timetable.roomNo) {
        rooms.add(timetable.roomNo);
      }

      if (timetable.facultyId) {
        facultyIds.add(String(timetable.facultyId));
      }

      (timetable.entries || []).forEach((entry) => {
        if (entry.className) {
          classes.add(entry.className);
        }

        if (entry.section) {
          sections.add(entry.section);
        }

        if (entry.roomNo) {
          rooms.add(entry.roomNo);
        }

        if (entry.subjectCode) {
          subjects.set(entry.subjectCode, {
            subjectCode: entry.subjectCode,
            subjectName: entry.subjectName,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      options: {
        days: DAYS,
        periods: Array.from(
          {
            length: 10,
          },
          (_, index) => index + 1,
        ),
        slotTypes: SLOT_TYPES,
        sessionTypes: SESSION_TYPES,
        statuses: STATUSES,
        academicYears: Array.from(academicYears).sort(),
        programs: Array.from(programs).sort(),
        branches: Array.from(branches).sort(),
        semesters: Array.from(semesters).sort(),
        sections: Array.from(sections).sort(),
        classes: Array.from(classes).sort(),
        rooms: Array.from(rooms).sort(),
        subjects: Array.from(subjects.values()).sort((a, b) =>
          a.subjectCode.localeCompare(b.subjectCode),
        ),
        facultyIds: Array.from(facultyIds),
      },
    });
  } catch (error) {
    console.error("GET TIMETABLE OPTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load timetable options.",
      error: error.message,
    });
  }
};

exports.addEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    const faculty = await Faculty.findOne({
      _id: timetable.facultyId,
      isDeleted: false,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const existingEntries = timetable.entries.map((entry) =>
      entry.toObject ? entry.toObject() : entry,
    );

    const entries = [...existingEntries, req.body];
    const validation = validateEntries(entries, faculty);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    timetable.entries = validation.entries;
    timetable.updatedBy = getLoggedInUserId(req);
    await timetable.save();
    return res.status(201).json({
      success: true,
      message: "Timetable entry added successfully.",
      entry: timetable.entries[timetable.entries.length - 1],
      timetable,
    });
  } catch (error) {
    console.error("ADD TIMETABLE ENTRY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add timetable entry.",
      error: error.message,
    });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(entryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable or entry ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    const faculty = await Faculty.findOne({
      _id: timetable.facultyId,
      isDeleted: false,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const entry = timetable.entries.id(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found.",
      });
    }

    const updatedEntry = {
      ...(entry.toObject ? entry.toObject() : entry),
      ...req.body,
      _id: entryId,
    };

    const entries = timetable.entries
      .filter((item) => String(item._id) !== String(entryId))
      .map((item) => (item.toObject ? item.toObject() : item));
    entries.push(updatedEntry);
    const validation = validateEntries(entries, faculty);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    timetable.entries = validation.entries;
    timetable.updatedBy = getLoggedInUserId(req);
    await timetable.save();
    const updated = timetable.entries.id(entryId);
    return res.status(200).json({
      success: true,
      message: "Timetable entry updated successfully.",
      entry: updated,
      timetable,
    });
  } catch (error) {
    console.error("UPDATE TIMETABLE ENTRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update timetable entry.",
      error: error.message,
    });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(entryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable or entry ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    const entry = timetable.entries.id(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found.",
      });
    }

    entry.deleteOne();
    timetable.updatedBy = getLoggedInUserId(req);
    await timetable.save();
    return res.status(200).json({
      success: true,
      message: "Timetable entry deleted successfully.",
      timetable,
    });
  } catch (error) {
    console.error("DELETE TIMETABLE ENTRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete timetable entry.",
      error: error.message,
    });
  }
};

exports.clearEntries = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    const { day, days, period, subjectCode, className, slotType } = req.body;
    const filters = { day, days, period, subjectCode, className, slotType };

    const hasFilter = Object.values(filters).some(
      (value) => value !== undefined && value !== null && value !== "",
    );

    if (!hasFilter) {
      timetable.entries = [];
    } else {
      const daysArray = parseArray(days);

      timetable.entries = timetable.entries.filter((entry) => {
        if (day && entry.day !== day) {
          return true;
        }

        if (daysArray.length > 0 && !daysArray.includes(entry.day)) {
          return true;
        }

        if (period && entry.period !== Number(period)) {
          return true;
        }

        if (
          subjectCode &&
          normalizeLower(entry.subjectCode) !== normalizeLower(subjectCode)
        ) {
          return true;
        }

        if (
          className &&
          normalizeLower(entry.className) !== normalizeLower(className)
        ) {
          return true;
        }

        if (slotType && entry.slotType !== slotType) {
          return true;
        }

        return false;
      });
    }

    timetable.updatedBy = getLoggedInUserId(req);

    await timetable.save();

    return res.status(200).json({
      success: true,
      message: "Timetable entries cleared successfully.",
      timetable,
    });
  } catch (error) {
    console.error("CLEAR TIMETABLE ENTRIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear timetable entries.",
      error: error.message,
    });
  }
};

exports.replaceEntries = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID.",
      });
    }

    if (!Array.isArray(req.body.entries)) {
      return res.status(400).json({
        success: false,
        message: "Entries must be an array.",
      });
    }

    const timetable = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    const faculty = await Faculty.findOne({
      _id: timetable.facultyId,
      isDeleted: false,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    const validation = validateEntries(req.body.entries, faculty);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    timetable.entries = validation.entries;

    timetable.updatedBy = getLoggedInUserId(req);

    await timetable.save();

    return res.status(200).json({
      success: true,
      message: "Timetable entries replaced successfully.",
      timetable,
    });
  } catch (error) {
    console.error("REPLACE TIMETABLE ENTRIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to replace timetable entries.",
      error: error.message,
    });
  }
};

exports.bulkCreateTimetables = async (req, res) => {
  try {
    if (!Array.isArray(req.body.timetables)) {
      return res.status(400).json({
        success: false,
        message: "timetables must be an array.",
      });
    }

    const results = [];
    const errors = [];

    for (let index = 0; index < req.body.timetables.length; index += 1) {
      const item = req.body.timetables[index];

      try {
        const { facultyId, academicYear, periods, entries } = item;

        if (!isValidObjectId(facultyId)) {
          throw new Error("Invalid faculty ID.");
        }

        const faculty = await Faculty.findOne({
          _id: facultyId,
          isDeleted: false,
        });

        if (!faculty) {
          throw new Error("Faculty not found.");
        }

        const normalizedAcademicYear = normalize(academicYear);

        if (!normalizedAcademicYear) {
          throw new Error("Academic year is required.");
        }

        const existing = await TimeTable.findOne({
          facultyId,
          academicYear: normalizedAcademicYear,
          isDeleted: false,
        });

        if (existing) {
          throw new Error("Timetable already exists.");
        }

        const periodValidation = validatePeriods(periods || []);

        if (!periodValidation.valid) {
          throw new Error(periodValidation.message);
        }

        const entryValidation = validateEntries(entries || [], faculty);

        if (!entryValidation.valid) {
          throw new Error(entryValidation.message);
        }

        const timetable = await TimeTable.create({
          ...item,
          facultyId: faculty._id,
          userId: getFacultyUserId(faculty),
          facultyName: getFacultyName(faculty),
          academicYear: normalizedAcademicYear,
          periods: periods || [],
          entries: entryValidation.entries,
          createdBy: getLoggedInUserId(req),
          updatedBy: getLoggedInUserId(req),
        });

        results.push(timetable);
      } catch (error) {
        errors.push({
          index,
          message: error.message,
        });
      }
    }

    return res.status(201).json({
      success: errors.length === 0,
      message: "Bulk timetable creation completed.",
      created: results.length,
      failed: errors.length,
      timetables: results,
      errors,
    });
  } catch (error) {
    console.error("BULK CREATE TIMETABLES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to perform bulk timetable creation.",
      error: error.message,
    });
  }
};

exports.bulkUpdateTimetables = async (req, res) => {
  try {
    if (!Array.isArray(req.body.timetables)) {
      return res.status(400).json({
        success: false,
        message: "timetables must be an array.",
      });
    }

    const results = [];
    const errors = [];

    for (let index = 0; index < req.body.timetables.length; index += 1) {
      const item = req.body.timetables[index];

      try {
        if (!isValidObjectId(item._id)) {
          throw new Error("Invalid timetable ID.");
        }

        const timetable = await TimeTable.findOne({
          _id: item._id,
          isDeleted: false,
        });

        if (!timetable) {
          throw new Error("Timetable not found.");
        }

        const faculty = await Faculty.findOne({
          _id: item.facultyId || timetable.facultyId,
          isDeleted: false,
        });

        if (!faculty) {
          throw new Error("Faculty not found.");
        }

        if (item.entries !== undefined) {
          const validation = validateEntries(item.entries, faculty);

          if (!validation.valid) {
            throw new Error(validation.message);
          }

          timetable.entries = validation.entries;
        }

        if (item.periods !== undefined) {
          const validation = validatePeriods(item.periods);

          if (!validation.valid) {
            throw new Error(validation.message);
          }

          timetable.periods = item.periods;
        }

        const fields = [
          "issueDate",
          "effectiveFrom",
          "revisionNumber",
          "program",
          "branch",
          "semester",
          "roomNo",
          "classCoordinator",
          "institutionName",
          "timetableTitle",
          "lunchStartTime",
          "lunchEndTime",
        ];

        fields.forEach((field) => {
          if (item[field] !== undefined) {
            if (field === "issueDate" || field === "effectiveFrom") {
              timetable[field] = parseDate(item[field]);
            } else {
              timetable[field] = normalize(item[field]);
            }
          }
        });

        if (item.status && STATUSES.includes(item.status)) {
          timetable.status = item.status;
        }

        timetable.updatedBy = getLoggedInUserId(req);

        await timetable.save();

        results.push(timetable);
      } catch (error) {
        errors.push({
          index,
          id: item?._id,
          message: error.message,
        });
      }
    }

    return res.status(200).json({
      success: errors.length === 0,
      message: "Bulk timetable update completed.",
      updated: results.length,
      failed: errors.length,
      timetables: results,
      errors,
    });
  } catch (error) {
    console.error("BULK UPDATE TIMETABLES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to perform bulk timetable update.",
      error: error.message,
    });
  }
};

exports.bulkDeleteTimetables = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one timetable ID is required.",
      });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid timetable IDs were provided.",
      });
    }

    const result = await TimeTable.updateMany(
      {
        _id: {
          $in: validIds,
        },
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          status: "inactive",
          updatedBy: getLoggedInUserId(req),
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Timetables deleted successfully.",
      matched: result.matchedCount,
      deleted: result.modifiedCount,
    });
  } catch (error) {
    console.error("BULK DELETE TIMETABLES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to perform bulk timetable deletion.",
      error: error.message,
    });
  }
};

exports.bulkRestoreTimetables = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one timetable ID is required.",
      });
    }

    let restored = 0;
    const errors = [];

    for (const id of ids) {
      try {
        if (!isValidObjectId(id)) {
          throw new Error("Invalid timetable ID.");
        }

        const timetable = await TimeTable.findOne({
          _id: id,
          isDeleted: true,
        });

        if (!timetable) {
          throw new Error("Deleted timetable not found.");
        }

        const duplicate = await TimeTable.findOne({
          _id: {
            $ne: timetable._id,
          },
          facultyId: timetable.facultyId,
          academicYear: timetable.academicYear,
          isDeleted: false,
        });

        if (duplicate) {
          throw new Error(
            "Active timetable already exists for this faculty and academic year.",
          );
        }

        timetable.isDeleted = false;

        timetable.deletedAt = null;

        timetable.status = "active";

        timetable.updatedBy = getLoggedInUserId(req);

        await timetable.save();

        restored += 1;
      } catch (error) {
        errors.push({
          id,
          message: error.message,
        });
      }
    }

    return res.status(200).json({
      success: errors.length === 0,
      message: "Bulk timetable restoration completed.",
      restored,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    console.error("BULK RESTORE TIMETABLES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to perform bulk timetable restoration.",
      error: error.message,
    });
  }
};

exports.cloneTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      targetFacultyId,
      targetAcademicYear,
      targetProgram,
      targetBranch,
      targetSemester,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid source timetable ID.",
      });
    }

    const source = await TimeTable.findOne({
      _id: id,
      isDeleted: false,
    }).lean();

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source timetable not found.",
      });
    }

    const destinationFacultyId = targetFacultyId || source.facultyId;

    if (!isValidObjectId(destinationFacultyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target faculty ID.",
      });
    }

    const destinationFaculty = await Faculty.findOne({
      _id: destinationFacultyId,
      isDeleted: false,
    });

    if (!destinationFaculty) {
      return res.status(404).json({
        success: false,
        message: "Target faculty not found.",
      });
    }

    const destinationYear =
      normalize(targetAcademicYear) || source.academicYear;

    const existing = await TimeTable.findOne({
      facultyId: destinationFacultyId,
      academicYear: destinationYear,
      isDeleted: false,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Target timetable already exists.",
      });
    }

    const validation = validateEntries(
      source.entries || [],
      destinationFaculty,
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Source timetable cannot be cloned to this faculty: ${validation.message}`,
      });
    }

    const clonedEntries = validation.entries.map((entry) => ({
      ...entry,
      _id: undefined,
    }));

    const cloned = await TimeTable.create({
      facultyId: destinationFaculty._id,

      userId: getFacultyUserId(destinationFaculty),

      facultyName: getFacultyName(destinationFaculty),

      academicYear: destinationYear,

      issueDate: source.issueDate,

      effectiveFrom: source.effectiveFrom,

      revisionNumber: source.revisionNumber,

      program: normalize(targetProgram) || source.program,

      branch: normalize(targetBranch) || source.branch,

      semester: normalize(targetSemester) || source.semester,

      roomNo: source.roomNo,

      classCoordinator: source.classCoordinator,

      institutionName: source.institutionName,

      timetableTitle: source.timetableTitle,

      lunchStartTime: source.lunchStartTime,

      lunchEndTime: source.lunchEndTime,

      periods: source.periods || [],

      entries: clonedEntries,

      status: "draft",

      isDeleted: false,

      deletedAt: null,

      createdBy: getLoggedInUserId(req),

      updatedBy: getLoggedInUserId(req),
    });

    return res.status(201).json({
      success: true,
      message: "Timetable cloned successfully.",
      timetable: cloned,
      data: cloned,
    });
  } catch (error) {
    console.error("CLONE TIMETABLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clone timetable.",
      error: error.message,
    });
  }
};

exports.checkConflicts = async (req, res) => {
  try {
    const { facultyId, academicYear, entries } = req.body;

    if (!isValidObjectId(facultyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    if (!Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: "Entries must be an array.",
      });
    }

    const conflicts = [];
    const internalKeys = new Map();

    entries.forEach((entry, index) => {
      const key = `${entry.day}-${entry.period}`;

      if (internalKeys.has(key)) {
        conflicts.push({
          type: "internal_duplicate",
          index,
          conflictWith: internalKeys.get(key),
          day: entry.day,
          period: entry.period,
        });
      } else {
        internalKeys.set(key, index);
      }
    });

    const timetable = await TimeTable.findOne({
      facultyId,
      academicYear: normalize(academicYear),
      isDeleted: false,
    }).lean();

    if (timetable) {
      entries.forEach((entry, index) => {
        const conflict = timetable.entries.find(
          (existing) =>
            existing.day === entry.day &&
            existing.period === Number(entry.period) &&
            String(existing._id) !== String(entry._id || ""),
        );

        if (conflict) {
          conflicts.push({
            type: "existing_timetable_conflict",
            index,
            day: entry.day,
            period: entry.period,
            existingEntry: conflict,
          });
        }
      });
    }

    return res.status(200).json({
      success: true,
      hasConflicts: conflicts.length > 0,
      conflictCount: conflicts.length,
      conflicts,
    });
  } catch (error) {
    console.error("CHECK TIMETABLE CONFLICTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check timetable conflicts.",
      error: error.message,
    });
  }
};

exports.getFacultyTimetableByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId;

    const academicYear = normalize(req.query.academicYear) || "2026-2027";

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const faculty = await Faculty.findOne({
      userId,
      isDeleted: false,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found for this user.",
      });
    }

    const timetable = await populateTimetable(
      TimeTable.findOne({
        facultyId: faculty._id,
        academicYear,
        isDeleted: false,
      }),
    ).lean();

    if (!timetable) {
      return res.status(200).json({
        success: true,
        exists: false,
        facultyId: faculty._id,
        timetable: null,
        entries: [],
        schedule: buildDayWiseSchedule([]),
      });
    }

    const entries = sortEntries(timetable.entries, "period", "asc");

    return res.status(200).json({
      success: true,
      exists: true,
      facultyId: faculty._id,
      timetable: {
        ...timetable,
        entries,
      },
      entries,
      schedule: buildDayWiseSchedule(entries),
    });
  } catch (error) {
    console.error("GET FACULTY TIMETABLE BY USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load faculty timetable.",
      error: error.message,
    });
  }
};

exports.getMyTimetable = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
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

    const academicYear = normalize(req.query.academicYear) || "2026-2027";

    const timetable = await populateTimetable(
      TimeTable.findOne({
        facultyId: faculty._id,
        academicYear,
        isDeleted: false,
      }),
    ).lean();

    if (!timetable) {
      return res.status(200).json({
        success: true,
        exists: false,
        faculty,
        timetable: null,
        entries: [],
        schedule: buildDayWiseSchedule([]),
      });
    }

    const entries = sortEntries(
      applyEntryFilters(timetable.entries, req.query),
      req.query.entrySortBy || "period",
      req.query.entrySortOrder || "asc",
    );

    return res.status(200).json({
      success: true,
      exists: true,
      faculty,
      timetable: {
        ...timetable,
        entries,
      },
      entries,
      schedule: buildDayWiseSchedule(entries),
      statistics: getEntryStatistics(entries),
    });
  } catch (error) {
    console.error("GET MY TIMETABLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load your timetable.",
      error: error.message,
    });
  }
};

exports.updateMyTimetable = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
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

    const academicYear = normalize(req.body.academicYear);

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: "Academic year is required.",
      });
    }

    const timetable = await TimeTable.findOne({
      facultyId: faculty._id,
      academicYear,
      isDeleted: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    if (req.body.entries !== undefined) {
      const validation = validateEntries(req.body.entries, faculty);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      timetable.entries = validation.entries;
    }

    if (req.body.periods !== undefined) {
      const validation = validatePeriods(req.body.periods);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      timetable.periods = req.body.periods;
    }

    timetable.updatedBy = userId;

    await timetable.save();

    const populated = await populateTimetable(
      TimeTable.findById(timetable._id),
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Your timetable was updated successfully.",
      timetable: populated,
      data: populated,
    });
  } catch (error) {
    console.error("UPDATE MY TIMETABLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update your timetable.",
      error: error.message,
    });
  }
};

exports.getFacultyAssignedData = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!isValidObjectId(facultyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID.",
      });
    }

    const faculty = await Faculty.findOne({
      _id: facultyId,
      isDeleted: false,
    }).lean();

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    return res.status(200).json({
      success: true,
      facultyId: faculty._id,
      facultyName: getFacultyName(faculty),
      userId: getFacultyUserId(faculty),
      subjects: Array.isArray(faculty.subjects) ? faculty.subjects : [],
      classes: Array.isArray(faculty.classes) ? faculty.classes : [],
    });
  } catch (error) {
    console.error("GET FACULTY ASSIGNED DATA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load faculty assigned subjects and classes.",
      error: error.message,
    });
  }
};

exports.getSubjectSchedule = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    const filter = buildTimetableFilter(req.query);

    filter["entries.subjectCode"] = normalize(subjectCode).toUpperCase();

    const timetables = await TimeTable.find(filter)
      .populate({
        path: "facultyId",
      })
      .lean();

    const schedule = [];

    timetables.forEach((timetable) => {
      (timetable.entries || []).forEach((entry) => {
        if (normalizeLower(entry.subjectCode) === normalizeLower(subjectCode)) {
          schedule.push({
            timetableId: timetable._id,
            facultyId: timetable.facultyId,
            facultyName: timetable.facultyName,
            academicYear: timetable.academicYear,
            entry,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      subjectCode: normalize(subjectCode).toUpperCase(),
      total: schedule.length,
      schedule: sortEntries(
        schedule.map((item) => ({
          ...item.entry,
          timetableId: item.timetableId,
          facultyId: item.facultyId,
          facultyName: item.facultyName,
          academicYear: item.academicYear,
        })),
        req.query.entrySortBy || "period",
        req.query.entrySortOrder || "asc",
      ),
    });
  } catch (error) {
    console.error("GET SUBJECT SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subject schedule.",
      error: error.message,
    });
  }
};

exports.getClassSchedule = async (req, res) => {
  try {
    const { className } = req.params;

    const filter = buildTimetableFilter(req.query);

    filter["entries.className"] = new RegExp(
      `^${escapeRegex(normalize(className))}$`,
      "i",
    );

    const timetables = await TimeTable.find(filter)
      .populate({
        path: "facultyId",
      })
      .lean();

    const schedule = [];

    timetables.forEach((timetable) => {
      (timetable.entries || []).forEach((entry) => {
        if (normalizeLower(entry.className) === normalizeLower(className)) {
          schedule.push({
            timetableId: timetable._id,
            facultyId: timetable.facultyId,
            facultyName: timetable.facultyName,
            academicYear: timetable.academicYear,
            entry,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      className: normalize(className),
      total: schedule.length,
      schedule: sortEntries(
        schedule.map((item) => ({
          ...item.entry,
          timetableId: item.timetableId,
          facultyId: item.facultyId,
          facultyName: item.facultyName,
          academicYear: item.academicYear,
        })),
        req.query.entrySortBy || "period",
        req.query.entrySortOrder || "asc",
      ),
    });
  } catch (error) {
    console.error("GET CLASS SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load class schedule.",
      error: error.message,
    });
  }
};

exports.getRoomSchedule = async (req, res) => {
  try {
    const { roomNo } = req.params;

    const filter = buildTimetableFilter(req.query);

    filter.$or = [
      {
        roomNo: new RegExp(`^${escapeRegex(normalize(roomNo))}$`, "i"),
      },
      {
        "entries.roomNo": new RegExp(
          `^${escapeRegex(normalize(roomNo))}$`,
          "i",
        ),
      },
    ];

    const timetables = await TimeTable.find(filter).lean();

    const schedule = [];

    timetables.forEach((timetable) => {
      (timetable.entries || []).forEach((entry) => {
        if (normalizeLower(entry.roomNo) === normalizeLower(roomNo)) {
          schedule.push({
            timetableId: timetable._id,
            facultyId: timetable.facultyId,
            facultyName: timetable.facultyName,
            academicYear: timetable.academicYear,
            entry,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      roomNo: normalize(roomNo),
      total: schedule.length,
      schedule: sortEntries(
        schedule.map((item) => ({
          ...item.entry,
          timetableId: item.timetableId,
          facultyId: item.facultyId,
          facultyName: item.facultyName,
          academicYear: item.academicYear,
        })),
        req.query.entrySortBy || "period",
        req.query.entrySortOrder || "asc",
      ),
    });
  } catch (error) {
    console.error("GET ROOM SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load room schedule.",
      error: error.message,
    });
  }
};

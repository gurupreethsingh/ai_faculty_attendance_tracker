import React, { useCallback, useEffect, useMemo, useState } from "react";

import axios from "axios";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFileWord,
  FaFilter,
  FaGraduationCap,
  FaInfoCircle,
  FaLayerGroup,
  FaPrint,
  FaRedo,
  FaSearch,
  FaTable,
  FaTimes,
  FaUserTie,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
} from "docx";

import globalBackendRoute from "../../config/Config";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = `${globalBackendRoute}/api`;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_PERIODS = [
  {
    period: 1,
    label: "Period 1",
    startTime: "9:10AM",
    endTime: "10:00AM",
  },
  {
    period: 2,
    label: "Period 2",
    startTime: "10:00AM",
    endTime: "10:50AM",
  },
  {
    period: 3,
    label: "Period 3",
    startTime: "10:50AM",
    endTime: "11:40AM",
  },
  {
    period: 4,
    label: "Period 4",
    startTime: "11:40AM",
    endTime: "12:30PM",
  },
  {
    period: 5,
    label: "Period 5",
    startTime: "12:30PM",
    endTime: "1:20PM",
  },
  {
    period: 6,
    label: "Period 6",
    startTime: "1:20PM",
    endTime: "2:10PM",
  },
  {
    period: 7,
    label: "Period 7",
    startTime: "2:10PM",
    endTime: "3:00PM",
  },
  {
    period: 8,
    label: "Period 8",
    startTime: "3:00PM",
    endTime: "3:10PM",
  },
  {
    period: 9,
    label: "Period 9",
    startTime: "3:10PM",
    endTime: "4:00PM",
  },
  {
    period: 10,
    label: "Period 10",
    startTime: "4:00PM",
    endTime: "4:50PM",
  },
];

const SLOT_TYPES = [
  "subject",
  "lab",
  "BREAK",
  "SHORT BREAK",
  "LUNCH",
  "SPORTS",
  "LIB",
  "ACTIVITY",
  "DOUBT SESSION",
  "CULTURAL CLUB ACTIVITY",
  "OUTDOOR ACTIVITY",
  "INDOOR ACTIVITY",
  "FREE PERIOD",
  "OTHER",
];

const SUBJECT_PALETTE = [
  "#DBEAFE",
  "#DCFCE7",
  "#FEF3C7",
  "#FCE7F3",
  "#EDE9FE",
  "#CFFAFE",
  "#FFEDD5",
  "#F3E8FF",
  "#D1FAE5",
  "#FEE2E2",
  "#E0F2FE",
  "#ECFCCB",
  "#FAE8FF",
  "#FFE4E6",
  "#E0E7FF",
  "#CCFBF1",
];

const BORDER_PALETTE = [
  "#2563EB",
  "#16A34A",
  "#D97706",
  "#DB2777",
  "#7C3AED",
  "#0891B2",
  "#EA580C",
  "#9333EA",
  "#059669",
  "#DC2626",
  "#0284C7",
  "#65A30D",
  "#C026D3",
  "#E11D48",
  "#4F46E5",
  "#0D9488",
];

/* =========================================================
   HELPERS
========================================================= */

const getToken = () => {
  return (
    localStorage.getItem("travel_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("travel_token") ||
    ""
  );
};

const authHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const cleanString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return String(value._id);
  }

  if (value.id) {
    return String(value.id);
  }

  return String(value);
};

const getFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
};

const normalizeDay = (value) => {
  const day = cleanString(value).toLowerCase();

  const map = {
    mon: "Monday",
    monday: "Monday",
    tue: "Tuesday",
    tues: "Tuesday",
    tuesday: "Tuesday",
    wed: "Wednesday",
    wednesday: "Wednesday",
    thu: "Thursday",
    thurs: "Thursday",
    thursday: "Thursday",
    fri: "Friday",
    friday: "Friday",
    sat: "Saturday",
    saturday: "Saturday",
    sun: "Sunday",
    sunday: "Sunday",
  };

  return map[day] || cleanString(value);
};

const normalizeSlotType = (value) => {
  const slot = cleanString(value);

  if (!slot) {
    return "subject";
  }

  const upper = slot.toUpperCase();

  if (upper === "BREAK") return "BREAK";
  if (upper === "SHORT BREAK") return "SHORT BREAK";
  if (upper === "LUNCH") return "LUNCH";
  if (upper === "SPORTS") return "SPORTS";
  if (upper === "LIB") return "LIB";
  if (upper === "ACTIVITY") return "ACTIVITY";
  if (upper === "DOUBT SESSION") return "DOUBT SESSION";
  if (upper === "CULTURAL CLUB ACTIVITY") {
    return "CULTURAL CLUB ACTIVITY";
  }
  if (upper === "OUTDOOR ACTIVITY") return "OUTDOOR ACTIVITY";
  if (upper === "INDOOR ACTIVITY") return "INDOOR ACTIVITY";
  if (upper === "FREE PERIOD") return "FREE PERIOD";

  if (upper === "LAB") {
    return "lab";
  }

  return "subject";
};

const formatTime = (value) => {
  if (!value) return "";

  return String(value).replace(/\s+/g, "").toUpperCase();
};

const getPeriodNumber = (entry) => {
  const value = getFirst(
    entry.period,
    entry.periodNumber,
    entry.periodNo,
    entry.periodIndex,
    entry.slot,
    entry.slotNumber,
  );

  if (typeof value === "number") {
    return value;
  }

  const match = String(value || "").match(/\d+/);

  return match ? Number(match[0]) : null;
};

const getEntrySubjectCode = (entry) => {
  return cleanString(
    getFirst(
      entry.subjectCode,
      entry.courseCode,
      entry.code,
      entry.subject?.subjectCode,
      entry.subject?.courseCode,
      entry.subject?.code,
    ),
  );
};

const getEntrySubjectName = (entry) => {
  return cleanString(
    getFirst(
      entry.subjectName,
      entry.courseName,
      entry.subject?.subjectName,
      entry.subject?.courseName,
      entry.subject?.name,
      entry.name,
    ),
  );
};

const getEntryFacultyName = (entry) => {
  return cleanString(
    getFirst(
      entry.facultyName,
      entry.teacherName,
      entry.faculty?.facultyName,
      entry.faculty?.name,
    ),
  );
};

const getEntryClassName = (entry) => {
  return cleanString(
    getFirst(
      entry.className,
      entry.class,
      entry.section,
      entry.classDetails?.className,
    ),
  );
};

const getEntryProgram = (entry) => {
  return cleanString(
    getFirst(entry.program, entry.programName, entry.classDetails?.program),
  );
};

const getEntryBranch = (entry) => {
  return cleanString(
    getFirst(entry.branch, entry.branchName, entry.classDetails?.branch),
  );
};

const getEntrySemester = (entry) => {
  return cleanString(
    getFirst(entry.semester, entry.sem, entry.classDetails?.semester),
  );
};

const getEntryRoom = (entry) => {
  return cleanString(getFirst(entry.roomNo, entry.room, entry.roomNumber));
};

const getEntrySlotType = (entry) => {
  return normalizeSlotType(
    getFirst(entry.slotType, entry.type, entry.activityType, entry.entryType),
  );
};

const normalizeEntry = (entry = {}, timetable = {}) => {
  const periodNumber = getPeriodNumber(entry);

  const day = normalizeDay(
    getFirst(entry.day, entry.dayName, entry.weekDay, entry.weekday),
  );

  const subjectCode = getEntrySubjectCode(entry);

  const subjectName = getEntrySubjectName(entry);

  const facultyName = getFirst(
    getEntryFacultyName(entry),
    timetable.facultyName,
  );

  const className = getFirst(getEntryClassName(entry), timetable.className);

  const program = getFirst(getEntryProgram(entry), timetable.program);

  const branch = getFirst(getEntryBranch(entry), timetable.branch);

  const semester = getFirst(getEntrySemester(entry), timetable.semester);

  const roomNo = getFirst(getEntryRoom(entry), timetable.roomNo);

  return {
    ...entry,

    _id: getId(entry._id || entry.id),

    day,

    period: periodNumber,

    subjectCode,

    subjectName,

    facultyName,

    className,

    program,

    branch,

    semester,

    roomNo,

    slotType: getEntrySlotType(entry),

    startTime: formatTime(
      getFirst(entry.startTime, entry.fromTime, entry.start, entry.time?.start),
    ),

    endTime: formatTime(
      getFirst(entry.endTime, entry.toTime, entry.end, entry.time?.end),
    ),
  };
};

const extractData = (response) => {
  const data = response?.data;

  if (!data) {
    return null;
  }

  if (data.data !== undefined) {
    return data.data;
  }

  if (data.timetable !== undefined) {
    return data.timetable;
  }

  if (data.timeTable !== undefined) {
    return data.timeTable;
  }

  if (data.results !== undefined) {
    return data.results;
  }

  return data;
};

const extractTimetables = (response) => {
  const data = extractData(response);

  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.timetables)) {
    return data.timetables;
  }

  if (Array.isArray(data.timeTables)) {
    return data.timeTables;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  if (data._id || data.entries || data.periods) {
    return [data];
  }

  return [];
};

const extractFaculty = (response) => {
  const data = extractData(response);

  if (!data) return null;

  if (data.faculty) return data.faculty;

  if (data.profile) return data.profile;

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data;
};

const getTimetableEntries = (timetable) => {
  if (!timetable) return [];

  const rawEntries =
    timetable.entries ||
    timetable.schedule ||
    timetable.slots ||
    timetable.timetableEntries ||
    [];

  if (!Array.isArray(rawEntries)) {
    return [];
  }

  return rawEntries.map((entry) => normalizeEntry(entry, timetable));
};

const makeDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  window.URL.revokeObjectURL(url);
};

const safeFileName = (value) => {
  return cleanString(value)
    .replace(/[^a-z0-9-_]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
};

/* =========================================================
   COMPONENT
========================================================= */

export default function SingleFacultyTimeTable() {
  /* =======================================================
     STATE
  ======================================================= */

  const [faculty, setFaculty] = useState(null);

  const [timetables, setTimetables] = useState([]);

  const [loading, setLoading] = useState(true);

  const [facultyLoading, setFacultyLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");

  const [showFilters, setShowFilters] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState("ALL");

  const [selectedClass, setSelectedClass] = useState("ALL");

  const [selectedProgram, setSelectedProgram] = useState("ALL");

  const [selectedBranch, setSelectedBranch] = useState("ALL");

  const [selectedSemester, setSelectedSemester] = useState("ALL");

  const [selectedAcademicYear, setSelectedAcademicYear] = useState("ALL");

  const [selectedRoom, setSelectedRoom] = useState("ALL");

  const [selectedDay, setSelectedDay] = useState("ALL");

  const [selectedPeriod, setSelectedPeriod] = useState("ALL");

  const [selectedSlotType, setSelectedSlotType] = useState("ALL");

  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [selectedTimetable, setSelectedTimetable] = useState("ALL");

  const [viewMode, setViewMode] = useState("master");

  const [exporting, setExporting] = useState(false);

  const [showSubjectLegend, setShowSubjectLegend] = useState(true);

  /* =======================================================
     FETCH FACULTY
  ======================================================= */

  const fetchFaculty = useCallback(async () => {
    setFacultyLoading(true);

    try {
      const response = await api.get("/faculty/get-my-faculty-profile", {
        headers: authHeaders(),
      });

      const currentFaculty = extractFaculty(response);

      if (!currentFaculty) {
        throw new Error("Unable to identify the logged-in faculty.");
      }

      setFaculty(currentFaculty);
    } catch (err) {
      console.error("SingleFacultyTimeTable faculty error:", err);

      setError(
        err?.response?.data?.message || "Unable to load your faculty profile.",
      );
    } finally {
      setFacultyLoading(false);
    }
  }, []);

  /* =======================================================
     FETCH FACULTY TIMETABLE
  ======================================================= */

  const fetchTimetable = useCallback(async () => {
    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * We intentionally use get-my-timetable.
       *
       * This means we DO NOT need to fetch all faculties.
       * The backend determines the faculty from req.user.
       */

      const response = await api.get("/timetable/get-my-timetable", {
        headers: authHeaders(),
      });

      const list = extractTimetables(response);

      setTimetables(list);
    } catch (err) {
      console.error("SingleFacultyTimeTable timetable error:", err);

      setError(
        err?.response?.data?.message || "Unable to load your timetable.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchFaculty();
    fetchTimetable();
  }, [fetchFaculty, fetchTimetable]);

  /* =======================================================
     ALL RAW ENTRIES
  ======================================================= */

  const allEntries = useMemo(() => {
    const result = [];

    timetables.forEach((timetable) => {
      const entries = getTimetableEntries(timetable);

      entries.forEach((entry) => {
        result.push({
          ...entry,

          timetableId: getId(timetable._id),

          timetableTitle: timetable.timetableTitle || "Time Table",

          issueDate: timetable.issueDate || "",

          effectiveFrom: timetable.effectiveFrom || "",

          revisionNumber: timetable.revisionNumber || "",

          institutionName:
            timetable.institutionName ||
            "COLLEGE OF ENGINEERING & COMPUTER APPLICATION(CECA)",

          lunchStartTime: timetable.lunchStartTime || "12:30PM",

          lunchEndTime: timetable.lunchEndTime || "1:20PM",

          timetableAcademicYear: timetable.academicYear || "",

          timetableProgram: timetable.program || "",

          timetableBranch: timetable.branch || "",

          timetableSemester: timetable.semester || "",

          timetableRoomNo: timetable.roomNo || "",

          timetableClassCoordinator: timetable.classCoordinator || "",

          timetableFacultyName: timetable.facultyName || "",

          timetableStatus: timetable.status || "active",
        });
      });
    });

    return result;
  }, [timetables]);

  /* =======================================================
     FACULTY NAME
  ======================================================= */

  const facultyName = useMemo(() => {
    if (!faculty) return "Faculty";

    return (
      cleanString(
        getFirst(
          faculty.facultyName,
          faculty.name,
          faculty.fullName,
          faculty.displayName,
          faculty.user?.name,
          faculty.userName,
        ),
      ) || "Faculty"
    );
  }, [faculty]);

  /* =======================================================
     FACULTY ID
  ======================================================= */

  const facultyId = useMemo(() => {
    if (!faculty) return "";

    return getId(faculty._id || faculty.facultyId || faculty.id);
  }, [faculty]);

  /* =======================================================
     SUBJECT OPTIONS
  ======================================================= */

  const subjectOptions = useMemo(() => {
    const map = new Map();

    allEntries.forEach((entry) => {
      const code = cleanString(entry.subjectCode);

      const name = cleanString(entry.subjectName);

      if (!code && !name) return;

      const key = code || name;

      if (!map.has(key)) {
        map.set(key, {
          value: key,
          code,
          name,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      `${a.code} ${a.name}`.localeCompare(`${b.code} ${b.name}`),
    );
  }, [allEntries]);

  /* =======================================================
     CLASS OPTIONS
  ======================================================= */

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(allEntries.map((entry) => entry.className).filter(Boolean)),
    ).sort();
  }, [allEntries]);

  /* =======================================================
     PROGRAM OPTIONS
  ======================================================= */

  const programOptions = useMemo(() => {
    return Array.from(
      new Set(
        allEntries
          .map((entry) => entry.program)
          .concat(timetables.map((item) => cleanString(item.program)))
          .filter(Boolean),
      ),
    ).sort();
  }, [allEntries, timetables]);

  /* =======================================================
     BRANCH OPTIONS
  ======================================================= */

  const branchOptions = useMemo(() => {
    return Array.from(
      new Set(
        allEntries
          .map((entry) => entry.branch)
          .concat(timetables.map((item) => cleanString(item.branch)))
          .filter(Boolean),
      ),
    ).sort();
  }, [allEntries, timetables]);

  /* =======================================================
     SEMESTER OPTIONS
  ======================================================= */

  const semesterOptions = useMemo(() => {
    return Array.from(
      new Set(
        allEntries
          .map((entry) => entry.semester)
          .concat(timetables.map((item) => cleanString(item.semester)))
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      String(a).localeCompare(String(b), undefined, {
        numeric: true,
      }),
    );
  }, [allEntries, timetables]);

  /* =======================================================
     ACADEMIC YEAR OPTIONS
  ======================================================= */

  const academicYearOptions = useMemo(() => {
    return Array.from(
      new Set(
        allEntries
          .map((entry) => entry.timetableAcademicYear)
          .concat(timetables.map((item) => cleanString(item.academicYear)))
          .filter(Boolean),
      ),
    ).sort();
  }, [allEntries, timetables]);

  /* =======================================================
     ROOM OPTIONS
  ======================================================= */

  const roomOptions = useMemo(() => {
    return Array.from(
      new Set(
        allEntries
          .map((entry) => entry.roomNo)
          .concat(timetables.map((item) => cleanString(item.roomNo)))
          .filter(Boolean),
      ),
    ).sort();
  }, [allEntries, timetables]);

  /* =======================================================
     PERIOD OPTIONS
  ======================================================= */

  const periodOptions = useMemo(() => {
    const periodMap = new Map();

    DEFAULT_PERIODS.forEach((period) => {
      periodMap.set(period.period, period);
    });

    timetables.forEach((timetable) => {
      if (!Array.isArray(timetable.periods)) {
        return;
      }

      timetable.periods.forEach((period, index) => {
        const number = Number(
          getFirst(
            period.period,
            period.periodNumber,
            period.periodNo,
            index + 1,
          ),
        );

        if (!number) return;

        periodMap.set(number, {
          period: number,

          label:
            getFirst(period.label, period.name, `Period ${number}`) ||
            `Period ${number}`,

          startTime: formatTime(
            getFirst(period.startTime, period.fromTime, period.start),
          ),

          endTime: formatTime(
            getFirst(period.endTime, period.toTime, period.end),
          ),
        });
      });
    });

    return Array.from(periodMap.values()).sort((a, b) => a.period - b.period);
  }, [timetables]);

  /* =======================================================
     SLOT TYPE OPTIONS
  ======================================================= */

  const slotTypeOptions = useMemo(() => {
    const dynamic = allEntries.map((entry) => entry.slotType).filter(Boolean);

    return Array.from(new Set([...SLOT_TYPES, ...dynamic]));
  }, [allEntries]);

  /* =======================================================
     STATUS OPTIONS
  ======================================================= */

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(
        timetables.map((item) => cleanString(item.status)).filter(Boolean),
      ),
    );
  }, [timetables]);

  /* =======================================================
     TIMETABLE OPTIONS
  ======================================================= */

  const timetableOptions = useMemo(() => {
    return timetables.map((item) => ({
      id: getId(item._id),
      title: cleanString(item.timetableTitle) || "Time Table",
      academicYear: cleanString(item.academicYear) || "Academic Year",
      program: cleanString(item.program) || "",
      branch: cleanString(item.branch) || "",
      semester: cleanString(item.semester) || "",
      status: cleanString(item.status) || "active",
    }));
  }, [timetables]);

  /* =======================================================
     SUBJECT COLORS
  ======================================================= */

  const subjectColors = useMemo(() => {
    const map = {};

    subjectOptions.forEach((subject, index) => {
      const key = subject.value;

      map[key] = {
        background: SUBJECT_PALETTE[index % SUBJECT_PALETTE.length],

        border: BORDER_PALETTE[index % BORDER_PALETTE.length],
      };
    });

    return map;
  }, [subjectOptions]);

  /* =======================================================
     FILTERED ENTRIES
  ======================================================= */

  const filteredEntries = useMemo(() => {
    const query = cleanString(searchText).toLowerCase();

    return allEntries.filter((entry) => {
      if (
        selectedSubject !== "ALL" &&
        (entry.subjectCode || entry.subjectName) !== selectedSubject
      ) {
        return false;
      }

      if (selectedClass !== "ALL" && entry.className !== selectedClass) {
        return false;
      }

      if (selectedProgram !== "ALL" && entry.program !== selectedProgram) {
        return false;
      }

      if (selectedBranch !== "ALL" && entry.branch !== selectedBranch) {
        return false;
      }

      if (selectedSemester !== "ALL" && entry.semester !== selectedSemester) {
        return false;
      }

      if (
        selectedAcademicYear !== "ALL" &&
        entry.timetableAcademicYear !== selectedAcademicYear
      ) {
        return false;
      }

      if (selectedRoom !== "ALL" && entry.roomNo !== selectedRoom) {
        return false;
      }

      if (selectedDay !== "ALL" && entry.day !== selectedDay) {
        return false;
      }

      if (
        selectedPeriod !== "ALL" &&
        String(entry.period) !== String(selectedPeriod)
      ) {
        return false;
      }

      if (selectedSlotType !== "ALL" && entry.slotType !== selectedSlotType) {
        return false;
      }

      if (
        selectedStatus !== "ALL" &&
        entry.timetableStatus !== selectedStatus
      ) {
        return false;
      }

      if (
        selectedTimetable !== "ALL" &&
        entry.timetableId !== selectedTimetable
      ) {
        return false;
      }

      if (query) {
        const searchable = [
          entry.subjectCode,
          entry.subjectName,
          entry.facultyName,
          entry.className,
          entry.program,
          entry.branch,
          entry.semester,
          entry.roomNo,
          entry.day,
          entry.slotType,
          entry.timetableAcademicYear,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [
    allEntries,
    searchText,
    selectedSubject,
    selectedClass,
    selectedProgram,
    selectedBranch,
    selectedSemester,
    selectedAcademicYear,
    selectedRoom,
    selectedDay,
    selectedPeriod,
    selectedSlotType,
    selectedStatus,
    selectedTimetable,
  ]);

  /* =======================================================
     MASTER PERIODS
  ======================================================= */

  const masterPeriods = useMemo(() => {
    const usedPeriods = new Set(
      filteredEntries.map((entry) => entry.period).filter(Boolean),
    );

    let periods = periodOptions.filter(
      (period) => usedPeriods.has(period.period) || periodOptions.length <= 10,
    );

    if (selectedPeriod !== "ALL") {
      periods = periods.filter(
        (period) => String(period.period) === String(selectedPeriod),
      );
    }

    return periods;
  }, [filteredEntries, periodOptions, selectedPeriod]);

  /* =======================================================
     MASTER DAYS
  ======================================================= */

  const masterDays = useMemo(() => {
    return DAYS.filter((day) => {
      if (selectedDay !== "ALL") {
        return day === selectedDay;
      }

      return filteredEntries.some((entry) => entry.day === day);
    });
  }, [filteredEntries, selectedDay]);

  /* =======================================================
     MASTER GRID
  ======================================================= */

  const masterGrid = useMemo(() => {
    const grid = {};

    masterDays.forEach((day) => {
      grid[day] = {};

      masterPeriods.forEach((period) => {
        grid[day][period.period] = [];
      });
    });

    filteredEntries.forEach((entry) => {
      if (!entry.day || !entry.period) {
        return;
      }

      if (!grid[entry.day]) {
        grid[entry.day] = {};
      }

      if (!grid[entry.day][entry.period]) {
        grid[entry.day][entry.period] = [];
      }

      grid[entry.day][entry.period].push(entry);
    });

    return grid;
  }, [masterDays, masterPeriods, filteredEntries]);

  /* =======================================================
     DISPLAY METADATA
  ======================================================= */

  const displayTimetable = useMemo(() => {
    if (selectedTimetable !== "ALL") {
      const found = timetables.find(
        (item) => getId(item._id) === selectedTimetable,
      );

      if (found) {
        return found;
      }
    }

    if (timetables.length === 1) {
      return timetables[0];
    }

    return timetables[0] || {};
  }, [timetables, selectedTimetable]);

  const displayProgram = getFirst(
    displayTimetable.program,
    filteredEntries[0]?.program,
  );

  const displayBranch = getFirst(
    displayTimetable.branch,
    filteredEntries[0]?.branch,
  );

  const displaySemester = getFirst(
    displayTimetable.semester,
    filteredEntries[0]?.semester,
  );

  const displayAcademicYear = getFirst(
    displayTimetable.academicYear,
    filteredEntries[0]?.timetableAcademicYear,
  );

  const displayRoom = getFirst(
    displayTimetable.roomNo,
    filteredEntries[0]?.roomNo,
  );

  const displayCoordinator = getFirst(
    displayTimetable.classCoordinator,
    filteredEntries[0]?.classCoordinator,
  );

  const displayInstitution =
    displayTimetable.institutionName ||
    "COLLEGE OF ENGINEERING & COMPUTER APPLICATION(CECA)";

  const displayTitle = displayTimetable.timetableTitle || "Time Table";

  const displayIssueDate = displayTimetable.issueDate || "";

  const displayEffectiveFrom = displayTimetable.effectiveFrom || "";

  const displayRevision = displayTimetable.revisionNumber || "1.0";

  const lunchStart = displayTimetable.lunchStartTime || "12:30PM";

  const lunchEnd = displayTimetable.lunchEndTime || "1:20PM";

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const subjects = new Set();

    const classes = new Set();

    const rooms = new Set();

    const days = new Set();

    filteredEntries.forEach((entry) => {
      if (entry.subjectCode || entry.subjectName) {
        subjects.add(entry.subjectCode || entry.subjectName);
      }

      if (entry.className) {
        classes.add(entry.className);
      }

      if (entry.roomNo) {
        rooms.add(entry.roomNo);
      }

      if (entry.day) {
        days.add(entry.day);
      }
    });

    return {
      entries: filteredEntries.length,

      subjects: subjects.size,

      classes: classes.size,

      rooms: rooms.size,

      days: days.size,
    };
  }, [filteredEntries]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchText("");

    setSelectedSubject("ALL");

    setSelectedClass("ALL");

    setSelectedProgram("ALL");

    setSelectedBranch("ALL");

    setSelectedSemester("ALL");

    setSelectedAcademicYear("ALL");

    setSelectedRoom("ALL");

    setSelectedDay("ALL");

    setSelectedPeriod("ALL");

    setSelectedSlotType("ALL");

    setSelectedStatus("ALL");

    setSelectedTimetable("ALL");
  };

  /* =======================================================
     CELL CONTENT
  ======================================================= */

  const renderCellEntries = (entries) => {
    if (!entries || entries.length === 0) {
      return (
        <div className="h-full min-h-[85px] flex items-center justify-center text-gray-300">
          <span className="text-lg">—</span>
        </div>
      );
    }

    return (
      <div className="space-y-2 p-2">
        {entries.map((entry, index) => {
          const subjectKey =
            entry.subjectCode || entry.subjectName || entry.slotType || "OTHER";

          const colors = subjectColors[subjectKey] || {
            background: "#F3F4F6",
            border: "#6B7280",
          };

          const isSpecial =
            entry.slotType !== "subject" && entry.slotType !== "lab";

          return (
            <div
              key={`${entry._id || subjectKey}-${index}`}
              className="rounded-xl border-l-4 px-3 py-2 shadow-sm"
              style={{
                backgroundColor: colors.background,
                borderLeftColor: colors.border,
              }}
            >
              <div className="font-bold text-gray-900 text-sm leading-tight">
                {entry.subjectCode || entry.slotType || "—"}
              </div>

              {!isSpecial && entry.subjectName && (
                <div className="mt-1 text-xs font-medium text-gray-700 leading-tight">
                  {entry.subjectName}
                </div>
              )}

              {entry.className && (
                <div className="mt-1 text-[11px] text-gray-600">
                  {entry.className}
                </div>
              )}

              {entry.roomNo && (
                <div className="text-[11px] text-gray-500">
                  Room: {entry.roomNo}
                </div>
              )}

              {entry.startTime && entry.endTime && (
                <div className="mt-1 text-[10px] text-gray-500">
                  {entry.startTime} - {entry.endTime}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* =======================================================
     EXPORT DATA
  ======================================================= */

  const getExportRows = () => {
    const rows = [];

    masterDays.forEach((day) => {
      masterPeriods.forEach((period) => {
        const entries = masterGrid[day]?.[period.period] || [];

        if (entries.length === 0) {
          rows.push({
            Day: day,

            Period: period.period,

            Time:
              period.startTime && period.endTime
                ? `${period.startTime} - ${period.endTime}`
                : "",

            "Course Code": "",

            "Course Name": "",

            Class: "",

            Program: "",

            Branch: "",

            Semester: "",

            Room: "",

            "Slot Type": "",
          });

          return;
        }

        entries.forEach((entry) => {
          rows.push({
            Day: day,

            Period: period.period,

            Time:
              period.startTime && period.endTime
                ? `${period.startTime} - ${period.endTime}`
                : "",

            "Course Code": entry.subjectCode || "",

            "Course Name": entry.subjectName || "",

            Class: entry.className || "",

            Program: entry.program || "",

            Branch: entry.branch || "",

            Semester: entry.semester || "",

            Room: entry.roomNo || "",

            "Slot Type": entry.slotType || "",
          });
        });
      });
    });

    return rows;
  };

  /* =======================================================
     EXCEL EXPORT
  ======================================================= */

  const exportExcel = async () => {
    setExporting(true);

    try {
      const rows = getExportRows();

      const worksheet = XLSX.utils.json_to_sheet(rows);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Master Time Table");

      XLSX.writeFile(workbook, `${safeFileName(facultyName)}_TimeTable.xlsx`);
    } catch (err) {
      console.error("Excel export error:", err);

      alert("Unable to export Excel file.");
    } finally {
      setExporting(false);
    }
  };

  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const exportCSV = async () => {
    setExporting(true);

    try {
      const rows = getExportRows();

      const worksheet = XLSX.utils.json_to_sheet(rows);

      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      makeDownload(blob, `${safeFileName(facultyName)}_TimeTable.csv`);
    } catch (err) {
      console.error("CSV export error:", err);

      alert("Unable to export CSV file.");
    } finally {
      setExporting(false);
    }
  };

  /* =======================================================
     PDF EXPORT
  ======================================================= */

  const exportPDF = async () => {
    setExporting(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3",
      });

      doc.setFontSize(16);

      doc.text(displayInstitution, 15, 15);

      doc.setFontSize(13);

      doc.text(displayTitle, 15, 23);

      doc.setFontSize(10);

      doc.text(`Faculty: ${facultyName}`, 15, 31);

      doc.text(
        `Program: ${displayProgram || "—"}   Branch: ${
          displayBranch || "—"
        }   Semester: ${displaySemester || "—"}   Academic Year: ${
          displayAcademicYear || "—"
        }`,
        15,
        38,
      );

      const head = [
        [
          "Day / Time",
          ...masterPeriods.map(
            (period) =>
              `P${period.period}\n${period.startTime || ""} - ${
                period.endTime || ""
              }`,
          ),
        ],
      ];

      const body = masterDays.map((day) => {
        return [
          day,

          ...masterPeriods.map((period) => {
            const entries = masterGrid[day]?.[period.period] || [];

            return entries
              .map((entry) => {
                const code = entry.subjectCode || entry.slotType || "";

                const name = entry.subjectName || "";

                const cls = entry.className || "";

                const room = entry.roomNo ? `Room: ${entry.roomNo}` : "";

                return [code, name, cls, room].filter(Boolean).join("\n");
              })
              .join("\n\n");
          }),
        ];
      });

      autoTable(doc, {
        startY: 45,

        head,

        body,

        theme: "grid",

        styles: {
          fontSize: 7,

          cellPadding: 2,

          valign: "middle",
        },

        headStyles: {
          fontSize: 7,

          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 28,
          },
        },

        didParseCell: (data) => {
          if (data.section === "body" && data.column.index > 0) {
            const day = masterDays[data.row.index];

            const period = masterPeriods[data.column.index - 1];

            const entries = masterGrid[day]?.[period.period] || [];

            if (entries.length === 1) {
              const entry = entries[0];

              const key =
                entry.subjectCode || entry.subjectName || entry.slotType;

              const color = subjectColors[key];

              if (color) {
                const hex = color.background.replace("#", "");

                const r = parseInt(hex.substring(0, 2), 16);

                const g = parseInt(hex.substring(2, 4), 16);

                const b = parseInt(hex.substring(4, 6), 16);

                data.cell.styles.fillColor = [r, g, b];
              }
            }
          }
        },
      });

      doc.save(`${safeFileName(facultyName)}_TimeTable.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);

      alert("Unable to export PDF file.");
    } finally {
      setExporting(false);
    }
  };

  /* =======================================================
     WORD EXPORT
  ======================================================= */

  const exportWord = async () => {
    setExporting(true);

    try {
      const headerCells = [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Day / Time",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      ];

      masterPeriods.forEach((period) => {
        headerCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Period ${period.period}`,
                    bold: true,
                  }),
                ],
              }),

              new Paragraph(
                `${period.startTime || ""} - ${period.endTime || ""}`,
              ),
            ],
          }),
        );
      });

      const rows = [
        new TableRow({
          children: headerCells,
        }),
      ];

      masterDays.forEach((day) => {
        const cells = [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: day,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ];

        masterPeriods.forEach((period) => {
          const entries = masterGrid[day]?.[period.period] || [];

          const paragraphs = [];

          if (entries.length === 0) {
            paragraphs.push(new Paragraph("—"));
          } else {
            entries.forEach((entry) => {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: entry.subjectCode || entry.slotType || "—",
                      bold: true,
                    }),
                  ],
                }),
              );

              if (entry.subjectName) {
                paragraphs.push(new Paragraph(entry.subjectName));
              }

              if (entry.className) {
                paragraphs.push(new Paragraph(`Class: ${entry.className}`));
              }

              if (entry.roomNo) {
                paragraphs.push(new Paragraph(`Room: ${entry.roomNo}`));
              }
            });
          }

          cells.push(
            new TableCell({
              children: paragraphs,
            }),
          );
        });

        rows.push(
          new TableRow({
            children: cells,
          }),
        );
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation: "landscape",
                },
              },
            },

            children: [
              new Paragraph({
                text: displayInstitution,

                heading: HeadingLevel.HEADING_1,

                alignment: AlignmentType.CENTER,
              }),

              new Paragraph({
                text: displayTitle,

                heading: HeadingLevel.HEADING_2,

                alignment: AlignmentType.CENTER,
              }),

              new Paragraph({
                text: `Faculty: ${facultyName}`,

                alignment: AlignmentType.CENTER,
              }),

              new Paragraph({
                text: `Program: ${displayProgram || "—"} | Branch: ${
                  displayBranch || "—"
                } | Semester: ${displaySemester || "—"} | Academic Year: ${
                  displayAcademicYear || "—"
                }`,

                alignment: AlignmentType.CENTER,
              }),

              new Paragraph(""),

              new Table({
                rows,

                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
              }),

              new Paragraph(""),

              new Paragraph({
                text: `Lunch Timings: ${lunchStart} - ${lunchEnd}`,

                alignment: AlignmentType.CENTER,
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);

      makeDownload(blob, `${safeFileName(facultyName)}_TimeTable.docx`);
    } catch (err) {
      console.error("Word export error:", err);

      alert("Unable to export Word document.");
    } finally {
      setExporting(false);
    }
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const printTimetable = () => {
    window.print();
  };

  /* =======================================================
     ACTIVE FILTER COUNT
  ======================================================= */

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (selectedSubject !== "ALL") count++;
    if (selectedClass !== "ALL") count++;
    if (selectedProgram !== "ALL") count++;
    if (selectedBranch !== "ALL") count++;
    if (selectedSemester !== "ALL") count++;
    if (selectedAcademicYear !== "ALL") count++;
    if (selectedRoom !== "ALL") count++;
    if (selectedDay !== "ALL") count++;
    if (selectedPeriod !== "ALL") count++;
    if (selectedSlotType !== "ALL") count++;
    if (selectedStatus !== "ALL") count++;
    if (selectedTimetable !== "ALL") count++;
    if (searchText.trim()) count++;

    return count;
  }, [
    selectedSubject,
    selectedClass,
    selectedProgram,
    selectedBranch,
    selectedSemester,
    selectedAcademicYear,
    selectedRoom,
    selectedDay,
    selectedPeriod,
    selectedSlotType,
    selectedStatus,
    selectedTimetable,
    searchText,
  ]);

  if (loading || facultyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />

          <h2 className="text-xl font-bold text-gray-900">
            Loading Your Timetable
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Loading your faculty profile and timetable...
          </p>
        </div>
      </div>
    );
  }

  if (error && !faculty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <FaInfoCircle size={26} />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Unable to Load Timetable
          </h2>

          <p className="mt-3 text-sm text-gray-600">{error}</p>

          <button
            onClick={() => {
              setError("");
              fetchFaculty();
              fetchTimetable();
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <FaRedo />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 print:bg-white">
      <div className="border-b border-gray-200 bg-white print:hidden">
        <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link
                to="/faculty-dashboard"
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
                title="Back to Dashboard"
              >
                <FaArrowLeft />
              </Link>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    FACULTY TIMETABLE
                  </span>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    PERSONAL VIEW
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                  My Time Table
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  View and filter your complete weekly teaching schedule.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setError("");
                  fetchFaculty();
                  fetchTimetable();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <FaRedo />
                Refresh
              </button>

              <button
                onClick={printTimetable}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <FaPrint />
                Print
              </button>

              <div className="relative group">
                <button
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaDownload />
                  Export
                  <FaChevronDown size={11} />
                </button>

                <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 translate-y-1 rounded-2xl border border-gray-100 bg-white p-2 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    onClick={exportExcel}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700"
                  >
                    <FaFileExcel />
                    Excel
                  </button>

                  <button
                    onClick={exportCSV}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <FaTable />
                    CSV
                  </button>

                  <button
                    onClick={exportPDF}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-700"
                  >
                    <FaFilePdf />
                    PDF
                  </button>

                  <button
                    onClick={exportWord}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <FaFileWord />
                    Word
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <div className="mb-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm print:hidden">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <FaUserTie size={25} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Logged-in Faculty
                  </p>

                  <h2 className="mt-1 text-xl font-black text-gray-900">
                    {facultyName}
                  </h2>

                  {faculty?.employeeId && (
                    <p className="mt-1 text-sm text-gray-500">
                      Employee ID:{" "}
                      <span className="font-semibold text-gray-700">
                        {faculty.employeeId}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Classes
                  </p>

                  <p className="mt-1 text-lg font-black text-gray-900">
                    {statistics.classes}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Subjects
                  </p>

                  <p className="mt-1 text-lg font-black text-gray-900">
                    {statistics.subjects}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Periods
                  </p>

                  <p className="mt-1 text-lg font-black text-gray-900">
                    {statistics.entries}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Days
                  </p>

                  <p className="mt-1 text-lg font-black text-gray-900">
                    {statistics.days}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 print:hidden">
            <FaInfoCircle className="mt-0.5 shrink-0" />

            <div className="text-sm">
              <p className="font-bold">Timetable warning</p>

              <p className="mt-1">{error}</p>
            </div>

            <button onClick={() => setError("")} className="ml-auto">
              <FaTimes />
            </button>
          </div>
        )}

        <div className="mb-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm print:hidden">
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FaFilter />
              </div>

              <div>
                <h2 className="font-black text-gray-900">Advanced Filters</h2>

                <p className="text-xs text-gray-500">
                  Combine multiple filters to find exactly the timetable you
                  need.
                </p>
              </div>

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {showFilters ? (
              <FaChevronUp className="text-gray-400" />
            ) : (
              <FaChevronDown className="text-gray-400" />
            )}
          </button>

          {showFilters && (
            <div className="border-t border-gray-100 p-5 sm:p-6">
              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Search
                </label>

                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search subject, class, room, day, program..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* FACULTY - LOCKED */}

                <FilterBox label="Faculty" icon={<FaUserTie />}>
                  <select
                    value={facultyId}
                    disabled
                    className="filter-select cursor-not-allowed bg-gray-100"
                  >
                    <option value={facultyId}>{facultyName}</option>
                  </select>
                </FilterBox>

                {/* SUBJECT */}

                <FilterBox label="Subject" icon={<FaGraduationCap />}>
                  <select
                    value={selectedSubject}
                    onChange={(event) => setSelectedSubject(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Subjects</option>

                    {subjectOptions.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.code
                          ? `${subject.code} - ${subject.name}`
                          : subject.name}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                {/* CLASS */}

                <FilterBox label="Class" icon={<FaChalkboardTeacher />}>
                  <select
                    value={selectedClass}
                    onChange={(event) => setSelectedClass(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Classes</option>

                    {classOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                {/* PROGRAM */}

                <FilterBox label="Program" icon={<FaGraduationCap />}>
                  <select
                    value={selectedProgram}
                    onChange={(event) => setSelectedProgram(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Programs</option>

                    {programOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                {/* BRANCH */}

                <FilterBox label="Branch" icon={<FaLayerGroup />}>
                  <select
                    value={selectedBranch}
                    onChange={(event) => setSelectedBranch(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Branches</option>

                    {branchOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                {/* SEMESTER */}

                <FilterBox label="Semester" icon={<FaCalendarAlt />}>
                  <select
                    value={selectedSemester}
                    onChange={(event) =>
                      setSelectedSemester(event.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="ALL">All Semesters</option>

                    {semesterOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                {/* ACADEMIC YEAR */}

                <FilterBox label="Academic Year" icon={<FaCalendarAlt />}>
                  <select
                    value={selectedAcademicYear}
                    onChange={(event) =>
                      setSelectedAcademicYear(event.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="ALL">All Academic Years</option>

                    {academicYearOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                <FilterBox label="Room" icon={<FaTable />}>
                  <select
                    value={selectedRoom}
                    onChange={(event) => setSelectedRoom(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Rooms</option>

                    {roomOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                <FilterBox label="Day" icon={<FaCalendarAlt />}>
                  <select
                    value={selectedDay}
                    onChange={(event) => setSelectedDay(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Days</option>

                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                {/* PERIOD */}

                <FilterBox label="Period" icon={<FaClock />}>
                  <select
                    value={selectedPeriod}
                    onChange={(event) => setSelectedPeriod(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Periods</option>

                    {periodOptions.map((period) => (
                      <option key={period.period} value={period.period}>
                        {period.label} — {period.startTime} - {period.endTime}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                <FilterBox label="Slot Type" icon={<FaTable />}>
                  <select
                    value={selectedSlotType}
                    onChange={(event) =>
                      setSelectedSlotType(event.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="ALL">All Slot Types</option>

                    {slotTypeOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterBox>

                <FilterBox label="Status" icon={<FaInfoCircle />}>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Statuses</option>

                    {statusOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}

                    {!statusOptions.length && (
                      <>
                        <option value="active">Active</option>

                        <option value="draft">Draft</option>

                        <option value="archived">Archived</option>
                      </>
                    )}
                  </select>
                </FilterBox>

                {timetableOptions.length > 1 && (
                  <FilterBox label="Time Table" icon={<FaTable />}>
                    <select
                      value={selectedTimetable}
                      onChange={(event) =>
                        setSelectedTimetable(event.target.value)
                      }
                      className="filter-select"
                    >
                      <option value="ALL">All Time Tables</option>

                      {timetableOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} — {item.academicYear}
                        </option>
                      ))}
                    </select>
                  </FilterBox>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {filteredEntries.length}
                  </span>{" "}
                  timetable entries.
                </p>

                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  <FaTimes />
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("master")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                viewMode === "master"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <FaTable />
                Master Time Table
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowSubjectLegend((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <FaLayerGroup />

            {showSubjectLegend ? "Hide Subject Colors" : "Show Subject Colors"}
          </button>
        </div>

        <section
          id="master-timetable"
          className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 bg-white p-5 sm:p-7">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                {displayProgram || ". Tech, M.Tech"}
              </p>

              <h2 className="mt-3 text-xl font-black text-gray-900 sm:text-2xl">
                {displayInstitution}
              </h2>

              <h3 className="mt-2 text-lg font-black text-gray-800">
                {displayTitle}
              </h3>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-4 lg:grid-cols-8">
              <MetaItem label="Issue Date" value={displayIssueDate || "—"} />

              <MetaItem
                label="With Effect From"
                value={displayEffectiveFrom || "—"}
              />

              <MetaItem label="Rev No" value={displayRevision} />

              <MetaItem label="Program" value={displayProgram || "—"} />

              <MetaItem label="Branch" value={displayBranch || "—"} />

              <MetaItem label="Semester" value={displaySemester || "—"} />

              <MetaItem
                label="Academic Year"
                value={displayAcademicYear || "—"}
              />

              <MetaItem label="Room No" value={displayRoom || "—"} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Class Coordinator
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  {displayCoordinator || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  Faculty
                </p>

                <p className="mt-1 text-sm font-black text-blue-900">
                  {facultyName}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-blue-100 bg-blue-50 px-4 py-3 text-center text-xs font-semibold text-blue-700 lg:hidden">
            Swipe horizontally to view all periods →
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="sticky left-0 z-30 min-w-[145px] border border-gray-700 bg-gray-900 px-3 py-3 text-left text-xs font-black uppercase tracking-wider">
                    Day / Time
                  </th>

                  {masterPeriods.map((period) => (
                    <th
                      key={period.period}
                      className="min-w-[130px] border border-gray-700 px-2 py-3 text-center"
                    >
                      <div className="text-xs font-black">
                        Period {period.period}
                      </div>

                      <div className="mt-1 text-[10px] font-medium text-gray-300">
                        {period.startTime || "—"} - {period.endTime || "—"}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {masterDays.map((day, dayIndex) => (
                  <tr
                    key={day}
                    className={dayIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <th className="sticky left-0 z-20 min-w-[145px] border border-gray-200 bg-white px-3 py-3 text-left align-top">
                      <div className="font-black text-gray-900">{day}</div>

                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Faculty Schedule
                      </div>
                    </th>

                    {masterPeriods.map((period) => (
                      <td
                        key={`${day}-${period.period}`}
                        className="h-[115px] min-w-[130px] border border-gray-200 p-0 align-top"
                      >
                        {renderCellEntries(
                          masterGrid[day]?.[period.period] || [],
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {masterDays.length === 0 && (
                  <tr>
                    <td
                      colSpan={masterPeriods.length + 1}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                        <FaCalendarAlt size={24} />
                      </div>

                      <h3 className="mt-4 font-black text-gray-900">
                        No timetable entries found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing or clearing your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showSubjectLegend && subjectOptions.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-gray-900">
                    Subject Color Legend
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    The same subject always uses the same color.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {subjectOptions.map((subject) => {
                  const color = subjectColors[subject.value];

                  return (
                    <div
                      key={subject.value}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2"
                    >
                      <span
                        className="h-3 w-3 rounded-full border-2"
                        style={{
                          backgroundColor: color?.background || "#F3F4F6",

                          borderColor: color?.border || "#6B7280",
                        }}
                      />

                      <span className="text-xs font-bold text-gray-800">
                        {subject.code || subject.name}
                      </span>

                      {subject.code && subject.name && (
                        <span className="hidden text-[11px] text-gray-500 sm:inline">
                          — {subject.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 bg-white p-5 sm:p-6">
            <h3 className="text-base font-black text-gray-900">
              Course Details
            </h3>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-[850px] w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="border border-gray-700 px-3 py-3 text-left text-xs font-black">
                      Course Code
                    </th>

                    <th className="border border-gray-700 px-3 py-3 text-left text-xs font-black">
                      Course Name
                    </th>

                    <th className="border border-gray-700 px-3 py-3 text-left text-xs font-black">
                      L-T-P
                    </th>

                    <th className="border border-gray-700 px-3 py-3 text-left text-xs font-black">
                      Total Credits
                    </th>

                    <th className="border border-gray-700 px-3 py-3 text-left text-xs font-black">
                      Faculty Name
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {subjectOptions.map((subject, index) => {
                    const representative = filteredEntries.find(
                      (entry) =>
                        (entry.subjectCode || entry.subjectName) ===
                        subject.value,
                    );

                    const colors = subjectColors[subject.value];

                    const ltp = getFirst(
                      representative?.ltp,
                      representative?.l_t_p,
                      representative?.LTP,
                    );

                    const credits = getFirst(
                      representative?.credits,
                      representative?.totalCredits,
                      representative?.credit,
                    );

                    return (
                      <tr
                        key={subject.value}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-200 px-3 py-3 text-sm font-black">
                          <span
                            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: colors?.border || "#6B7280",
                            }}
                          />

                          {subject.code || "—"}
                        </td>

                        <td className="border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700">
                          {subject.name || "—"}
                        </td>

                        <td className="border border-gray-200 px-3 py-3 text-sm font-bold text-gray-700">
                          {ltp || "—"}
                        </td>

                        <td className="border border-gray-200 px-3 py-3 text-sm font-bold text-gray-700">
                          {credits || "—"}
                        </td>

                        <td className="border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700">
                          {facultyName}
                        </td>
                      </tr>
                    );
                  })}

                  {subjectOptions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No course details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-gray-600">
                Lunch Timings shall be from{" "}
                <span className="font-black text-gray-900">{lunchStart}</span>{" "}
                to <span className="font-black text-gray-900">{lunchEnd}</span>
              </div>

              <div className="text-xs font-medium text-gray-400">
                Personal Faculty Timetable
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>
        {`
          .filter-select {
            width: 100%;
            border-radius: 0.875rem;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            padding: 0.7rem 2.25rem 0.7rem 0.9rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            outline: none;
          }

          .filter-select:focus {
            border-color: #3b82f6;
            background: white;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
          }

          @media print {
            body {
              background: white !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            #master-timetable {
              box-shadow: none !important;
              border: 1px solid #d1d5db !important;
              border-radius: 0 !important;
            }

            @page {
              size: landscape;
              margin: 8mm;
            }
          }

          * {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }

          *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          *::-webkit-scrollbar-track {
            background: transparent;
          }

          *::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 999px;
          }

          *::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
    </div>
  );
}

function FilterBox({ label, icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
        <span className="text-gray-400">{icon}</span>

        {label}
      </label>

      {children}
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-gray-800">{value || "—"}</p>
    </div>
  );
}

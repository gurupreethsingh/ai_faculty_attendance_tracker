import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaBookOpen,
  FaBuilding,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaCode,
  FaDownload,
  FaExclamationCircle,
  FaFilter,
  FaInfoCircle,
  FaRedo,
  FaSearch,
  FaTable,
  FaTimes,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import globalBackendRoute from "../../config/Config";

const API_BASE_URL = `${globalBackendRoute}/api`;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const STATUS_OPTIONS = ["All", "Active", "Cancelled", "Completed", "Pending"];

const DEFAULT_PERIODS = [
  {
    number: 1,
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    number: 2,
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    number: 3,
    startTime: "11:00",
    endTime: "12:00",
  },
  {
    number: 4,
    startTime: "12:00",
    endTime: "13:00",
  },
  {
    number: 5,
    startTime: "13:00",
    endTime: "14:00",
  },
  {
    number: 6,
    startTime: "14:00",
    endTime: "15:00",
  },
  {
    number: 7,
    startTime: "15:00",
    endTime: "16:00",
  },
  {
    number: 8,
    startTime: "16:00",
    endTime: "17:00",
  },
];

const safeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const getToken = () => {
  const possibleKeys = [
    "travel_token",
    "token",
    "accessToken",
    "access_token",
    "jwt",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value.replace(/^Bearer\s+/i, "").trim();
    }
  }

  return "";
};

const getAuthHeaders = () => {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/* -------------------------------------------------------------------------- */
/*                             FACULTY HELPERS                                */
/* -------------------------------------------------------------------------- */

const getObjectId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    if (value.$oid) {
      return safeString(value.$oid);
    }

    if (value._id) {
      return getObjectId(value._id);
    }

    if (value.id) {
      return getObjectId(value.id);
    }
  }

  return "";
};

const getPersonName = (person) => {
  if (!person) {
    return "";
  }

  if (typeof person === "string") {
    return person.trim();
  }

  if (typeof person !== "object") {
    return "";
  }

  const directNameFields = [
    "name",
    "fullName",
    "facultyName",
    "displayName",
    "username",
    "userName",
  ];

  for (const field of directNameFields) {
    const value = safeString(person[field]);

    if (value) {
      return value;
    }
  }

  const firstName = safeString(
    person.firstName || person.firstname || person.first_name || person.fname,
  );

  const middleName = safeString(
    person.middleName ||
      person.middlename ||
      person.middle_name ||
      person.mname,
  );

  const lastName = safeString(
    person.lastName || person.lastname || person.last_name || person.lname,
  );

  const combinedName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (combinedName) {
    return combinedName;
  }

  if (person.user) {
    const nestedUserName = getPersonName(person.user);

    if (nestedUserName) {
      return nestedUserName;
    }
  }

  if (person.userId && typeof person.userId === "object") {
    const nestedUserName = getPersonName(person.userId);

    if (nestedUserName) {
      return nestedUserName;
    }
  }

  return "";
};

const getFacultyId = (faculty) => {
  if (!faculty) {
    return "";
  }

  if (typeof faculty === "string") {
    return "";
  }

  if (typeof faculty !== "object") {
    return "";
  }

  const possibleIdFields = [
    "_id",
    "id",
    "facultyId",
    "facultyID",
    "faculty_id",
  ];

  for (const field of possibleIdFields) {
    const id = getObjectId(faculty[field]);

    if (id) {
      return id;
    }
  }

  if (faculty.user) {
    const nestedUserId = getFacultyId(faculty.user);

    if (nestedUserId) {
      return nestedUserId;
    }
  }

  if (faculty.userId && typeof faculty.userId === "object") {
    const nestedUserId = getFacultyId(faculty.userId);

    if (nestedUserId) {
      return nestedUserId;
    }
  }

  return "";
};

const extractFacultyArray = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload !== "object") {
    return [];
  }

  const possibleKeys = [
    "faculties",
    "faculty",
    "data",
    "results",
    "records",
    "items",
    "users",
  ];

  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  if (payload.data && typeof payload.data === "object") {
    const nested = extractFacultyArray(payload.data);

    if (nested.length) {
      return nested;
    }
  }

  return [];
};

const normalizeFaculty = (faculty) => {
  if (!faculty) {
    return null;
  }

  const id = getFacultyId(faculty);
  const name = getPersonName(faculty);

  if (!id && !name) {
    return null;
  }

  return {
    id,
    name,
    raw: faculty,
  };
};

const normalizeFacultyList = (payload) => {
  const array = extractFacultyArray(payload);

  const result = [];
  const seen = new Set();

  array.forEach((faculty) => {
    const normalized = normalizeFaculty(faculty);

    if (!normalized) {
      return;
    }

    const key =
      normalized.id || normalized.name.toLowerCase().replace(/\s+/g, " ");

    if (!key || seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(normalized);
  });

  return result;
};

/* -------------------------------------------------------------------------- */
/*                           TIMETABLE HELPERS                                */
/* -------------------------------------------------------------------------- */

const getEntryFacultyId = (entry) => {
  if (!entry) {
    return "";
  }

  const possibleFields = [
    "facultyId",
    "facultyID",
    "faculty_id",
    "teacherId",
    "teacherID",
  ];

  for (const field of possibleFields) {
    const id = getObjectId(entry[field]);

    if (id) {
      return id;
    }
  }

  if (entry.faculty && typeof entry.faculty === "object") {
    const id = getFacultyId(entry.faculty);

    if (id) {
      return id;
    }
  }

  return "";
};

const getEntryFacultyName = (entry) => {
  if (!entry) {
    return "";
  }

  const directFields = [
    "facultyName",
    "faculty_name",
    "teacherName",
    "teacher_name",
    "facultyFullName",
    "facultyDisplayName",
  ];

  for (const field of directFields) {
    const value = safeString(entry[field]);

    if (value) {
      return value;
    }
  }

  if (entry.faculty && typeof entry.faculty === "object") {
    const name = getPersonName(entry.faculty);

    if (name) {
      return name;
    }
  }

  if (entry.user && typeof entry.user === "object") {
    const name = getPersonName(entry.user);

    if (name) {
      return name;
    }
  }

  return "";
};

const getEntrySubjectCode = (entry) => {
  return safeString(
    entry?.subjectCode ||
      entry?.courseCode ||
      entry?.code ||
      entry?.subject?.subjectCode ||
      entry?.subject?.code,
  );
};

const getEntrySubjectName = (entry) => {
  return safeString(
    entry?.subjectName ||
      entry?.courseName ||
      entry?.subject?.subjectName ||
      entry?.subject?.name ||
      entry?.subject?.courseName,
  );
};

const getEntryClassName = (entry) => {
  return safeString(
    entry?.className ||
      entry?.class ||
      entry?.class_name ||
      entry?.batch ||
      entry?.section,
  );
};

const getEntryRoom = (entry) => {
  return safeString(
    entry?.roomNo || entry?.room || entry?.roomNumber || entry?.room_no,
  );
};

const getEntryDay = (entry) => {
  return safeString(entry?.day || entry?.weekday);
};

const getEntryPeriod = (entry) => {
  const value =
    entry?.period ??
    entry?.periodNumber ??
    entry?.periodNo ??
    entry?.period_number;

  if (value === undefined || value === null || value === "") {
    return "";
  }

  return String(value);
};

const getEntrySlotType = (entry) => {
  return safeString(
    entry?.slotType || entry?.slot_type || entry?.type || entry?.sessionType,
  );
};

const getEntryStatus = (entry) => {
  const value = safeString(
    entry?.status || entry?.classStatus || entry?.slotStatus,
  );

  if (!value) {
    return "Active";
  }

  return value;
};

const getEntryLtp = (entry) => {
  return safeString(
    entry?.ltp ||
      entry?.LTP ||
      entry?.l_t_p ||
      entry?.lTp ||
      entry?.lectureTutorialPractical,
  );
};

const getEntryCredits = (entry) => {
  const value =
    entry?.totalCredits ??
    entry?.credits ??
    entry?.credit ??
    entry?.courseCredits;

  return value === undefined || value === null || value === ""
    ? ""
    : String(value);
};

const getEntryPeriodNumber = (entry) => {
  const period = getEntryPeriod(entry);

  if (!period) {
    return "";
  }

  const match = String(period).match(/\d+/);

  if (match) {
    return Number(match[0]);
  }

  return Number(period) || "";
};

const normalizeTimetableArray = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload !== "object") {
    return [];
  }

  const possibleKeys = [
    "timetables",
    "timetable",
    "data",
    "results",
    "records",
    "items",
  ];

  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  if (payload.data && typeof payload.data === "object") {
    const nested = normalizeTimetableArray(payload.data);

    if (nested.length) {
      return nested;
    }
  }

  return [];
};

const flattenTimetableDocument = (document) => {
  if (!document || typeof document !== "object") {
    return [];
  }

  /*
   * If this already looks like an individual timetable entry,
   * return it directly.
   */
  const looksLikeEntry =
    document.day ||
    document.period ||
    document.periodNumber ||
    document.subjectCode ||
    document.subjectName ||
    document.facultyName ||
    document.className;

  if (looksLikeEntry) {
    return [document];
  }

  const possibleEntryArrays = [
    document.entries,
    document.schedule,
    document.slots,
    document.timetableEntries,
    document.timeTableEntries,
    document.rows,
  ];

  for (const entries of possibleEntryArrays) {
    if (Array.isArray(entries)) {
      return entries.map((entry) => ({
        ...entry,

        facultyId:
          entry.facultyId ||
          entry.facultyID ||
          document.facultyId ||
          document.facultyID,

        facultyName: entry.facultyName || document.facultyName,

        className: entry.className || document.className,

        roomNo: entry.roomNo || document.roomNo,

        program: entry.program || document.program,

        branch: entry.branch || document.branch,

        semester: entry.semester || document.semester,

        academicYear: entry.academicYear || document.academicYear,
      }));
    }
  }

  return [document];
};

const buildTimetableEntries = (payload) => {
  const documents = normalizeTimetableArray(payload);

  const entries = [];

  documents.forEach((document) => {
    const flattened = flattenTimetableDocument(document);

    flattened.forEach((entry) => {
      entries.push(entry);
    });
  });

  return entries;
};

/* -------------------------------------------------------------------------- */
/*                              FILTER SELECT                                 */
/* -------------------------------------------------------------------------- */

const FilterSelect = ({
  label,
  value,
  onChange,
  options = [],
  icon,
  disabled = false,
}) => {
  const normalizedOptions = Array.from(
    new Set(
      (options || [])
        .map((option) => {
          if (option === null || option === undefined) {
            return "";
          }

          if (typeof option === "object") {
            return safeString(
              option.label || option.name || option.value || option.id,
            );
          }

          return safeString(option);
        })
        .filter(Boolean),
    ),
  );

  return (
    <div className="min-w-0">
      <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
        <span className="text-indigo-500">{icon}</span>
        {label}
      </label>

      <div className="relative">
        <select
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">All {label}s</option>

          {normalizedOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            COLOR FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */

const SUBJECT_BACKGROUNDS = [
  "#eef2ff",
  "#ecfdf5",
  "#eff6ff",
  "#fff7ed",
  "#fdf2f8",
  "#f5f3ff",
  "#ecfeff",
  "#fefce8",
  "#f0fdf4",
  "#fff1f2",
  "#f8fafc",
  "#f0fdfa",
];

const SUBJECT_BORDERS = [
  "#6366f1",
  "#10b981",
  "#0ea5e9",
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#eab308",
  "#22c55e",
  "#f43f5e",
  "#64748b",
  "#14b8a6",
];

const stringHash = (value = "") => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const getSubjectKey = (subjectCode, subjectName) => {
  return (
    safeString(subjectCode) || safeString(subjectName) || "unknown-subject"
  );
};

const getSubjectColor = (subjectCode, subjectName) => {
  const key = getSubjectKey(subjectCode, subjectName);
  const index = stringHash(key) % SUBJECT_BACKGROUNDS.length;

  return SUBJECT_BACKGROUNDS[index];
};

const getSubjectBorderColor = (subjectCode, subjectName) => {
  const key = getSubjectKey(subjectCode, subjectName);
  const index = stringHash(key) % SUBJECT_BORDERS.length;

  return SUBJECT_BORDERS[index];
};

/* -------------------------------------------------------------------------- */
/*                             MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

const AllTimeTables = () => {
  const [timetables, setTimetables] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [facultyLoading, setFacultyLoading] = useState(true);

  const [error, setError] = useState("");
  const [facultyError, setFacultyError] = useState("");

  const [showFilters, setShowFilters] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    faculty: "",
    subject: "",
    className: "",
    program: "",
    branch: "",
    semester: "",
    academicYear: "",
    roomNo: "",
    day: "",
    period: "",
    slotType: "",
    status: "",
  });

  const [masterInfo, setMasterInfo] = useState({
    institutionName: "Institution Name",
    timetableTitle: "MASTER TIME TABLE",
    issueDate: "",
    effectiveFrom: "",
    revisionNumber: "",
    academicYear: "",
    program: "",
    branch: "",
    semester: "",
    roomNo: "",
    classCoordinator: "",
    lunchStartTime: "13:00",
    lunchEndTime: "14:00",
  });

  const [masterPeriods, setMasterPeriods] = useState(DEFAULT_PERIODS);

  /* ------------------------------------------------------------------------ */
  /*                         LOAD ALL TIMETABLES                              */
  /* ------------------------------------------------------------------------ */

  const loadTimetables = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/timetable/get-all-timetables`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        },
      );

      const entries = buildTimetableEntries(response?.data);

      setTimetables(entries);

      console.log("[AllTimeTables] Timetable API response:", response?.data);

      console.log("[AllTimeTables] Normalized timetable entries:", entries);

      /*
       * Try to get master information from the first timetable document.
       */
      const documents = normalizeTimetableArray(response?.data);

      const firstDocument = documents[0] || {};
      const firstEntry = entries[0] || {};

      const source = {
        ...firstDocument,
        ...firstEntry,
      };

      setMasterInfo((previous) => ({
        institutionName:
          source.institutionName ||
          source.collegeName ||
          source.instituteName ||
          source.institution ||
          previous.institutionName,

        timetableTitle:
          source.timetableTitle ||
          source.title ||
          source.name ||
          previous.timetableTitle,

        issueDate: source.issueDate || source.issuedDate || previous.issueDate,

        effectiveFrom:
          source.effectiveFrom ||
          source.withEffectFrom ||
          source.effectiveDate ||
          previous.effectiveFrom,

        revisionNumber:
          source.revisionNumber ||
          source.revNo ||
          source.revisionNo ||
          previous.revisionNumber,

        academicYear:
          source.academicYear || source.academic_year || previous.academicYear,

        program: source.program || source.programName || previous.program,

        branch: source.branch || source.branchName || previous.branch,

        semester: source.semester || source.sem || previous.semester,

        roomNo: source.roomNo || source.roomNumber || previous.roomNo,

        classCoordinator:
          source.classCoordinator ||
          source.coordinator ||
          source.classCoordinatorName ||
          previous.classCoordinator,

        lunchStartTime:
          source.lunchStartTime || source.lunchStart || previous.lunchStartTime,

        lunchEndTime:
          source.lunchEndTime || source.lunchEnd || previous.lunchEndTime,
      }));

      /*
       * If the backend stores period configuration in the timetable,
       * use it. Otherwise retain DEFAULT_PERIODS.
       */
      const periods =
        firstDocument.periods ||
        firstDocument.timePeriods ||
        firstDocument.slots ||
        firstDocument.periodConfig;

      if (Array.isArray(periods) && periods.length) {
        const normalizedPeriods = periods
          .map((period, index) => {
            if (typeof period === "number" || typeof period === "string") {
              return {
                number: Number(period) || index + 1,
                startTime: "",
                endTime: "",
              };
            }

            return {
              number:
                Number(
                  period.number ||
                    period.period ||
                    period.periodNumber ||
                    index + 1,
                ) || index + 1,

              startTime: period.startTime || period.start || period.from || "",

              endTime: period.endTime || period.end || period.to || "",
            };
          })
          .filter((period) => period.number);

        if (normalizedPeriods.length) {
          setMasterPeriods(normalizedPeriods);
        }
      }
    } catch (requestError) {
      console.error("[AllTimeTables] Failed to load timetables:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load timetables.",
      );

      setTimetables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                           LOAD ALL FACULTIES                             */
  /* ------------------------------------------------------------------------ */

  const loadFaculties = useCallback(async () => {
    try {
      setFacultyLoading(true);
      setFacultyError("");

      const response = await axios.get(
        `${API_BASE_URL}/faculty/get-all-faculties`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        },
      );

      console.log("[AllTimeTables] Faculty API response:", response?.data);

      /*
       * THIS IS THE IMPORTANT FIX.
       *
       * Do not assume that response.data itself is the array.
       *
       * Your backend may return:
       *
       * {
       *   faculties: [...]
       * }
       *
       * OR
       *
       * {
       *   data: [...]
       * }
       *
       * OR
       *
       * {
       *   success: true,
       *   data: {
       *      faculties: [...]
       *   }
       * }
       *
       * etc.
       */
      const normalized = normalizeFacultyList(response?.data);

      console.log("[AllTimeTables] Normalized faculties from API:", normalized);

      if (normalized.length) {
        setFacultyList(normalized);
        return;
      }

      /*
       * The API returned successfully but the frontend could not
       * understand the response. Do NOT immediately conclude that
       * there are no faculties.
       *
       * The timetable itself may contain faculty names.
       */
      setFacultyList([]);

      setFacultyError(
        "Faculty API returned data, but the faculty records could not be read. Faculty names from the timetable will be used as a fallback.",
      );
    } catch (requestError) {
      console.error("[AllTimeTables] Failed to load faculties:", requestError);

      setFacultyList([]);

      const status = requestError?.response?.status;

      if (status === 401) {
        setFacultyError(
          "You are not authorized to load the faculty list. Please log in again.",
        );
      } else {
        setFacultyError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load the faculty list. Faculty names from the timetable will be used as a fallback.",
        );
      }
    } finally {
      setFacultyLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimetables();
    loadFaculties();
  }, [loadTimetables, loadFaculties]);

  /* ------------------------------------------------------------------------ */
  /*                       FACULTY FALLBACK FROM TIMETABLE                    */
  /* ------------------------------------------------------------------------ */

  const timetableFacultyList = useMemo(() => {
    const map = new Map();

    timetables.forEach((entry) => {
      const name = getEntryFacultyName(entry);
      const id = getEntryFacultyId(entry);

      if (!name && !id) {
        return;
      }

      const normalizedName = name.toLowerCase().trim();

      const key = id || normalizedName;

      if (!key) {
        return;
      }

      if (!map.has(key)) {
        map.set(key, {
          id,
          name,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [timetables]);

  const combinedFacultyList = useMemo(() => {
    const map = new Map();

    /*
     * First add actual Faculty API records.
     */
    facultyList.forEach((faculty) => {
      const id = safeString(faculty.id);
      const name = safeString(faculty.name);

      if (!id && !name) {
        return;
      }

      const key = id || name.toLowerCase();

      map.set(key, {
        id,
        name,
      });
    });

    /*
     * Then add faculty names found directly inside timetable entries.
     *
     * This is what allows "Gurupreeth Singh" to appear even when
     * the Faculty API response shape is different.
     */
    timetableFacultyList.forEach((faculty) => {
      const id = safeString(faculty.id);
      const name = safeString(faculty.name);

      if (!id && !name) {
        return;
      }

      const nameKey = name.toLowerCase();

      const alreadyExists = Array.from(map.values()).some(
        (existing) =>
          (id && existing.id === id) ||
          (name && existing.name.toLowerCase() === nameKey),
      );

      if (!alreadyExists) {
        map.set(id || nameKey, {
          id,
          name,
        });
      }
    });

    return Array.from(map.values())
      .filter((faculty) => faculty.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [facultyList, timetableFacultyList]);

  const facultyOptions = useMemo(() => {
    return combinedFacultyList.map((faculty) => faculty.name);
  }, [combinedFacultyList]);

  /* ------------------------------------------------------------------------ */
  /*                             FILTER OPTIONS                               */
  /* ------------------------------------------------------------------------ */

  const filterOptions = useMemo(() => {
    const unique = (values) =>
      Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
        String(a).localeCompare(String(b)),
      );

    return {
      subjects: unique(timetables.map((entry) => getEntrySubjectCode(entry))),

      classes: unique(timetables.map((entry) => getEntryClassName(entry))),

      programs: unique(
        timetables.map((entry) =>
          safeString(entry.program || entry.programName),
        ),
      ),

      branches: unique(
        timetables.map((entry) => safeString(entry.branch || entry.branchName)),
      ),

      semesters: unique(
        timetables.map((entry) => safeString(entry.semester || entry.sem)),
      ),

      academicYears: unique(
        timetables.map((entry) =>
          safeString(entry.academicYear || entry.academic_year),
        ),
      ),

      rooms: unique(timetables.map((entry) => getEntryRoom(entry))),

      periods: Array.from(
        new Map(
          timetables
            .map((entry) => {
              const number = getEntryPeriodNumber(entry);

              if (!number) {
                return null;
              }

              return [
                number,
                {
                  number,
                  startTime: entry.periodStartTime || entry.startTime || "",
                  endTime: entry.periodEndTime || entry.endTime || "",
                },
              ];
            })
            .filter(Boolean),
        ).values(),
      ).sort((a, b) => a.number - b.number),

      slotTypes: unique(timetables.map((entry) => getEntrySlotType(entry))),

      statuses: unique(timetables.map((entry) => getEntryStatus(entry))),
    };
  }, [timetables]);

  const subjectsForFilter = useMemo(() => {
    const codes = new Set();

    timetables.forEach((entry) => {
      const code = getEntrySubjectCode(entry);
      const name = getEntrySubjectName(entry);

      if (code) {
        codes.add(code);
      } else if (name) {
        codes.add(name);
      }
    });

    return Array.from(codes).sort((a, b) => a.localeCompare(b));
  }, [timetables]);

  /* ------------------------------------------------------------------------ */
  /*                           FILTERED ENTRIES                               */
  /* ------------------------------------------------------------------------ */

  const filteredEntries = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return timetables.filter((entry) => {
      const facultyId = getEntryFacultyId(entry);
      const facultyName = getEntryFacultyName(entry);

      const subjectCode = getEntrySubjectCode(entry);
      const subjectName = getEntrySubjectName(entry);
      const className = getEntryClassName(entry);
      const room = getEntryRoom(entry);
      const day = getEntryDay(entry);
      const period = getEntryPeriod(entry);
      const slotType = getEntrySlotType(entry);
      const status = getEntryStatus(entry);

      const program = safeString(entry.program || entry.programName);

      const branch = safeString(entry.branch || entry.branchName);

      const semester = safeString(entry.semester || entry.sem);

      const academicYear = safeString(
        entry.academicYear || entry.academic_year,
      );

      /* Faculty */
      if (filters.faculty) {
        const selectedFaculty = combinedFacultyList.find(
          (faculty) =>
            faculty.name === filters.faculty || faculty.id === filters.faculty,
        );

        if (selectedFaculty) {
          const selectedId = safeString(selectedFaculty.id);
          const selectedName = safeString(selectedFaculty.name).toLowerCase();

          const entryName = facultyName.toLowerCase();

          const facultyMatches =
            (selectedId && facultyId && selectedId === facultyId) ||
            (selectedName && entryName && selectedName === entryName);

          if (!facultyMatches) {
            return false;
          }
        } else if (
          facultyName.toLowerCase() !== filters.faculty.toLowerCase()
        ) {
          return false;
        }
      }

      /* Subject */
      if (filters.subject) {
        const subjectMatches =
          subjectCode === filters.subject || subjectName === filters.subject;

        if (!subjectMatches) {
          return false;
        }
      }

      /* Class */
      if (filters.className && className !== filters.className) {
        return false;
      }

      /* Program */
      if (filters.program && program !== filters.program) {
        return false;
      }

      /* Branch */
      if (filters.branch && branch !== filters.branch) {
        return false;
      }

      /* Semester */
      if (filters.semester && semester !== filters.semester) {
        return false;
      }

      /* Academic Year */
      if (filters.academicYear && academicYear !== filters.academicYear) {
        return false;
      }

      /* Room */
      if (filters.roomNo && room !== filters.roomNo) {
        return false;
      }

      /* Day */
      if (filters.day && day.toLowerCase() !== filters.day.toLowerCase()) {
        return false;
      }

      /* Period */
      if (
        filters.period &&
        String(getEntryPeriodNumber(entry)) !== String(filters.period)
      ) {
        return false;
      }

      /* Slot type */
      if (filters.slotType && slotType !== filters.slotType) {
        return false;
      }

      /* Status */
      if (filters.status) {
        if (status.toLowerCase() !== filters.status.toLowerCase()) {
          return false;
        }
      }

      /* Search */
      if (search) {
        const searchableText = [
          facultyName,
          subjectCode,
          subjectName,
          className,
          room,
          day,
          period,
          slotType,
          status,
          program,
          branch,
          semester,
          academicYear,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [timetables, filters, searchTerm, combinedFacultyList]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(searchTerm.trim()) || Object.values(filters).some(Boolean);
  }, [filters, searchTerm]);

  /* ------------------------------------------------------------------------ */
  /*                              STATISTICS                                  */
  /* ------------------------------------------------------------------------ */

  const statistics = useMemo(() => {
    const subjects = new Set();
    const faculties = new Set();
    const classes = new Set();
    const rooms = new Set();

    filteredEntries.forEach((entry) => {
      const subject = getEntrySubjectCode(entry) || getEntrySubjectName(entry);

      const faculty = getEntryFacultyId(entry) || getEntryFacultyName(entry);

      const className = getEntryClassName(entry);
      const room = getEntryRoom(entry);

      if (subject) {
        subjects.add(subject);
      }

      if (faculty) {
        faculties.add(faculty);
      }

      if (className) {
        classes.add(className);
      }

      if (room) {
        rooms.add(room);
      }
    });

    const timetableIds = new Set(
      filteredEntries
        .map((entry) => getObjectId(entry._id) || getObjectId(entry.id))
        .filter(Boolean),
    );

    return {
      entries: filteredEntries.length,
      subjects: subjects.size,
      faculties: faculties.size,
      classes: classes.size,
      rooms: rooms.size,
      timetables:
        timetableIds.size || filteredEntries.length
          ? timetableIds.size || filteredEntries.length
          : 0,
    };
  }, [filteredEntries]);

  /* ------------------------------------------------------------------------ */
  /*                              MASTER PERIODS                              */
  /* ------------------------------------------------------------------------ */

  const periodsForMaster = useMemo(() => {
    if (filterOptions.periods.length) {
      return filterOptions.periods;
    }

    return masterPeriods;
  }, [filterOptions.periods, masterPeriods]);

  /* ------------------------------------------------------------------------ */
  /*                             MASTER TABLE                                 */
  /* ------------------------------------------------------------------------ */

  const masterTable = useMemo(() => {
    const table = {};

    DAYS.forEach((day) => {
      table[day] = {};
    });

    filteredEntries.forEach((entry) => {
      const day = getEntryDay(entry);
      const period = getEntryPeriodNumber(entry);

      if (!day || !period) {
        return;
      }

      const matchingDay = DAYS.find(
        (item) => item.toLowerCase() === day.toLowerCase(),
      );

      if (!matchingDay) {
        return;
      }

      if (!table[matchingDay][period]) {
        table[matchingDay][period] = [];
      }

      table[matchingDay][period].push(entry);
    });

    return table;
  }, [filteredEntries]);

  /* ------------------------------------------------------------------------ */
  /*                        SELECTED FACULTY NAME                             */
  /* ------------------------------------------------------------------------ */

  const selectedFacultyName = useMemo(() => {
    if (!filters.faculty) {
      return "";
    }

    const faculty = combinedFacultyList.find(
      (item) => item.id === filters.faculty || item.name === filters.faculty,
    );

    return faculty?.name || filters.faculty;
  }, [filters.faculty, combinedFacultyList]);

  /* ------------------------------------------------------------------------ */
  /*                              RESET FILTERS                               */
  /* ------------------------------------------------------------------------ */

  const resetFilters = () => {
    setFilters({
      faculty: "",
      subject: "",
      className: "",
      program: "",
      branch: "",
      semester: "",
      academicYear: "",
      roomNo: "",
      day: "",
      period: "",
      slotType: "",
      status: "",
    });

    setSearchTerm("");
  };

  /* ------------------------------------------------------------------------ */
  /*                         RENDER MASTER CELL                               */
  /* ------------------------------------------------------------------------ */

  const renderMasterCell = (entries, periodNumber) => {
    if (!entries || !entries.length) {
      return (
        <td
          key={`${periodNumber}-empty`}
          className="border border-slate-300 bg-white p-2 align-top"
        >
          <div className="min-h-[110px]"></div>
        </td>
      );
    }

    return (
      <td
        key={`${periodNumber}-${entries
          .map(
            (entry) =>
              getObjectId(entry._id) ||
              getEntrySubjectCode(entry) ||
              Math.random(),
          )
          .join("-")}`}
        className="border border-slate-300 bg-white p-2 align-top"
      >
        <div className="flex min-h-[110px] flex-col gap-2">
          {entries.map((entry, index) => {
            const subjectCode = getEntrySubjectCode(entry);

            const subjectName = getEntrySubjectName(entry);

            const facultyName = getEntryFacultyName(entry);

            const className = getEntryClassName(entry);

            const room = getEntryRoom(entry);

            const slotType = getEntrySlotType(entry);

            const status = getEntryStatus(entry);

            const background = getSubjectColor(subjectCode, subjectName);

            const border = getSubjectBorderColor(subjectCode, subjectName);

            const cancelled =
              status.toLowerCase() === "cancelled" ||
              status.toLowerCase() === "canceled";

            return (
              <div
                key={
                  getObjectId(entry._id) ||
                  `${subjectCode}-${className}-${index}`
                }
                className="rounded-xl border p-2.5 shadow-sm"
                style={{
                  backgroundColor: cancelled ? "#fff7ed" : background,
                  borderLeft: `4px solid ${cancelled ? "#f97316" : border}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-800">
                      {subjectCode || subjectName || slotType || "—"}
                    </div>

                    {subjectName && subjectName !== subjectCode && (
                      <div className="mt-0.5 text-[10px] font-bold leading-4 text-slate-600">
                        {subjectName}
                      </div>
                    )}
                  </div>

                  {cancelled && (
                    <span className="shrink-0 rounded-full bg-orange-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-orange-700">
                      Cancelled
                    </span>
                  )}
                </div>

                {facultyName && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                    <FaUserTie className="shrink-0 text-slate-400" />
                    <span className="truncate">{facultyName}</span>
                  </div>
                )}

                {className && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                    <FaUsers className="shrink-0 text-slate-400" />
                    <span className="truncate">{className}</span>
                  </div>
                )}

                {room && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                    <FaBuilding className="shrink-0 text-slate-400" />
                    <span className="truncate">{room}</span>
                  </div>
                )}

                {slotType && (
                  <div className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
                    {slotType}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </td>
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                              PRINT                                       */
  /* ------------------------------------------------------------------------ */

  const handlePrint = () => {
    window.print();
  };

  /* ------------------------------------------------------------------------ */
  /*                              LOADING                                     */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>

            <h2 className="mt-5 text-xl font-black text-slate-800">
              Loading Master Time Table
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Please wait while the timetable data is being loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                PAGE                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  title="Back"
                >
                  <FaArrowLeft />
                </Link>

                <div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-indigo-600" />

                    <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                      All Time Tables
                    </h1>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    View, filter and print the master timetable.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((previous) => !previous)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <FaFilter />

                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <FaRedo />
                Reset
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <FaDownload />
                Print / PDF
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* SEARCH                                                          */}
          {/* -------------------------------------------------------------- */}

          <div className="mt-6">
            <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
              <FaSearch className="text-indigo-500" />
              Search
            </label>

            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search faculty, subject, class, room, day..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* FILTERS                                                         */}
          {/* -------------------------------------------------------------- */}

          {showFilters && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-800">Filters</h2>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Narrow down the master timetable using the available
                    options.
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-400">
                  {combinedFacultyList.length} faculty
                  {combinedFacultyList.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                    <FaChalkboardTeacher className="text-indigo-500" />
                    Faculty
                  </label>

                  <div className="relative">
                    <select
                      value={filters.faculty}
                      onChange={(event) =>
                        setFilters((previous) => ({
                          ...previous,
                          faculty: event.target.value,
                        }))
                      }
                      disabled={facultyLoading}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-wait disabled:bg-slate-100"
                    >
                      <option value="">
                        {facultyLoading
                          ? "Loading faculties..."
                          : "All Faculties"}
                      </option>

                      {facultyOptions.map((facultyName) => (
                        <option key={facultyName} value={facultyName}>
                          {facultyName}
                        </option>
                      ))}
                    </select>

                    <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                  </div>
                </div>

                <FilterSelect
                  label="Subject"
                  value={filters.subject}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      subject: value,
                    }))
                  }
                  options={subjectsForFilter}
                  icon={<FaBookOpen />}
                />

                <FilterSelect
                  label="Class"
                  value={filters.className}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      className: value,
                    }))
                  }
                  options={filterOptions.classes}
                  icon={<FaUsers />}
                />

                <FilterSelect
                  label="Program"
                  value={filters.program}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      program: value,
                    }))
                  }
                  options={filterOptions.programs}
                  icon={<FaBookOpen />}
                />

                <FilterSelect
                  label="Branch"
                  value={filters.branch}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      branch: value,
                    }))
                  }
                  options={filterOptions.branches}
                  icon={<FaCode />}
                />

                <FilterSelect
                  label="Semester"
                  value={filters.semester}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      semester: value,
                    }))
                  }
                  options={filterOptions.semesters}
                  icon={<FaCalendarAlt />}
                />

                <FilterSelect
                  label="Academic Year"
                  value={filters.academicYear}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      academicYear: value,
                    }))
                  }
                  options={filterOptions.academicYears}
                  icon={<FaCalendarAlt />}
                />

                <FilterSelect
                  label="Room"
                  value={filters.roomNo}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      roomNo: value,
                    }))
                  }
                  options={filterOptions.rooms}
                  icon={<FaBuilding />}
                />

                <FilterSelect
                  label="Day"
                  value={filters.day}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      day: value,
                    }))
                  }
                  options={DAYS}
                  icon={<FaCalendarAlt />}
                />

                <FilterSelect
                  label="Period"
                  value={filters.period}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      period: value,
                    }))
                  }
                  options={
                    filterOptions.periods.length
                      ? filterOptions.periods.map((period) =>
                          String(period.number),
                        )
                      : masterPeriods.map((period) => String(period.number))
                  }
                  icon={<FaClock />}
                />

                <FilterSelect
                  label="Slot Type"
                  value={filters.slotType}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      slotType: value,
                    }))
                  }
                  options={filterOptions.slotTypes}
                  icon={<FaCode />}
                />

                <FilterSelect
                  label="Status"
                  value={filters.status}
                  onChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      status: value,
                    }))
                  }
                  options={STATUS_OPTIONS}
                  icon={<FaCheckCircle />}
                />
              </div>

              {facultyError && (
                <div className="mx-0 mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <FaInfoCircle className="mt-0.5 shrink-0" />

                  <div>
                    <div className="font-bold">Faculty API information</div>

                    <div className="mt-1">{facultyError}</div>

                    {timetableFacultyList.length > 0 && (
                      <div className="mt-2 font-semibold text-amber-700">
                        {timetableFacultyList.length} faculty name
                        {timetableFacultyList.length === 1 ? "" : "s"} were
                        found directly in the timetable data and are available
                        in the Faculty filter.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <FaExclamationCircle className="mt-0.5 shrink-0" />

            <div>
              <div className="font-black">Timetable could not be loaded.</div>

              <div className="mt-1">{error}</div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STATISTICS                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Entries
              </div>

              <FaTable className="text-indigo-500" />
            </div>

            <div className="mt-2 text-2xl font-black text-slate-800">
              {statistics.entries}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Subjects
              </div>

              <FaBookOpen className="text-emerald-500" />
            </div>

            <div className="mt-2 text-2xl font-black text-slate-800">
              {statistics.subjects}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Faculties
              </div>

              <FaChalkboardTeacher className="text-violet-500" />
            </div>

            <div className="mt-2 text-2xl font-black text-slate-800">
              {statistics.faculties}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Classes
              </div>

              <FaUsers className="text-sky-500" />
            </div>

            <div className="mt-2 text-2xl font-black text-slate-800">
              {statistics.classes}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Rooms
              </div>

              <FaBuilding className="text-orange-500" />
            </div>

            <div className="mt-2 text-2xl font-black text-slate-800">
              {statistics.rooms}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Timetables
              </div>

              <FaCalendarAlt className="text-rose-500" />
            </div>

            <div className="mt-2 text-2xl font-black text-slate-800">
              {statistics.timetables}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MASTER TIME TABLE HEADER                                         */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-slate-800">
              Master Time Table
            </div>

            <div className="mt-1 text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-black text-indigo-600">
                {filteredEntries.length}
              </span>{" "}
              timetable entries
              {hasActiveFilters ? " based on your selected filters." : "."}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.faculty && (
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                Faculty: {selectedFacultyName || filters.faculty}
              </span>
            )}

            {filters.subject && (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                Subject: {filters.subject}
              </span>
            )}

            {filters.className && (
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
                Class: {filters.className}
              </span>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MASTER TIMETABLE                                                 */}
        {/* ---------------------------------------------------------------- */}

        <div
          id="master-timetable"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          {/* -------------------------------------------------------------- */}
          {/* MASTER INFO                                                     */}
          {/* -------------------------------------------------------------- */}

          <div className="border-b border-slate-200 bg-white p-5 sm:p-7">
            <div className="text-center">
              <div className="text-xl font-black uppercase tracking-wide text-slate-900 sm:text-2xl">
                {masterInfo.institutionName}
              </div>

              <div className="mt-2 text-lg font-black text-slate-700 sm:text-xl">
                {masterInfo.timetableTitle}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Issue Date", masterInfo.issueDate],
                ["With Effect From", masterInfo.effectiveFrom],
                ["Rev No", masterInfo.revisionNumber],
                ["Academic Year", masterInfo.academicYear],
                ["Program", masterInfo.program],
                ["Branch", masterInfo.branch],
                ["Semester", masterInfo.semester],
                ["Room No", masterInfo.roomNo],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {label}
                  </div>

                  <div className="mt-1 font-bold text-slate-700">
                    {value || "—"}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2 lg:col-span-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Class Coordinator
                </div>

                <div className="mt-1 font-bold text-slate-700">
                  {masterInfo.classCoordinator || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* MASTER TABLE                                                    */}
          {/* -------------------------------------------------------------- */}

          <div className="border-b border-slate-200">
            <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <FaTable />

                  <span className="font-black">MASTER TIME TABLE</span>
                </div>

                <span className="text-xs font-medium text-slate-300">
                  Scroll horizontally on smaller screens
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1750px] border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 w-[170px] min-w-[170px] border border-slate-300 bg-slate-900 p-3 text-center text-xs font-black uppercase tracking-wide text-white">
                      Day / Time
                    </th>

                    {periodsForMaster.map((period) => (
                      <th
                        key={period.number}
                        className="min-w-[155px] border border-slate-300 bg-slate-800 p-3 text-center text-white"
                      >
                        <div className="text-xs font-black uppercase tracking-wide">
                          Period {period.number}
                        </div>

                        <div className="mt-1 text-[10px] font-semibold text-slate-300">
                          {period.startTime || ""}
                          {" - "}
                          {period.endTime || ""}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="sticky left-0 z-10 min-w-[170px] border border-slate-300 bg-slate-100 p-3 align-middle text-center">
                        <div className="text-sm font-black text-slate-800">
                          {day}
                        </div>

                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {masterInfo.program || ""}

                          {masterInfo.branch ? ` • ${masterInfo.branch}` : ""}
                        </div>
                      </td>

                      {periodsForMaster.map((period) =>
                        renderMasterCell(
                          masterTable[day]?.[period.number] || [],
                          period.number,
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* LUNCH                                                           */}
          {/* -------------------------------------------------------------- */}

          <div className="border-b border-slate-200 bg-amber-50 px-5 py-4">
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <span>🍱</span>
                Lunch Timings shall be from {masterInfo.lunchStartTime} to{" "}
                {masterInfo.lunchEndTime}
              </div>

              <div className="text-xs font-semibold text-amber-700">
                Timetable entries: {filteredEntries.length}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* COURSE DETAILS                                                  */}
          {/* -------------------------------------------------------------- */}

          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FaBookOpen />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Course Details
                </h3>

                <p className="text-xs font-medium text-slate-500">
                  Subjects represented in the filtered timetable.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    {[
                      "Course Code",
                      "Course Name",
                      "L-T-P",
                      "Credits",
                      "Faculty Name",
                      "Class",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="border border-slate-200 px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-600"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {(() => {
                    const map = new Map();

                    filteredEntries.forEach((entry) => {
                      const key =
                        getEntrySubjectCode(entry) ||
                        getEntrySubjectName(entry) ||
                        getEntrySlotType(entry);

                      if (key && !map.has(key)) {
                        map.set(key, entry);
                      }
                    });

                    const values = Array.from(map.values());

                    if (!values.length) {
                      return (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-sm font-semibold text-slate-400"
                          >
                            No course details available for the selected
                            filters.
                          </td>
                        </tr>
                      );
                    }

                    return values.map((entry, index) => {
                      const subjectCode = getEntrySubjectCode(entry);

                      const subjectName = getEntrySubjectName(entry);

                      const facultyName = getEntryFacultyName(entry);

                      const className = getEntryClassName(entry);

                      const bg = getSubjectColor(subjectCode, subjectName);

                      const border = getSubjectBorderColor(
                        subjectCode,
                        subjectName,
                      );

                      return (
                        <tr
                          key={subjectCode || subjectName || index}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="border border-slate-200 px-4 py-3">
                            <span
                              className="inline-flex rounded-lg px-2.5 py-1 text-xs font-black"
                              style={{
                                backgroundColor: bg,
                                borderLeft: `4px solid ${border}`,
                              }}
                            >
                              {subjectCode || "—"}
                            </span>
                          </td>

                          <td className="border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                            {subjectName || getEntrySlotType(entry) || "—"}
                          </td>

                          <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                            {getEntryLtp(entry) || "—"}
                          </td>

                          <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                            {getEntryCredits(entry) || "—"}
                          </td>

                          <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                            {facultyName || "TBA"}
                          </td>

                          <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                            {className || "—"}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* COLOR LEGEND                                                    */}
          {/* -------------------------------------------------------------- */}

          <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-7">
            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-800">
                Subject Color Legend
              </h3>

              <p className="mt-1 text-xs font-medium text-slate-500">
                The same subject always uses the same color throughout the
                Master Time Table.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(() => {
                const map = new Map();

                filteredEntries.forEach((entry) => {
                  const code =
                    getEntrySubjectCode(entry) || getEntrySubjectName(entry);

                  if (code && !map.has(code)) {
                    map.set(code, entry);
                  }
                });

                return Array.from(map.values()).map((entry) => {
                  const subjectCode = getEntrySubjectCode(entry);

                  const subjectName = getEntrySubjectName(entry);

                  const background = getSubjectColor(subjectCode, subjectName);

                  const border = getSubjectBorderColor(
                    subjectCode,
                    subjectName,
                  );

                  return (
                    <div
                      key={subjectCode || subjectName}
                      className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2"
                      style={{
                        borderColor: border,
                      }}
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: border,
                        }}
                      />

                      <span
                        className="rounded-md px-2 py-1 text-[10px] font-black"
                        style={{
                          backgroundColor: background,
                        }}
                      >
                        {subjectCode || subjectName}
                      </span>

                      <span className="max-w-[220px] truncate text-xs font-semibold text-slate-600">
                        {subjectName || ""}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* SIGNATURES                                                      */}
          {/* -------------------------------------------------------------- */}

          <div className="border-t border-slate-200 bg-white px-5 py-6 sm:px-7">
            <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
              {["TT COORDINATOR", "HOD", "DEAN"].map((role) => (
                <div key={role}>
                  <div className="text-sm font-black text-slate-800">
                    {role}
                  </div>

                  <div className="mt-8 border-t border-slate-300 pt-2 text-xs font-semibold text-slate-500">
                    Signature
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* NO RESULTS                                                        */}
        {/* ---------------------------------------------------------------- */}

        {filteredEntries.length === 0 && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
              <FaSearch />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-800">
              No timetable entries found
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              No timetable entries match the currently selected filters. Try
              removing one or more filters or search terms.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <FaRedo />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PRINT CSS                                                          */}
      {/* ------------------------------------------------------------------ */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            #master-timetable,
            #master-timetable * {
              visibility: visible;
            }

            #master-timetable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
            }

            #master-timetable .overflow-x-auto {
              overflow: visible !important;
            }

            #master-timetable table {
              min-width: 0 !important;
              width: 100% !important;
            }

            #master-timetable th,
            #master-timetable td {
              min-width: 0 !important;
            }

            @page {
              size: A3 landscape;
              margin: 8mm;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AllTimeTables;

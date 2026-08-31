import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaClock,
  FaUserTie,
  FaBookOpen,
  FaChalkboardTeacher,
  FaDoorOpen,
  FaGraduationCap,
  FaUniversity,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaLayerGroup,
  FaListOl,
  FaEdit,
} from "react-icons/fa";

import globalBackendRoute from "../../config/Config";

/* ================================================================
   CONSTANTS
================================================================ */

const API_BASE_URL = `${globalBackendRoute}/api`;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const SLOT_TYPES = [
  "lecture",
  "lab",
  "tutorial",
  "seminar",
  "practical",
  "other",
];

const SESSION_TYPES = ["regular", "extra", "remedial", "special"];

const STATUSES = ["draft", "active", "inactive"];

const DEFAULT_PERIODS = Array.from({ length: 10 }, (_, index) => ({
  period: index + 1,
  startTime: "",
  endTime: "",
}));

const EMPTY_ENTRY = {
  day: "Monday",
  period: 1,
  subjectCode: "",
  subjectName: "",
  className: "",
  section: "",
  roomNo: "",
  slotType: "lecture",
  sessionType: "regular",
  status: "active",
  startTime: "",
  endTime: "",
  remarks: "",
};

/* ================================================================
   AXIOS INSTANCE
================================================================ */

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* ================================================================
   HELPERS
================================================================ */

const getValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const getId = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return getValue(
    item._id,
    item.id,
    item.code,
    item.subjectCode,
    item.className,
    item.name,
    item.title,
  );
};

const getSubjectCode = (subject) => {
  if (!subject) return "";

  if (typeof subject === "string") {
    return subject;
  }

  return getValue(subject.subjectCode, subject.code, subject._id);
};

const getSubjectName = (subject) => {
  if (!subject) return "";

  if (typeof subject === "string") {
    return subject;
  }

  return getValue(
    subject.subjectName,
    subject.name,
    subject.title,
    subject.code,
    subject.subjectCode,
  );
};

const getClassName = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return getValue(item.className, item.name, item.title, item.class);
};

const getSection = (item) => {
  if (!item || typeof item === "string") {
    return "";
  }

  return getValue(item.section, item.sectionName);
};

const getFacultyDisplayName = (faculty) => {
  if (!faculty) return "";

  return getValue(
    faculty.fullName,
    faculty.name,
    faculty.facultyName,
    faculty.displayName,
    [faculty.firstName, faculty.middleName, faculty.lastName]
      .filter(Boolean)
      .join(" "),
    faculty.user?.name,
    faculty.user?.fullName,
    faculty.user?.email,
  );
};

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const createEntryId = () => {
  return `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const normalizeEntry = (entry, index = 0) => {
  return {
    ...EMPTY_ENTRY,

    ...entry,

    _id: entry?._id || entry?.id || createEntryId(),

    day: getValue(entry?.day, "Monday"),

    period: Number(entry?.period) || 1,

    subjectCode: normalizeText(entry?.subjectCode),

    subjectName: normalizeText(entry?.subjectName),

    className: normalizeText(entry?.className),

    section: normalizeText(entry?.section),

    roomNo: normalizeText(entry?.roomNo),

    slotType: getValue(entry?.slotType, "lecture"),

    sessionType: getValue(entry?.sessionType, "regular"),

    status: getValue(entry?.status, "active"),

    startTime: normalizeText(entry?.startTime),

    endTime: normalizeText(entry?.endTime),

    remarks: normalizeText(entry?.remarks),

    __index: index,
  };
};

const normalizePeriods = (periods) => {
  if (!Array.isArray(periods) || periods.length === 0) {
    return DEFAULT_PERIODS.map((period) => ({
      ...period,
    }));
  }

  return periods.map((item, index) => {
    if (typeof item === "number") {
      return {
        period: item,
        startTime: "",
        endTime: "",
      };
    }

    return {
      period:
        Number(getValue(item?.period, item?.periodNumber, index + 1)) ||
        index + 1,

      startTime: normalizeText(
        getValue(item?.startTime, item?.start, item?.from),
      ),

      endTime: normalizeText(getValue(item?.endTime, item?.end, item?.to)),
    };
  });
};

const sortEntries = (entries) => {
  return [...entries].sort((a, b) => {
    const dayA = DAYS.indexOf(a.day);
    const dayB = DAYS.indexOf(b.day);

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    return Number(a.period) - Number(b.period);
  });
};

/*
  Remove frontend-only properties before sending data to MongoDB.
*/
const prepareEntryForApi = (entry) => {
  const cleanEntry = {
    ...entry,
  };

  delete cleanEntry.__index;

  /*
    New temporary IDs generated by the frontend should not be
    sent as MongoDB ObjectIds.
  */
  if (
    typeof cleanEntry._id === "string" &&
    cleanEntry._id.startsWith("entry-")
  ) {
    delete cleanEntry._id;
  }

  return cleanEntry;
};

/* ================================================================
   MAIN COMPONENT
================================================================ */

const UpdateTimeTable = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  /* ==============================================================
     LOADING / MESSAGE STATE
  ============================================================== */

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [loadingFaculty, setLoadingFaculty] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  /* ==============================================================
     TIMETABLE STATE
  ============================================================== */

  const [timetable, setTimetable] = useState(null);

  const [facultyList, setFacultyList] = useState([]);

  const [faculty, setFaculty] = useState(null);

  /* ==============================================================
     ASSIGNED DATA
  ============================================================== */

  const [assignedSubjects, setAssignedSubjects] = useState([]);

  const [assignedClasses, setAssignedClasses] = useState([]);

  /* ==============================================================
     FORM STATE
  ============================================================== */

  const [form, setForm] = useState({
    facultyId: "",
    academicYear: "2026-2027",

    issueDate: "",

    effectiveFrom: "",

    revisionNumber: 0,

    program: "",

    branch: "",

    semester: "",

    roomNo: "",

    classCoordinator: "",

    institutionName: "",

    timetableTitle: "",

    lunchStartTime: "",

    lunchEndTime: "",

    status: "draft",
  });

  const [periods, setPeriods] = useState(
    DEFAULT_PERIODS.map((period) => ({
      ...period,
    })),
  );

  const [entries, setEntries] = useState([]);

  /* ==============================================================
     ENTRY FORM
  ============================================================== */

  const [entryForm, setEntryForm] = useState({
    ...EMPTY_ENTRY,
  });

  const [editingEntryId, setEditingEntryId] = useState(null);

  /* ==============================================================
     FETCH TIMETABLE
  ============================================================== */

  const loadTimetable = useCallback(async () => {
    if (!id) {
      setError("Timetable ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await api.get(`/timetable/get-timetable-by-id/${id}`);

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load timetable.");
      }

      const loadedTimetable = data?.timetable || data?.data || data;

      setTimetable(loadedTimetable);

      const loadedFacultyId =
        loadedTimetable?.facultyId?._id ||
        loadedTimetable?.facultyId ||
        data?.facultyId ||
        "";

      setForm({
        facultyId: loadedFacultyId,

        academicYear:
          normalizeText(loadedTimetable?.academicYear) || "2026-2027",

        issueDate: loadedTimetable?.issueDate
          ? String(loadedTimetable.issueDate).substring(0, 10)
          : "",

        effectiveFrom: loadedTimetable?.effectiveFrom
          ? String(loadedTimetable.effectiveFrom).substring(0, 10)
          : "",

        revisionNumber: Number(loadedTimetable?.revisionNumber) || 0,

        program: normalizeText(loadedTimetable?.program),

        branch: normalizeText(loadedTimetable?.branch),

        semester: normalizeText(loadedTimetable?.semester),

        roomNo: normalizeText(loadedTimetable?.roomNo),

        classCoordinator: normalizeText(loadedTimetable?.classCoordinator),

        institutionName: normalizeText(loadedTimetable?.institutionName),

        timetableTitle: normalizeText(loadedTimetable?.timetableTitle),

        lunchStartTime: normalizeText(loadedTimetable?.lunchStartTime),

        lunchEndTime: normalizeText(loadedTimetable?.lunchEndTime),

        status: getValue(loadedTimetable?.status, "draft"),
      });

      setPeriods(normalizePeriods(loadedTimetable?.periods));

      const loadedEntries = Array.isArray(loadedTimetable?.entries)
        ? loadedTimetable.entries
        : [];

      setEntries(
        sortEntries(
          loadedEntries.map((entry, index) => normalizeEntry(entry, index)),
        ),
      );

      if (loadedFacultyId) {
        await loadFacultyAssignedData(loadedFacultyId);
      }
    } catch (requestError) {
      console.error("LOAD TIMETABLE ERROR:", requestError);

      if (requestError?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (requestError?.response?.status === 403) {
        setError("You are not authorized to update this timetable.");
      } else if (requestError?.response?.status === 404) {
        setError("Timetable not found.");
      } else {
        setError(getErrorMessage(requestError, "Failed to load timetable."));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* ==============================================================
     LOAD ALL FACULTY
  ============================================================== */

  const loadFacultyList = useCallback(async () => {
    try {
      const response = await api.get("/faculty/get-all-faculties");

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load faculties.");
      }

      const list = data?.faculties || data?.faculty || data?.data || [];

      setFacultyList(Array.isArray(list) ? list : []);
    } catch (requestError) {
      console.error("LOAD FACULTY LIST ERROR:", requestError);

      /*
        Do not overwrite the main timetable error here.
        The assigned faculty data endpoint will still
        attempt to load the selected faculty.
      */

      if (requestError?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      }
    }
  }, []);

  /* ==============================================================
     LOAD FACULTY ASSIGNED DATA
  ============================================================== */

  const loadFacultyAssignedData = useCallback(
    async (facultyId) => {
      if (!facultyId) {
        setFaculty(null);
        setAssignedSubjects([]);
        setAssignedClasses([]);
        return;
      }

      try {
        setLoadingFaculty(true);

        const response = await api.get(
          `/timetable/get-faculty-assigned-data/${facultyId}`,
        );

        const data = response?.data;

        if (!data?.success) {
          throw new Error(
            data?.message || "Failed to load faculty assigned data.",
          );
        }

        setAssignedSubjects(Array.isArray(data?.subjects) ? data.subjects : []);

        setAssignedClasses(Array.isArray(data?.classes) ? data.classes : []);

        /*
          Try to find the selected faculty in the
          faculty list as well.
        */

        const matchingFaculty = facultyList.find(
          (item) => String(item?._id || item?.id) === String(facultyId),
        );

        if (matchingFaculty) {
          setFaculty(matchingFaculty);
        } else {
          setFaculty({
            _id: facultyId,

            fullName: data?.facultyName || "Selected Faculty",

            facultyName: data?.facultyName || "Selected Faculty",
          });
        }
      } catch (requestError) {
        console.error("LOAD FACULTY ASSIGNED DATA ERROR:", requestError);

        setAssignedSubjects([]);

        setAssignedClasses([]);

        if (requestError?.response?.status === 401) {
          setError("Your session has expired. Please login again.");
        }
      } finally {
        setLoadingFaculty(false);
      }
    },
    [facultyList],
  );

  /* ==============================================================
     INITIAL LOAD
  ============================================================== */

  useEffect(() => {
    loadFacultyList();
  }, [loadFacultyList]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  /* ==============================================================
     SET FACULTY AFTER FACULTY LIST LOADS
  ============================================================== */

  useEffect(() => {
    if (!form.facultyId) {
      return;
    }

    const selectedFaculty = facultyList.find(
      (item) => String(item?._id || item?.id) === String(form.facultyId),
    );

    if (selectedFaculty) {
      setFaculty(selectedFaculty);
    }
  }, [facultyList, form.facultyId]);

  /* ==============================================================
     FORM HANDLERS
  ============================================================== */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    setSuccessMessage("");
  };

  /* ==============================================================
     FACULTY CHANGE
  ============================================================== */

  const handleFacultyChange = async (event) => {
    const facultyId = event.target.value;

    setForm((previous) => ({
      ...previous,
      facultyId,
    }));

    setError("");

    setSuccessMessage("");

    /*
      Clear current entry form because the available
      subjects/classes may change when faculty changes.
    */

    setEntryForm({
      ...EMPTY_ENTRY,
    });

    setEditingEntryId(null);

    await loadFacultyAssignedData(facultyId);
  };

  /* ==============================================================
     PERIOD HANDLERS
  ============================================================== */

  const handlePeriodChange = (index, field, value) => {
    setPeriods((previous) =>
      previous.map((period, periodIndex) =>
        periodIndex === index
          ? {
              ...period,
              [field]: value,
            }
          : period,
      ),
    );

    setError("");

    setSuccessMessage("");
  };

  const addPeriod = () => {
    const nextPeriodNumber = periods.length + 1;

    setPeriods((previous) => [
      ...previous,
      {
        period: nextPeriodNumber,
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const removePeriod = (index) => {
    if (periods.length <= 1) {
      setError("At least one period is required.");
      return;
    }

    const removedPeriod = periods[index]?.period;

    const updatedPeriods = periods.filter(
      (_, periodIndex) => periodIndex !== index,
    );

    /*
      Re-number periods after deletion.
    */

    const renumberedPeriods = updatedPeriods.map((period, periodIndex) => ({
      ...period,
      period: periodIndex + 1,
    }));

    setPeriods(renumberedPeriods);

    /*
      Update entries that used periods after the
      deleted period.
    */

    setEntries((previousEntries) =>
      previousEntries
        .filter((entry) => Number(entry.period) !== Number(removedPeriod))
        .map((entry) => ({
          ...entry,

          period:
            Number(entry.period) > Number(removedPeriod)
              ? Number(entry.period) - 1
              : Number(entry.period),
        })),
    );

    setError("");

    setSuccessMessage("");
  };

  /* ==============================================================
     ENTRY FORM HANDLERS
  ============================================================== */

  const handleEntryChange = (event) => {
    const { name, value } = event.target;

    setEntryForm((previous) => ({
      ...previous,
      [name]: name === "period" ? Number(value) : value,
    }));

    setError("");

    setSuccessMessage("");
  };

  /* ==============================================================
     SUBJECT SELECTION
  ============================================================== */

  const handleSubjectChange = (event) => {
    const selectedCode = event.target.value;

    const selectedSubject = assignedSubjects.find(
      (subject) =>
        String(getSubjectCode(subject)).toUpperCase() ===
        String(selectedCode).toUpperCase(),
    );

    setEntryForm((previous) => ({
      ...previous,

      subjectCode: selectedCode,

      subjectName: getSubjectName(selectedSubject) || previous.subjectName,
    }));

    setError("");

    setSuccessMessage("");
  };

  /* ==============================================================
     CLASS SELECTION
  ============================================================== */

  const handleClassChange = (event) => {
    const selectedClass = event.target.value;

    const classObject = assignedClasses.find(
      (item) =>
        String(getClassName(item)).toLowerCase() ===
        String(selectedClass).toLowerCase(),
    );

    setEntryForm((previous) => ({
      ...previous,

      className: selectedClass,

      section: getSection(classObject) || previous.section,
    }));

    setError("");

    setSuccessMessage("");
  };

  /* ==============================================================
     CHECK ENTRY CONFLICT
  ============================================================== */

  const hasEntryConflict = (candidate, ignoreId = null) => {
    return entries.some((entry) => {
      if (ignoreId && String(entry._id) === String(ignoreId)) {
        return false;
      }

      return (
        entry.day === candidate.day &&
        Number(entry.period) === Number(candidate.period)
      );
    });
  };

  /* ==============================================================
     VALIDATE ENTRY
  ============================================================== */

  const validateEntry = (candidate, ignoreId = null) => {
    if (!candidate.day) {
      return "Day is required.";
    }

    if (!DAYS.includes(candidate.day)) {
      return "Please select a valid day.";
    }

    if (!candidate.period || Number(candidate.period) < 1) {
      return "Valid period is required.";
    }

    if (Number(candidate.period) > periods.length) {
      return `Period must be between 1 and ${periods.length}.`;
    }

    if (!normalizeText(candidate.subjectCode)) {
      return "Subject code is required.";
    }

    if (!normalizeText(candidate.subjectName)) {
      return "Subject name is required.";
    }

    if (!normalizeText(candidate.className)) {
      return "Class name is required.";
    }

    if (hasEntryConflict(candidate, ignoreId)) {
      return `A timetable entry already exists for ${candidate.day}, Period ${candidate.period}.`;
    }

    if (
      candidate.startTime &&
      candidate.endTime &&
      candidate.startTime >= candidate.endTime
    ) {
      return "Entry start time must be before entry end time.";
    }

    return "";
  };

  /* ==============================================================
     ADD / UPDATE ENTRY
  ============================================================== */

  const handleSaveEntry = () => {
    const candidate = {
      ...entryForm,
      period: Number(entryForm.period),
    };

    const validationMessage = validateEntry(candidate, editingEntryId);

    if (validationMessage) {
      setError(validationMessage);

      setSuccessMessage("");

      return;
    }

    if (editingEntryId) {
      setEntries((previous) =>
        sortEntries(
          previous.map((entry) =>
            String(entry._id) === String(editingEntryId)
              ? {
                  ...candidate,
                  _id: editingEntryId,
                }
              : entry,
          ),
        ),
      );

      setSuccessMessage("Timetable entry updated.");
    } else {
      const newEntry = {
        ...candidate,
        _id: createEntryId(),
      };

      setEntries((previous) => sortEntries([...previous, newEntry]));

      setSuccessMessage("Timetable entry added.");
    }

    setEntryForm({
      ...EMPTY_ENTRY,
      period: periods.length > 0 ? periods[0].period : 1,
    });

    setEditingEntryId(null);

    setError("");
  };

  /* ==============================================================
     EDIT ENTRY
  ============================================================== */

  const handleEditEntry = (entry) => {
    setEntryForm({
      ...EMPTY_ENTRY,

      ...entry,

      period: Number(entry.period) || 1,
    });

    setEditingEntryId(entry._id);

    setError("");

    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ==============================================================
     DELETE ENTRY
  ============================================================== */

  const handleDeleteEntry = (entryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this timetable entry?",
    );

    if (!confirmed) {
      return;
    }

    setEntries((previous) =>
      previous.filter((entry) => String(entry._id) !== String(entryId)),
    );

    if (String(editingEntryId) === String(entryId)) {
      setEditingEntryId(null);

      setEntryForm({
        ...EMPTY_ENTRY,
        period: periods.length > 0 ? periods[0].period : 1,
      });
    }

    setError("");

    setSuccessMessage(
      "Timetable entry removed. Click Save Changes to permanently save the update.",
    );
  };

  /* ==============================================================
     DUPLICATE ENTRY
  ============================================================== */

  const handleDuplicateEntry = (entry) => {
    let targetPeriod = Number(entry.period) + 1;

    let targetDay = entry.day;

    /*
      Find first available slot.
    */

    let foundSlot = false;

    for (
      let dayIndex = DAYS.indexOf(entry.day);
      dayIndex < DAYS.length && !foundSlot;
      dayIndex += 1
    ) {
      const day = DAYS[dayIndex];

      const startingPeriod = day === entry.day ? Number(entry.period) + 1 : 1;

      for (let period = startingPeriod; period <= periods.length; period += 1) {
        const occupied = entries.some(
          (existing) =>
            existing.day === day && Number(existing.period) === period,
        );

        if (!occupied) {
          targetDay = day;
          targetPeriod = period;
          foundSlot = true;
          break;
        }
      }
    }

    if (!foundSlot) {
      setError("No empty timetable slot is available for duplication.");
      return;
    }

    const duplicatedEntry = {
      ...entry,

      _id: createEntryId(),

      day: targetDay,

      period: targetPeriod,
    };

    setEntries((previous) => sortEntries([...previous, duplicatedEntry]));

    setError("");

    setSuccessMessage(
      `Entry duplicated to ${targetDay}, Period ${targetPeriod}.`,
    );
  };

  /* ==============================================================
     CLEAR ENTRY FORM
  ============================================================== */

  const handleCancelEdit = () => {
    setEditingEntryId(null);

    setEntryForm({
      ...EMPTY_ENTRY,

      period: periods.length > 0 ? periods[0].period : 1,
    });

    setError("");

    setSuccessMessage("");
  };

  /* ==============================================================
     CLEAR ALL ENTRIES
  ============================================================== */

  const handleClearAllEntries = () => {
    if (entries.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove ALL timetable entries? This will only be saved when you click Save Changes.",
    );

    if (!confirmed) {
      return;
    }

    setEntries([]);

    setEditingEntryId(null);

    setEntryForm({
      ...EMPTY_ENTRY,

      period: periods.length > 0 ? periods[0].period : 1,
    });

    setError("");

    setSuccessMessage(
      "All entries removed. Click Save Changes to save the empty timetable.",
    );
  };

  /* ==============================================================
     VALIDATE COMPLETE TIMETABLE
  ============================================================== */

  const validateTimetable = () => {
    if (!form.facultyId) {
      return "Faculty is required.";
    }

    if (!normalizeText(form.academicYear)) {
      return "Academic year is required.";
    }

    if (!Array.isArray(periods) || periods.length === 0) {
      return "At least one period is required.";
    }

    /*
      Validate periods.
    */

    const periodNumbers = periods.map((period) => Number(period.period));

    const uniquePeriods = new Set(periodNumbers);

    if (uniquePeriods.size !== periodNumbers.length) {
      return "Duplicate period numbers are not allowed.";
    }

    for (const period of periods) {
      if (
        period.startTime &&
        period.endTime &&
        period.startTime >= period.endTime
      ) {
        return `Period ${period.period}: start time must be before end time.`;
      }
    }

    /*
      Validate entries.
    */

    const entryKeys = new Set();

    for (const entry of entries) {
      const key = `${entry.day}-${entry.period}`;

      if (entryKeys.has(key)) {
        return `Duplicate timetable entry found for ${entry.day}, Period ${entry.period}.`;
      }

      entryKeys.add(key);

      const entryError = validateEntry(entry, entry._id);

      /*
        validateEntry ignores itself, so this
        validates all other required fields.
      */

      if (entryError) {
        return entryError;
      }
    }

    return "";
  };

  /* ==============================================================
     SAVE TIMETABLE
  ============================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccessMessage("");

    const validationMessage = validateTimetable();

    if (validationMessage) {
      setError(validationMessage);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);

      const payload = {
        facultyId: form.facultyId,

        academicYear: normalizeText(form.academicYear),

        issueDate: form.issueDate || null,

        effectiveFrom: form.effectiveFrom || null,

        revisionNumber: Number(form.revisionNumber) || 0,

        program: normalizeText(form.program),

        branch: normalizeText(form.branch),

        semester: normalizeText(form.semester),

        roomNo: normalizeText(form.roomNo),

        classCoordinator: normalizeText(form.classCoordinator),

        institutionName: normalizeText(form.institutionName),

        timetableTitle: normalizeText(form.timetableTitle),

        lunchStartTime: normalizeText(form.lunchStartTime),

        lunchEndTime: normalizeText(form.lunchEndTime),

        status: form.status,

        periods: periods.map((period) => ({
          period: Number(period.period),

          startTime: normalizeText(period.startTime),

          endTime: normalizeText(period.endTime),
        })),

        entries: sortEntries(entries).map(prepareEntryForApi),
      };

      const response = await api.put(
        `/timetable/update-timetable/${id}`,
        payload,
      );

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update timetable.");
      }

      /*
        Update local state with the actual
        server response.
      */

      const updatedTimetable = data?.timetable || data?.data;

      if (updatedTimetable) {
        setTimetable(updatedTimetable);

        setEntries(
          sortEntries(
            Array.isArray(updatedTimetable.entries)
              ? updatedTimetable.entries.map(normalizeEntry)
              : [],
          ),
        );
      }

      setSuccessMessage("Timetable updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError) {
      console.error("UPDATE TIMETABLE ERROR:", requestError);

      if (requestError?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (requestError?.response?.status === 403) {
        setError("You are not authorized to update this timetable.");
      } else if (requestError?.response?.status === 404) {
        setError("Timetable or faculty was not found.");
      } else if (requestError?.response?.status === 409) {
        setError(
          getErrorMessage(
            requestError,
            "Another active timetable already exists for this faculty and academic year.",
          ),
        );
      } else if (requestError?.response?.status === 400) {
        setError(
          getErrorMessage(requestError, "The timetable data is invalid."),
        );
      } else {
        setError(getErrorMessage(requestError, "Failed to update timetable."));
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ==============================================================
     REFRESH
  ============================================================== */

  const handleRefresh = async () => {
    setError("");

    setSuccessMessage("");

    await loadTimetable();
  };

  /* ==============================================================
     DERIVED DATA
  ============================================================== */

  const subjectOptions = useMemo(() => {
    const map = new Map();

    assignedSubjects.forEach((subject) => {
      const code = normalizeText(getSubjectCode(subject)).toUpperCase();

      if (!code) {
        return;
      }

      map.set(code, {
        code,

        name: getSubjectName(subject) || code,
      });
    });

    /*
      Include subjects already used in the
      timetable even if they are no longer
      returned by assigned-data.
    */

    entries.forEach((entry) => {
      const code = normalizeText(entry.subjectCode).toUpperCase();

      if (code && !map.has(code)) {
        map.set(code, {
          code,

          name: entry.subjectName || code,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  }, [assignedSubjects, entries]);

  const classOptions = useMemo(() => {
    const map = new Map();

    assignedClasses.forEach((item) => {
      const name = normalizeText(getClassName(item));

      if (!name) {
        return;
      }

      map.set(name.toLowerCase(), {
        name,

        section: getSection(item),
      });
    });

    entries.forEach((entry) => {
      const name = normalizeText(entry.className);

      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          name,

          section: entry.section || "",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [assignedClasses, entries]);

  const entriesByDay = useMemo(() => {
    const result = {};

    DAYS.forEach((day) => {
      result[day] = sortEntries(entries.filter((entry) => entry.day === day));
    });

    return result;
  }, [entries]);

  const activeFacultyName =
    getFacultyDisplayName(faculty) ||
    timetable?.facultyName ||
    "Selected Faculty";

  /* ==============================================================
     RENDER: LOADING
  ============================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <FaSyncAlt className="animate-spin text-3xl text-slate-700" />

            <p className="text-sm font-medium text-slate-600">
              Loading timetable...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* =========================================================
          HEADER
      ========================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link
                to="/"
                className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                title="Back"
              >
                <FaArrowLeft />
              </Link>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-700" />

                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Timetable Management
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Update Timetable
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update faculty schedule, periods, subjects, classes and
                  timetable details.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSave />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <FaExclamationCircle className="mt-0.5 shrink-0 text-lg" />

            <div className="flex-1">
              <p className="font-semibold">Unable to continue</p>

              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <FaCheckCircle className="mt-0.5 shrink-0 text-lg" />

            <div>
              <p className="font-semibold">Success</p>

              <p className="mt-1 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FaUniversity />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Timetable Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Basic information about this timetable.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
              {/* FACULTY */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Faculty
                  <span className="text-red-500"> *</span>
                </label>

                <div className="relative">
                  <FaUserTie className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <select
                    name="facultyId"
                    value={form.facultyId}
                    onChange={handleFacultyChange}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    required
                  >
                    <option value="">Select Faculty</option>

                    {facultyList.map((item) => {
                      const facultyId = item?._id || item?.id;

                      return (
                        <option key={facultyId} value={facultyId}>
                          {getFacultyDisplayName(item)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {activeFacultyName && (
                  <p className="mt-2 text-xs text-slate-500">
                    Selected:{" "}
                    <span className="font-semibold text-slate-700">
                      {activeFacultyName}
                    </span>
                  </p>
                )}
              </div>

              {/* ACADEMIC YEAR */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Academic Year
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleFormChange}
                  placeholder="2026-2027"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </div>

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Timetable Title
                </label>

                <input
                  type="text"
                  name="timetableTitle"
                  value={form.timetableTitle}
                  onChange={handleFormChange}
                  placeholder="Faculty Timetable"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* PROGRAM */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Program
                </label>

                <input
                  type="text"
                  name="program"
                  value={form.program}
                  onChange={handleFormChange}
                  placeholder="B.Tech / M.Tech"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* BRANCH */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Branch
                </label>

                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleFormChange}
                  placeholder="CSE / IT / AI"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* SEMESTER */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Semester
                </label>

                <input
                  type="text"
                  name="semester"
                  value={form.semester}
                  onChange={handleFormChange}
                  placeholder="5"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* ROOM */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Default Room
                </label>

                <div className="relative">
                  <FaDoorOpen className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="roomNo"
                    value={form.roomNo}
                    onChange={handleFormChange}
                    placeholder="Room 101"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              {/* COORDINATOR */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Class Coordinator
                </label>

                <input
                  type="text"
                  name="classCoordinator"
                  value={form.classCoordinator}
                  onChange={handleFormChange}
                  placeholder="Coordinator name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* INSTITUTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Institution
                </label>

                <input
                  type="text"
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleFormChange}
                  placeholder="College / Institution"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* REVISION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Revision Number
                </label>

                <input
                  type="number"
                  min="0"
                  name="revisionNumber"
                  value={form.revisionNumber}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* ISSUE DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue Date
                </label>

                <input
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* EFFECTIVE DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Effective From
                </label>

                <input
                  type="date"
                  name="effectiveFrom"
                  value={form.effectiveFrom}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* LUNCH START */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Lunch Start
                </label>

                <input
                  type="time"
                  name="lunchStartTime"
                  value={form.lunchStartTime}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* LUNCH END */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Lunch End
                </label>

                <input
                  type="time"
                  name="lunchEndTime"
                  value={form.lunchEndTime}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-slate-950">
                  <FaUserTie className="text-slate-700" />
                  Faculty Assignment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Subjects and classes assigned to the selected faculty.
                </p>
              </div>

              {loadingFaculty && (
                <FaSyncAlt className="animate-spin text-slate-500" />
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FaBookOpen className="text-slate-600" />

                  <span className="font-semibold text-slate-800">
                    Assigned Subjects
                  </span>

                  <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                    {subjectOptions.length}
                  </span>
                </div>

                {subjectOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subjectOptions.map((subject) => (
                      <span
                        key={subject.code}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        {subject.code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No assigned subjects found.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FaChalkboardTeacher className="text-slate-600" />

                  <span className="font-semibold text-slate-800">
                    Assigned Classes
                  </span>

                  <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                    {classOptions.length}
                  </span>
                </div>

                {classOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {classOptions.map((item) => (
                      <span
                        key={item.name}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        {item.name}

                        {item.section && (
                          <span className="ml-1 text-slate-400">
                            ({item.section})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No assigned classes found.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-slate-950">
                  <FaClock className="text-slate-700" />
                  Period Configuration
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the period numbers and timings used by this
                  timetable.
                </p>
              </div>

              <button
                type="button"
                onClick={addPeriod}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FaPlus />
                Add Period
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Period
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Start Time
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      End Time
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {periods.map((period, index) => (
                    <tr key={`period-${index}`} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                          {period.period}
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <input
                          type="time"
                          value={period.startTime}
                          onChange={(event) =>
                            handlePeriodChange(
                              index,
                              "startTime",
                              event.target.value,
                            )
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                      </td>

                      <td className="px-5 py-3">
                        <input
                          type="time"
                          value={period.endTime}
                          onChange={(event) =>
                            handlePeriodChange(
                              index,
                              "endTime",
                              event.target.value,
                            )
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                      </td>

                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removePeriod(index)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          title="Remove period"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* =====================================================
              ENTRY EDITOR
          ====================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  {editingEntryId ? <FaEdit /> : <FaPlus />}
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    {editingEntryId
                      ? "Edit Timetable Entry"
                      : "Add Timetable Entry"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Add or modify a class in the timetable.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">
              {/* DAY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Day *
                </label>

                <select
                  name="day"
                  value={entryForm.day}
                  onChange={handleEntryChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* PERIOD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Period *
                </label>

                <select
                  name="period"
                  value={entryForm.period}
                  onChange={handleEntryChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {periods.map((period) => (
                    <option key={period.period} value={period.period}>
                      Period {period.period}
                      {period.startTime && period.endTime
                        ? ` — ${period.startTime} to ${period.endTime}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUBJECT */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject *
                </label>

                <select
                  name="subjectCode"
                  value={entryForm.subjectCode}
                  onChange={handleSubjectChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select Subject</option>

                  {subjectOptions.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLASS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Class *
                </label>

                <select
                  name="className"
                  value={entryForm.className}
                  onChange={handleClassChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select Class</option>

                  {classOptions.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}

                      {item.section ? ` - Section ${item.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUBJECT NAME */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject Name *
                </label>

                <input
                  type="text"
                  name="subjectName"
                  value={entryForm.subjectName}
                  onChange={handleEntryChange}
                  placeholder="Subject name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* SECTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Section
                </label>

                <input
                  type="text"
                  name="section"
                  value={entryForm.section}
                  onChange={handleEntryChange}
                  placeholder="A"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* ROOM */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Room
                </label>

                <input
                  type="text"
                  name="roomNo"
                  value={entryForm.roomNo}
                  onChange={handleEntryChange}
                  placeholder="Room 101"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* SLOT TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slot Type
                </label>

                <select
                  name="slotType"
                  value={entryForm.slotType}
                  onChange={handleEntryChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {SLOT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* SESSION TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Session Type
                </label>

                <select
                  name="sessionType"
                  value={entryForm.sessionType}
                  onChange={handleEntryChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {SESSION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* START TIME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Entry Start
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={entryForm.startTime}
                  onChange={handleEntryChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* END TIME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Entry End
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={entryForm.endTime}
                  onChange={handleEntryChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Entry Status
                </label>

                <select
                  name="status"
                  value={entryForm.status}
                  onChange={handleEntryChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* REMARKS */}

              <div className="md:col-span-2 lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Remarks
                </label>

                <input
                  type="text"
                  name="remarks"
                  value={entryForm.remarks}
                  onChange={handleEntryChange}
                  placeholder="Optional remarks"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            {/* ENTRY ACTIONS */}

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              {editingEntryId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FaTimesCircle />
                  Cancel Edit
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveEntry}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {editingEntryId ? (
                  <>
                    <FaEdit />
                    Update Entry
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Entry
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-slate-950">
                  <FaListOl className="text-slate-700" />
                  Timetable Entries
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {entries.length}
                  </span>
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review, edit, duplicate or remove timetable entries.
                </p>
              </div>

              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllEntries}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <FaTrash />
                  Clear All
                </button>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FaCalendarAlt className="text-xl" />
                </div>

                <h3 className="font-bold text-slate-800">
                  No timetable entries
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add your first timetable entry using the form above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Day
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Period
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Subject
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Class
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Room
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Type
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sortEntries(entries).map((entry) => (
                      <tr
                        key={entry._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                            {entry.day}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                              {entry.period}
                            </div>

                            <div>
                              {entry.startTime || entry.endTime ? (
                                <p className="text-xs text-slate-500">
                                  {entry.startTime}{" "}
                                  {entry.startTime && entry.endTime ? "–" : ""}{" "}
                                  {entry.endTime}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400">
                                  Period time not set
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {entry.subjectCode}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {entry.subjectName}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {entry.className}
                            </p>

                            {entry.section && (
                              <p className="text-xs text-slate-500">
                                Section {entry.section}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                            <FaDoorOpen className="text-slate-400" />

                            {entry.roomNo || form.roomNo || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {entry.slotType}
                            </span>

                            <span className="text-[11px] text-slate-400">
                              {entry.sessionType}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditEntry(entry)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateEntry(entry)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                              title="Duplicate"
                            >
                              <FaCopy />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* =====================================================
              WEEKLY PREVIEW
          ====================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FaLayerGroup />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">Weekly Preview</h2>

                  <p className="text-sm text-slate-500">
                    Preview how the updated timetable will look by day.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
              {DAYS.map((day) => {
                const dayEntries = entriesByDay[day] || [];

                return (
                  <div
                    key={day}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">{day}</h3>

                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                          {dayEntries.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 p-3">
                      {dayEntries.length > 0 ? (
                        dayEntries.map((entry) => (
                          <div
                            key={entry._id}
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
                                {entry.period}
                              </span>

                              <span className="text-[10px] font-semibold uppercase text-slate-400">
                                {entry.slotType}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-800">
                              {entry.subjectCode}
                            </p>

                            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                              {entry.subjectName}
                            </p>

                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                              <FaChalkboardTeacher />

                              {entry.className}

                              {entry.section ? ` - ${entry.section}` : ""}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No class scheduled.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FaCalendarAlt />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {entries.length} timetable{" "}
                  {entries.length === 1 ? "entry" : "entries"}
                </p>

                <p className="text-xs text-slate-500">
                  Changes are saved when you click Save Changes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FaArrowLeft />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSave />

                {saving ? "Updating..." : "Save Timetable"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UpdateTimeTable;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownAZ,
  ArrowUpAZ,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  ListFilter,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  Users,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Edit3,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

// =====================================================
// API ENDPOINTS
// IMPORTANT:
// These match the FacultyRoutes.js you provided.
// No new timetable / attendance APIs are required here.
// =====================================================

const API_ENDPOINTS = {
  profile: "/faculty/get-my-faculty-profile",

  // Existing dummy timetable endpoint.
  // Requires faculty ID.
  timetable: (facultyId) => `/faculty/get-faculty-timetable/${facultyId}`,

  // Existing dummy attendance endpoint.
  // Requires faculty ID.
  attendance: (facultyId) => `/faculty/get-faculty-attendance/${facultyId}`,
};

// =====================================================
// NAVIGATION
// Change these only if your actual frontend routes differ.
// =====================================================

const NAVIGATION = {
  timetable: "/faculty/timetable",
  classTracking: "/faculty/class-tracking",
  attendance: "/faculty/attendance",
  profile: "/faculty/profile",
};

// =====================================================
// HELPERS
// =====================================================

function safeArray(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  return [];
}

function unwrapData(payload) {
  return (
    payload?.data?.data ||
    payload?.data?.faculty ||
    payload?.data?.attendance ||
    payload?.data?.timetable ||
    payload?.data ||
    payload ||
    null
  );
}

function getStartOfWeek(date) {
  const current = new Date(date);
  const day = current.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  current.setDate(current.getDate() + difference);
  current.setHours(0, 0, 0, 0);

  return current;
}

function getEndOfWeek(date) {
  const start = getStartOfWeek(date);
  const end = new Date(start);

  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return end;
}

function formatDate(date) {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return String(date);
  }

  return value.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date) {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return String(date);
  }

  return value.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function formatDay(date) {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString(undefined, {
    weekday: "long",
  });
}

function getScheduleDate(item) {
  return (
    item?.date ||
    item?.classDate ||
    item?.scheduledDate ||
    item?.startDate ||
    item?.dayDate ||
    item?.scheduleDate ||
    null
  );
}

function getScheduleDateObject(item) {
  const date = getScheduleDate(item);

  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getSubject(item) {
  return (
    item?.subjectName ||
    item?.subject ||
    item?.courseName ||
    item?.course ||
    item?.subjectCode ||
    "Subject"
  );
}

function getClassName(item) {
  return (
    item?.className ||
    item?.class ||
    item?.batch ||
    item?.section ||
    item?.classSection ||
    "Class"
  );
}

function getRoom(item) {
  return (
    item?.room || item?.roomNumber || item?.classRoom || item?.classroom || "-"
  );
}

function getStartTime(item) {
  return (
    item?.startTime ||
    item?.fromTime ||
    item?.start ||
    item?.timeFrom ||
    item?.start_time ||
    ""
  );
}

function getEndTime(item) {
  return (
    item?.endTime ||
    item?.toTime ||
    item?.end ||
    item?.timeTo ||
    item?.end_time ||
    ""
  );
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  if (typeof value === "string" && /^\d{1,2}:\d{2}/.test(value.trim())) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getScheduleStatus(item) {
  const raw =
    item?.status ||
    item?.classStatus ||
    item?.attendanceStatus ||
    (item?.isCancelled ? "cancelled" : "scheduled");

  const status = String(raw || "scheduled")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (status === "canceled" || status === "cancelled" || status === "cancel") {
    return "cancelled";
  }

  if (
    status === "completed" ||
    status === "taken" ||
    status === "class_taken" ||
    status === "done"
  ) {
    return "completed";
  }

  if (
    status === "not_taken" ||
    status === "not-taken" ||
    status === "not taken"
  ) {
    return "not_taken";
  }

  if (
    status === "rescheduled" ||
    status === "reschedule" ||
    status === "reschedule_required"
  ) {
    return "rescheduled";
  }

  return "scheduled";
}

function getTopic(item) {
  return (
    item?.topic ||
    item?.classTopic ||
    item?.topicName ||
    item?.lectureTopic ||
    item?.lessonTopic ||
    ""
  );
}

function getReason(item) {
  return (
    item?.cancellationReason ||
    item?.cancelReason ||
    item?.reason ||
    item?.remarks ||
    ""
  );
}

function getAttendancePercentage(item) {
  const value =
    item?.attendancePercentage ??
    item?.percentage ??
    item?.attendancePercent ??
    item?.presentPercentage ??
    0;

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getFacultyId(faculty) {
  return (
    faculty?._id ||
    faculty?.id ||
    faculty?.facultyId ||
    faculty?.data?._id ||
    null
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  const normalized = String(status || "scheduled").toLowerCase();

  const configuration = {
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },

    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-rose-50 text-rose-700 ring-rose-200",
    },

    not_taken: {
      label: "Not Taken",
      icon: AlertTriangle,
      className: "bg-amber-50 text-amber-700 ring-amber-200",
    },

    rescheduled: {
      label: "Rescheduled",
      icon: RotateCcw,
      className: "bg-purple-50 text-purple-700 ring-purple-200",
    },

    scheduled: {
      label: "Scheduled",
      icon: CalendarCheck,
      className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    },
  };

  const config = configuration[normalized] || configuration.scheduled;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ title, value, subtitle, accent = "indigo", icon: Icon }) {
  const accentMap = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    purple: "bg-purple-50 text-purple-700",
    sky: "bg-sky-50 text-sky-700",
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {title}
          </div>

          <div className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </div>

          {subtitle ? (
            <div className="mt-2 text-sm text-gray-500">{subtitle}</div>
          ) : null}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            accentMap[accent] || accentMap.indigo
          }`}
        >
          {Icon ? <Icon size={20} /> : null}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// QUICK ACTION
// =====================================================

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-900/10 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <div className="font-semibold text-gray-900">{title}</div>

          <div className="mt-1 text-sm leading-5 text-gray-500">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

// =====================================================
// FACULTY DASHBOARD
// =====================================================

export default function FacultyDashboard() {
  const { api, user, logout } = useAuth();
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [faculty, setFaculty] = useState(null);

  const [timetable, setTimetable] = useState([]);

  const [attendanceRaw, setAttendanceRaw] = useState([]);

  const [attendanceSummary, setAttendanceSummary] = useState({
    totalClasses: 0,
    presentClasses: 0,
    absentClasses: 0,
    attendancePercentage: 0,
    classWise: [],
  });

  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));

  const [period, setPeriod] = useState("week");

  const [selectedDate, setSelectedDate] = useState("");

  const [sortBy, setSortBy] = useState("date");

  const [sortDirection, setSortDirection] = useState("asc");

  const [filters, setFilters] = useState({
    search: "",
    className: "all",
    subject: "all",
    status: "all",
    day: "all",
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ===================================================
  // LOAD PROFILE
  // ===================================================

  const loadProfile = useCallback(async () => {
    const response = await api.get(API_ENDPOINTS.profile);

    const payload = response?.data;

    const profile =
      payload?.data || payload?.faculty || payload?.facultyData || payload;

    setFaculty(profile || null);

    return profile;
  }, [api]);

  // ===================================================
  // LOAD TIMETABLE
  // ===================================================

  const loadTimetable = useCallback(
    async (facultyId) => {
      if (!facultyId) {
        setTimetable([]);
        return;
      }

      try {
        const response = await api.get(API_ENDPOINTS.timetable(facultyId));

        const payload = response?.data;

        const schedule = safeArray(payload, [
          "data",
          "timetable",
          "schedule",
          "classes",
        ]);

        setTimetable(schedule);
      } catch (error) {
        console.error("Faculty timetable error:", error);

        setTimetable([]);
      }
    },
    [api],
  );

  // ===================================================
  // LOAD ATTENDANCE
  // ===================================================

  const loadAttendance = useCallback(
    async (facultyId) => {
      if (!facultyId) {
        return;
      }

      try {
        const response = await api.get(API_ENDPOINTS.attendance(facultyId));

        const payload = response?.data;

        const data = payload?.data || payload?.attendance || payload || {};

        const records = safeArray(data, [
          "records",
          "attendance",
          "data",
          "classes",
          "classWise",
        ]);

        setAttendanceRaw(records);

        const classWise = safeArray(data, [
          "classWise",
          "classWiseAttendance",
          "classes",
        ]);

        const totalClasses = Number(
          data?.totalClasses ??
            data?.totalAttendance ??
            data?.totalRecords ??
            records.length ??
            0,
        );

        const presentClasses = Number(
          data?.presentClasses ??
            data?.attendedClasses ??
            data?.totalPresent ??
            data?.present ??
            0,
        );

        const absentClasses = Number(
          data?.absentClasses ?? data?.totalAbsent ?? data?.absent ?? 0,
        );

        let attendancePercentage = Number(
          data?.attendancePercentage ??
            data?.percentage ??
            data?.attendancePercent ??
            0,
        );

        if (!attendancePercentage && totalClasses > 0 && presentClasses >= 0) {
          attendancePercentage = (presentClasses / totalClasses) * 100;
        }

        setAttendanceSummary({
          totalClasses,
          presentClasses,
          absentClasses,
          attendancePercentage,
          classWise,
        });
      } catch (error) {
        console.error("Faculty attendance error:", error);

        setAttendanceRaw([]);

        setAttendanceSummary({
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
          attendancePercentage: 0,
          classWise: [],
        });
      }
    },
    [api],
  );

  // ===================================================
  // LOAD EVERYTHING
  // ===================================================

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        let profile = faculty;

        if (!profile) {
          profile = await loadProfile();
        }

        const facultyId = getFacultyId(profile);

        if (!facultyId) {
          throw new Error(
            "Faculty profile loaded, but faculty ID was not found.",
          );
        }

        await Promise.all([
          loadTimetable(facultyId),
          loadAttendance(facultyId),
        ]);
      } catch (error) {
        console.error("Faculty dashboard error:", error);

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load faculty dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [faculty, loadAttendance, loadProfile, loadTimetable],
  );

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadDashboard();

    const intervalId = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  // ===================================================
  // PROFILE
  // ===================================================

  const userData =
    faculty?.userId || faculty?.user || faculty?.userDetails || user || {};

  const facultyName =
    faculty?.fullName ||
    faculty?.name ||
    userData?.fullName ||
    userData?.name ||
    userData?.email ||
    "Faculty";

  const employeeId = faculty?.employeeId || faculty?.employeeID || "-";

  const department = faculty?.department || faculty?.departmentName || "-";

  const designation = faculty?.designation || faculty?.position || "Faculty";

  // ===================================================
  // WEEK INFO
  // ===================================================

  const weekEnd = useMemo(() => getEndOfWeek(currentWeek), [currentWeek]);

  const isCurrentWeek = useMemo(() => {
    return (
      getStartOfWeek(new Date()).getTime() ===
      getStartOfWeek(currentWeek).getTime()
    );
  }, [currentWeek]);

  // ===================================================
  // WEEK NAVIGATION
  // ===================================================

  const goToPreviousWeek = () => {
    setCurrentWeek((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(getStartOfWeek(new Date()));
    setPeriod("week");
    setSelectedDate("");
  };

  // ===================================================
  // FILTER OPTIONS
  // ===================================================

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(
        timetable
          .map(getClassName)
          .filter((value) => value && value !== "Class"),
      ),
    ).sort();
  }, [timetable]);

  const subjectOptions = useMemo(() => {
    return Array.from(
      new Set(
        timetable
          .map(getSubject)
          .filter((value) => value && value !== "Subject"),
      ),
    ).sort();
  }, [timetable]);

  // ===================================================
  // PERIOD FILTER
  // ===================================================

  const periodFilteredTimetable = useMemo(() => {
    const now = new Date();

    if (period === "all") {
      return [...timetable];
    }

    if (period === "date") {
      if (!selectedDate) {
        return [...timetable];
      }

      const target = new Date(`${selectedDate}T00:00:00`);

      return timetable.filter((item) => {
        const date = getScheduleDateObject(item);

        if (!date) return false;

        return (
          date.getFullYear() === target.getFullYear() &&
          date.getMonth() === target.getMonth() &&
          date.getDate() === target.getDate()
        );
      });
    }

    if (period === "week") {
      const start = getStartOfWeek(currentWeek);
      const end = getEndOfWeek(currentWeek);

      return timetable.filter((item) => {
        const date = getScheduleDateObject(item);

        if (!date) return false;

        return date >= start && date <= end;
      });
    }

    if (period === "month") {
      return timetable.filter((item) => {
        const date = getScheduleDateObject(item);

        if (!date) return false;

        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      });
    }

    if (period === "year") {
      return timetable.filter((item) => {
        const date = getScheduleDateObject(item);

        if (!date) return false;

        return date.getFullYear() === now.getFullYear();
      });
    }

    return [...timetable];
  }, [timetable, period, selectedDate, currentWeek]);

  // ===================================================
  // FILTER + SORT
  // ===================================================

  const filteredTimetable = useMemo(() => {
    let result = [...periodFilteredTimetable];

    const search = filters.search.trim().toLowerCase();

    if (search) {
      result = result.filter((item) => {
        const searchable = [
          getSubject(item),
          getClassName(item),
          getRoom(item),
          getTopic(item),
          getReason(item),
          item?.facultyName,
          item?.subjectCode,
          item?.courseCode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(search);
      });
    }

    if (filters.className !== "all") {
      result = result.filter(
        (item) => getClassName(item) === filters.className,
      );
    }

    if (filters.subject !== "all") {
      result = result.filter((item) => getSubject(item) === filters.subject);
    }

    if (filters.status !== "all") {
      result = result.filter(
        (item) => getScheduleStatus(item) === filters.status,
      );
    }

    if (filters.day !== "all") {
      result = result.filter((item) => {
        const date = getScheduleDateObject(item);

        if (!date) return false;

        return (
          date.toLocaleDateString(undefined, {
            weekday: "long",
          }) === filters.day
        );
      });
    }

    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison =
          (getScheduleDateObject(a)?.getTime() || 0) -
          (getScheduleDateObject(b)?.getTime() || 0);
      }

      if (sortBy === "subject") {
        comparison = getSubject(a).localeCompare(getSubject(b));
      }

      if (sortBy === "class") {
        comparison = getClassName(a).localeCompare(getClassName(b));
      }

      if (sortBy === "status") {
        comparison = getScheduleStatus(a).localeCompare(getScheduleStatus(b));
      }

      if (sortBy === "room") {
        comparison = getRoom(a).localeCompare(getRoom(b));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [periodFilteredTimetable, filters, sortBy, sortDirection]);

  // ===================================================
  // GROUP BY DATE
  // ===================================================

  const groupedTimetable = useMemo(() => {
    const groups = {};

    filteredTimetable.forEach((item) => {
      const date = getScheduleDateObject(item);

      if (!date) {
        const key = "unknown";

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(item);

        return;
      }

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return groups;
  }, [filteredTimetable]);

  // ===================================================
  // TIMETABLE ANALYTICS
  // ===================================================

  const timetableAnalytics = useMemo(() => {
    const source = periodFilteredTimetable;

    const result = {
      total: source.length,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      notTaken: 0,
      rescheduled: 0,
      unknown: 0,
    };

    source.forEach((item) => {
      const status = getScheduleStatus(item);

      if (status === "scheduled") result.scheduled += 1;
      else if (status === "completed") result.completed += 1;
      else if (status === "cancelled") result.cancelled += 1;
      else if (status === "not_taken") result.notTaken += 1;
      else if (status === "rescheduled") result.rescheduled += 1;
      else result.unknown += 1;
    });

    return result;
  }, [periodFilteredTimetable]);

  // ===================================================
  // ATTENDANCE ANALYTICS
  // ===================================================

  const attendanceAnalytics = useMemo(() => {
    let total = Number(attendanceSummary.totalClasses || 0);

    let present = Number(attendanceSummary.presentClasses || 0);

    let absent = Number(attendanceSummary.absentClasses || 0);

    if (!total && attendanceRaw.length) {
      total = attendanceRaw.length;
    }

    if (!present && attendanceRaw.length) {
      present = attendanceRaw.filter((item) => {
        const status = String(
          item?.status || item?.attendanceStatus || item?.state || "",
        ).toLowerCase();

        return status === "present" || status === "p" || item?.present === true;
      }).length;
    }

    if (!absent && attendanceRaw.length) {
      absent = attendanceRaw.filter((item) => {
        const status = String(
          item?.status || item?.attendanceStatus || item?.state || "",
        ).toLowerCase();

        return status === "absent" || status === "a" || item?.present === false;
      }).length;
    }

    let percentage = Number(attendanceSummary.attendancePercentage || 0);

    if (!percentage && total > 0) {
      percentage = (present / total) * 100;
    }

    return {
      total,
      present,
      absent,
      percentage,
    };
  }, [attendanceRaw, attendanceSummary]);

  // ===================================================
  // OVERALL ANALYTICS
  // ===================================================

  const overallAnalytics = useMemo(() => {
    const total = timetableAnalytics.total;

    const actionable =
      timetableAnalytics.completed +
      timetableAnalytics.notTaken +
      timetableAnalytics.cancelled +
      timetableAnalytics.rescheduled;

    const completionPercentage =
      total > 0 ? (timetableAnalytics.completed / total) * 100 : 0;

    const cancellationPercentage =
      total > 0 ? (timetableAnalytics.cancelled / total) * 100 : 0;

    const reschedulePercentage =
      total > 0 ? (timetableAnalytics.rescheduled / total) * 100 : 0;

    return {
      total,
      actionable,
      completionPercentage,
      cancellationPercentage,
      reschedulePercentage,
    };
  }, [timetableAnalytics]);

  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  const clearFilters = () => {
    setFilters({
      search: "",
      className: "all",
      subject: "all",
      status: "all",
      day: "all",
    });

    setSortBy("date");
    setSortDirection("asc");
  };

  // ===================================================
  // EXPORT CSV / EXCEL
  // ===================================================

  const exportExcel = () => {
    const headers = [
      "Date",
      "Day",
      "Start Time",
      "End Time",
      "Subject",
      "Class",
      "Room",
      "Topic",
      "Status",
      "Reason",
    ];

    const rows = filteredTimetable.map((item) => [
      formatDate(getScheduleDate(item)),
      formatDay(getScheduleDate(item)),
      formatTime(getStartTime(item)),
      formatTime(getEndTime(item)),
      getSubject(item),
      getClassName(item),
      getRoom(item),
      getTopic(item),
      getScheduleStatus(item),
      getReason(item),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    downloadBlob(
      csv,
      `faculty-timetable-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8;",
    );
  };

  // ===================================================
  // EXPORT WORD
  // ===================================================

  const exportWord = () => {
    const rows = filteredTimetable
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(formatDate(getScheduleDate(item)))}</td>
            <td>${escapeHtml(formatDay(getScheduleDate(item)))}</td>
            <td>${escapeHtml(formatTime(getStartTime(item)))}</td>
            <td>${escapeHtml(formatTime(getEndTime(item)))}</td>
            <td>${escapeHtml(getSubject(item))}</td>
            <td>${escapeHtml(getClassName(item))}</td>
            <td>${escapeHtml(getRoom(item))}</td>
            <td>${escapeHtml(getTopic(item))}</td>
            <td>${escapeHtml(getScheduleStatus(item))}</td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Faculty Timetable</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
            }

            h1 {
              text-align: center;
            }

            .faculty {
              margin-bottom: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #999;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #f2f2f2;
            }
          </style>
        </head>

        <body>
          <h1>Faculty Timetable</h1>

          <div class="faculty">
            <strong>Faculty:</strong>
            ${escapeHtml(facultyName)}
            <br />

            <strong>Employee ID:</strong>
            ${escapeHtml(employeeId)}
            <br />

            <strong>Department:</strong>
            ${escapeHtml(department)}
            <br />

            <strong>Generated:</strong>
            ${escapeHtml(formatDate(new Date()))}
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Room</th>
                <th>Topic</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    downloadBlob(
      html,
      `faculty-timetable-${new Date().toISOString().slice(0, 10)}.doc`,
      "application/msword",
    );
  };

  // ===================================================
  // PRINT / PDF
  // ===================================================

  const printTimetable = () => {
    const rows = filteredTimetable
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(formatDate(getScheduleDate(item)))}</td>
            <td>${escapeHtml(formatDay(getScheduleDate(item)))}</td>
            <td>${escapeHtml(formatTime(getStartTime(item)))}</td>
            <td>${escapeHtml(formatTime(getEndTime(item)))}</td>
            <td>${escapeHtml(getSubject(item))}</td>
            <td>${escapeHtml(getClassName(item))}</td>
            <td>${escapeHtml(getRoom(item))}</td>
            <td>${escapeHtml(getTopic(item))}</td>
            <td>${escapeHtml(getScheduleStatus(item))}</td>
          </tr>
        `,
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Faculty Timetable</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #111827;
            }

            h1 {
              margin-bottom: 5px;
              text-align: center;
            }

            .subtitle {
              text-align: center;
              color: #6b7280;
              margin-bottom: 25px;
            }

            .information {
              margin-bottom: 25px;
              line-height: 1.7;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #d1d5db;
              padding: 8px;
              font-size: 12px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
            }

            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>

        <body>
          <h1>Faculty Timetable</h1>

          <div class="subtitle">
            ${escapeHtml(formatDate(new Date()))}
          </div>

          <div class="information">
            <strong>Faculty:</strong>
            ${escapeHtml(facultyName)}
            <br />

            <strong>Employee ID:</strong>
            ${escapeHtml(employeeId)}
            <br />

            <strong>Department:</strong>
            ${escapeHtml(department)}
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Room</th>
                <th>Topic</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  // ===================================================
  // TOGGLE SORT
  // ===================================================

  const changeSort = (value) => {
    if (sortBy === value) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(value);
      setSortDirection("asc");
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/10">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <RefreshCw size={18} className="animate-spin text-indigo-600" />
            Loading faculty dashboard...
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <GraduationCap size={27} />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Faculty Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Welcome, {facultyName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadDashboard({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div>
              <div className="font-semibold">
                Dashboard data could not be fully loaded.
              </div>

              <div className="mt-1">{errorMessage}</div>
            </div>
          </div>
        ) : null}

        {/* =================================================
            FACULTY INFORMATION
        ================================================= */}

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Faculty
              </div>

              <div className="mt-1 font-semibold text-gray-900">
                {facultyName}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Employee ID
              </div>

              <div className="mt-1 font-semibold text-gray-900">
                {employeeId}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Department
              </div>

              <div className="mt-1 font-semibold text-gray-900">
                {department}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Designation
              </div>

              <div className="mt-1 font-semibold text-gray-900">
                {designation}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Faculty Operations
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly access the areas you operate most frequently.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction
              icon={CalendarDays}
              title="Manage Timetable"
              description="View and update your timetable."
              onClick={() => navigate(NAVIGATION.timetable)}
            />

            <QuickAction
              icon={CheckCircle2}
              title="Mark Class Status"
              description="Completed, not taken, cancelled or rescheduled."
              onClick={() => navigate(NAVIGATION.classTracking)}
            />

            <QuickAction
              icon={ClipboardCheck}
              title="Mark Attendance"
              description="Open student attendance for your classes."
              onClick={() => navigate(NAVIGATION.attendance)}
            />

            <QuickAction
              icon={Edit3}
              title="Update Profile"
              description="Update your faculty information."
              onClick={() => navigate(NAVIGATION.profile)}
            />
          </div>
        </div>

        {/* =================================================
            WEEK SELECTOR
        ================================================= */}

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Current Teaching Week
              </div>

              <div className="mt-1 text-xl font-semibold text-gray-900">
                {formatDate(currentWeek)}
                {" — "}
                {formatDate(weekEnd)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousWeek}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100"
                title="Previous week"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={goToCurrentWeek}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  isCurrentWeek
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                This Week
              </button>

              <button
                type="button"
                onClick={goToNextWeek}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100"
                title="Next week"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            OVERALL CLASS ANALYTICS
        ================================================= */}

        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Overall Class Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Status of the timetable records currently available.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Total Classes"
              value={timetableAnalytics.total}
              subtitle="Scheduled records"
              accent="indigo"
              icon={BookOpen}
            />

            <StatCard
              title="Completed"
              value={timetableAnalytics.completed}
              subtitle={`${overallAnalytics.completionPercentage.toFixed(
                1,
              )}% completed`}
              accent="emerald"
              icon={CheckCircle2}
            />

            <StatCard
              title="Not Taken"
              value={timetableAnalytics.notTaken}
              subtitle="Requires attention"
              accent="amber"
              icon={AlertTriangle}
            />

            <StatCard
              title="Cancelled"
              value={timetableAnalytics.cancelled}
              subtitle={`${overallAnalytics.cancellationPercentage.toFixed(
                1,
              )}% cancelled`}
              accent="rose"
              icon={XCircle}
            />

            <StatCard
              title="Rescheduled"
              value={timetableAnalytics.rescheduled}
              subtitle={`${overallAnalytics.reschedulePercentage.toFixed(
                1,
              )}% rescheduled`}
              accent="purple"
              icon={RotateCcw}
            />

            <StatCard
              title="Scheduled"
              value={timetableAnalytics.scheduled}
              subtitle="Upcoming / pending"
              accent="sky"
              icon={CalendarCheck}
            />
          </div>
        </div>

        {/* =================================================
            ATTENDANCE ANALYTICS
        ================================================= */}

        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance Analytics
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Attendance information returned by the existing faculty attendance
              endpoint.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Attendance Classes"
              value={attendanceAnalytics.total}
              subtitle="Total attendance records"
              accent="indigo"
              icon={ClipboardCheck}
            />

            <StatCard
              title="Present"
              value={attendanceAnalytics.present}
              subtitle="Present records"
              accent="emerald"
              icon={CheckCircle2}
            />

            <StatCard
              title="Absent"
              value={attendanceAnalytics.absent}
              subtitle="Absent records"
              accent="rose"
              icon={XCircle}
            />

            <StatCard
              title="Attendance"
              value={`${attendanceAnalytics.percentage.toFixed(1)}%`}
              subtitle="Overall percentage"
              accent="purple"
              icon={Users}
            />
          </div>

          <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Overall Attendance
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Present vs total attendance records
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-900">
                {attendanceAnalytics.percentage.toFixed(1)}%
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(attendanceAnalytics.percentage, 0),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* =================================================
            ATTENDANCE CLASS-WISE
        ================================================= */}

        {attendanceSummary.classWise?.length > 0 ? (
          <div className="mb-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Class-wise Attendance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Attendance performance for classes handled by you.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {attendanceSummary.classWise.map((item, index) => {
                const className =
                  item?.className || item?.class || item?.batch || "Class";

                const subject =
                  item?.subjectName || item?.subject || item?.courseName || "";

                const percentage = getAttendancePercentage(item);

                return (
                  <div
                    key={item?._id || `${className}-${subject}-${index}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {className}
                        </div>

                        {subject ? (
                          <div className="mt-1 text-xs text-gray-500">
                            {subject}
                          </div>
                        ) : null}
                      </div>

                      <div className="font-bold text-gray-900">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* =================================================
            PERIOD / DATE FILTER
        ================================================= */}

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Calendar size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Timetable Period</h2>

              <p className="mt-1 text-sm text-gray-500">
                View timetable by date, week, month or year.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <button
              type="button"
              onClick={() => setPeriod("date")}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                period === "date"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Specific Date
            </button>

            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                period === "week"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Week
            </button>

            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                period === "month"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() => setPeriod("year")}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                period === "year"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Year
            </button>

            <button
              type="button"
              onClick={() => setPeriod("all")}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                period === "all"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Available
            </button>
          </div>

          {period === "date" ? (
            <div className="mt-4 max-w-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Select Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          ) : null}
        </div>

        {/* =================================================
            FILTERS + SORT
        ================================================= */}

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Filter size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Filter & Sort Timetable
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Search, filter and sort your classes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                value={filters.search}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    search: event.target.value,
                  }))
                }
                placeholder="Search subject, class, room, topic..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={filters.className}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  className: event.target.value,
                }))
              }
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Classes</option>

              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  subject: event.target.value,
                }))
              }
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Subjects</option>

              {subjectOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="not_taken">Not Taken</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>

            <select
              value={filters.day}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  day: event.target.value,
                }))
              }
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => changeSort(event.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="date">Sort by Date</option>
              <option value="subject">Sort by Subject</option>
              <option value="class">Sort by Class</option>
              <option value="status">Sort by Status</option>
              <option value="room">Sort by Room</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["date", "Date"],
              ["subject", "Subject"],
              ["class", "Class"],
              ["status", "Status"],
              ["room", "Room"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeSort(value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  sortBy === value
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sortBy === value ? (
                  sortDirection === "asc" ? (
                    <ArrowUpAZ size={13} />
                  ) : (
                    <ArrowDownAZ size={13} />
                  )
                ) : (
                  <ListFilter size={13} />
                )}

                {label}
              </button>
            ))}
          </div>
        </div>

        {/* =================================================
            EXPORT / PREVIEW
        ================================================= */}

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Preview & Export</h2>

              <p className="mt-1 text-sm text-gray-500">
                Export the currently filtered timetable.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={printTimetable}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Printer size={16} />
                Preview / PDF
              </button>

              <button
                type="button"
                onClick={exportWord}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FileText size={16} />
                Word
              </button>

              <button
                type="button"
                onClick={exportExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            TIMETABLE
        ================================================= */}

        <div className="mb-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {period === "week"
                  ? "Current Week Timetable"
                  : "Faculty Timetable"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredTimetable.length} of{" "}
                {periodFilteredTimetable.length} available classes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(NAVIGATION.timetable)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Settings2 size={15} />
              Update Timetable
            </button>
          </div>

          {Object.keys(groupedTimetable).length === 0 ? (
            <div className="rounded-2xl bg-gray-50 px-5 py-12 text-center ring-1 ring-gray-200">
              <CalendarDays size={34} className="mx-auto mb-3 text-gray-400" />

              <div className="font-semibold text-gray-900">
                No timetable entries found
              </div>

              <div className="mt-1 text-sm text-gray-500">
                Try another date, period or filter.
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedTimetable).map(([dateKey, classes]) => {
                const date =
                  dateKey === "unknown"
                    ? null
                    : new Date(`${dateKey}T00:00:00`);

                return (
                  <div
                    key={dateKey}
                    className="overflow-hidden rounded-2xl border border-gray-100"
                  >
                    <div className="flex flex-col gap-3 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {date ? formatDay(date) : "Date Not Available"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {date ? formatDate(date) : "No date supplied by API"}
                        </div>
                      </div>

                      <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                        {classes.length}{" "}
                        {classes.length === 1 ? "Class" : "Classes"}
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {classes.map((item, index) => {
                        const status = getScheduleStatus(item);

                        const topic = getTopic(item);

                        return (
                          <div
                            key={item?._id || `${dateKey}-${index}`}
                            className="p-5 transition hover:bg-gray-50"
                          >
                            <div className="grid gap-5 lg:grid-cols-[150px_1fr_auto] lg:items-center">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                                  <Clock3 size={18} />
                                </div>

                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {formatTime(getStartTime(item))}
                                  </div>

                                  <div className="mt-1 text-xs text-gray-500">
                                    {formatTime(getEndTime(item))}
                                  </div>
                                </div>
                              </div>

                              <div className="min-w-0">
                                <div className="text-base font-semibold text-gray-900">
                                  {getSubject(item)}
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                    <Users size={13} />
                                    {getClassName(item)}
                                  </span>

                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    Room: {getRoom(item)}
                                  </span>
                                </div>

                                {topic ? (
                                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                                    <BookOpen
                                      size={15}
                                      className="mt-0.5 shrink-0 text-indigo-500"
                                    />

                                    <span>
                                      <span className="font-semibold text-gray-800">
                                        Topic:
                                      </span>{" "}
                                      {topic}
                                    </span>
                                  </div>
                                ) : null}

                                {getReason(item) ? (
                                  <div className="mt-2 flex items-start gap-2 text-sm text-rose-600">
                                    <AlertCircle
                                      size={15}
                                      className="mt-0.5 shrink-0"
                                    />

                                    <span>
                                      <span className="font-semibold">
                                        Reason:
                                      </span>{" "}
                                      {getReason(item)}
                                    </span>
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex flex-col items-start gap-3 lg:items-end">
                                <StatusBadge status={status} />

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(NAVIGATION.classTracking, {
                                        state: {
                                          timetableItem: item,
                                        },
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                  >
                                    <CheckCircle2 size={13} />
                                    Class Status
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(NAVIGATION.attendance, {
                                        state: {
                                          timetableItem: item,
                                        },
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                                  >
                                    <ClipboardCheck size={13} />
                                    Attendance
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =================================================
            OPERATION SUMMARY
        ================================================= */}

        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Faculty Work Summary
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quick operational overview of your teaching activities.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <CalendarCheck size={18} />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Classes
                  </div>

                  <div className="text-xl font-bold text-gray-900">
                    {timetableAnalytics.total}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Total timetable entries in the selected period.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Completion
                  </div>

                  <div className="text-xl font-bold text-gray-900">
                    {overallAnalytics.completionPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Classes currently marked completed.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <RotateCcw size={18} />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Rescheduled
                  </div>

                  <div className="text-xl font-bold text-gray-900">
                    {timetableAnalytics.rescheduled}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Classes requiring another schedule.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <XCircle size={18} />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Cancelled
                  </div>

                  <div className="text-xl font-bold text-gray-900">
                    {timetableAnalytics.cancelled}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Cancelled classes in the selected period.
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            BOTTOM OPERATIONS
        ================================================= */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              More Faculty Operations
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Other areas that can be connected to this dashboard as your
              faculty module grows.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate(NAVIGATION.classTracking)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <CheckCircle2 size={18} className="text-emerald-600" />

              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Class Tracking
                </div>

                <div className="text-xs text-gray-500">
                  Taken / not taken / cancelled
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate(NAVIGATION.attendance)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <ClipboardCheck size={18} className="text-indigo-600" />

              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Student Attendance
                </div>

                <div className="text-xs text-gray-500">
                  Mark and update attendance
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate(NAVIGATION.timetable)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <CalendarDays size={18} className="text-purple-600" />

              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Timetable Management
                </div>

                <div className="text-xs text-gray-500">
                  Add, edit and reschedule
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={printTimetable}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <Download size={18} className="text-sky-600" />

              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Export Reports
                </div>

                <div className="text-xs text-gray-500">Word / Excel / PDF</div>
              </div>
            </button>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="py-8 text-center text-xs text-gray-400">
          Faculty Dashboard · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

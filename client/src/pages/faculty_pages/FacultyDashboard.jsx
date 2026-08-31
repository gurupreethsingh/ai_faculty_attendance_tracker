import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import axios from "axios";
import globalBackendRoute from "../../config/Config";

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

/* =========================================================================
   HELPERS
   ========================================================================= */

const normalize = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeLower = (value) => normalize(value).toLowerCase();

const getToken = () => {
  return (
    localStorage.getItem("travel_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    ""
  );
};

const getStoredUser = () => {
  const possibleKeys = ["travel_user", "user", "currentUser", "authUser"];

  for (const key of possibleKeys) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        continue;
      }

      return JSON.parse(value);
    } catch {
      // Ignore malformed localStorage values.
    }
  }

  return null;
};

const getResponseData = (response) => {
  const data = response?.data;

  if (!data) {
    return null;
  }

  if (data.timetable) {
    return data.timetable;
  }

  if (data.data) {
    return data.data;
  }

  if (data.result) {
    return data.result;
  }

  return data;
};

const getTimetableFromResponse = (response) => {
  const payload = getResponseData(response);

  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  if (Array.isArray(payload.timetables)) {
    return payload.timetables[0] || null;
  }

  if (Array.isArray(payload.data)) {
    return payload.data[0] || null;
  }

  return payload;
};

const parsePeriodNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
};

const formatTime = (value) => {
  const time = normalize(value);

  if (!time) {
    return "--";
  }

  return time;
};

const formatSlotType = (value) => {
  const text = normalize(value);

  if (!text) {
    return "Subject";
  }

  return text
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatSessionType = (value) => {
  const text = normalize(value);

  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const escapeCsv = (value) => {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const downloadBlob = (content, fileName, mimeType) => {
  const blob = new Blob([content], {
    type: mimeType,
  });

  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  window.URL.revokeObjectURL(url);
};

const getFileSafeName = (value) => {
  return (
    normalize(value)
      .replace(/[^a-zA-Z0-9-_]+/g, "_")
      .replace(/^_+|_+$/g, "") || "Faculty_Timetable"
  );
};

function StatCard({ title, value, subtitle, icon: Icon, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </div>

          <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>

          <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    sky: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[type] || styles.default}`}
    >
      {children}
    </span>
  );
}

function EmptyCell() {
  return (
    <div className="flex min-h-[130px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
      <span className="text-xs font-medium text-gray-300">Free</span>
    </div>
  );
}

function TimetableCell({ entry }) {
  if (!entry) {
    return <EmptyCell />;
  }

  const slotType = normalizeLower(entry.slotType);
  const sessionType = normalizeLower(entry.sessionType);

  const isBreak =
    slotType === "break" || slotType === "short-break" || slotType === "lunch";

  const isFree = slotType === "free";

  if (isBreak || isFree) {
    return (
      <div className="flex min-h-[130px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center">
        <div className="text-sm font-bold text-gray-500">
          {formatSlotType(entry.slotType)}
        </div>

        {entry.startTime || entry.endTime ? (
          <div className="mt-1 text-[11px] text-gray-400">
            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
          </div>
        ) : null}

        {entry.remarks ? (
          <div className="mt-2 text-[10px] text-gray-400">{entry.remarks}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-[130px] rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-gray-900">
            {normalize(entry.subjectCode) ||
              normalize(entry.subjectName) ||
              "Untitled Subject"}
          </div>

          {entry.subjectCode && entry.subjectName ? (
            <div className="mt-1 line-clamp-2 text-xs font-medium text-gray-600">
              {entry.subjectName}
            </div>
          ) : null}
        </div>

        {sessionType ? (
          <Badge
            type={
              sessionType === "lab"
                ? "purple"
                : sessionType === "theory"
                  ? "indigo"
                  : "sky"
            }
          >
            {formatSessionType(entry.sessionType)}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 space-y-1.5">
        {entry.className ? (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <Users size={12} className="shrink-0 text-indigo-500" />

            <span className="truncate font-medium">{entry.className}</span>
          </div>
        ) : null}

        {(entry.program || entry.branch || entry.semester) && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <GraduationCap size={11} className="shrink-0 text-gray-400" />

            <span className="truncate">
              {[entry.program, entry.branch, entry.semester]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
        )}

        {entry.section ? (
          <div className="text-[10px] text-gray-500">
            Section: <span className="font-semibold">{entry.section}</span>
          </div>
        ) : null}

        {entry.roomNo ? (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <MapPin size={11} className="shrink-0 text-gray-400" />

            <span>Room {entry.roomNo}</span>
          </div>
        ) : null}
      </div>

      {entry.remarks ? (
        <div className="mt-3 border-t border-gray-100 pt-2 text-[10px] text-gray-400">
          {entry.remarks}
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function FacultyDashboard() {
  const [timetable, setTimetable] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    className: "all",
    subject: "all",
    branch: "all",
    semester: "all",
    room: "all",
    slotType: "all",
    sessionType: "all",
    day: "all",
  });

  const [showFilters, setShowFilters] = useState(true);

  /* =======================================================================
     FETCH TIMETABLE
     ======================================================================= */

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${globalBackendRoute}/api/timetable/get-my-timetable`,
        {
          headers,
          withCredentials: true,
        },
      );

      const timetableData = getTimetableFromResponse(response);

      if (!timetableData) {
        throw new Error("No timetable data was returned by the server.");
      }

      setTimetable(timetableData);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("FACULTY DASHBOARD TIMETABLE ERROR:", err);

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to load timetable.";

      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  /* =======================================================================
     RAW DATA
     ======================================================================= */

  const periods = useMemo(() => {
    if (!timetable) {
      return [];
    }

    const source = Array.isArray(timetable.periods) ? timetable.periods : [];

    return source
      .map((period) => ({
        ...period,
        period: parsePeriodNumber(period.period),
      }))
      .filter((period) => period.period !== null)
      .sort((a, b) => a.period - b.period);
  }, [timetable]);

  const entries = useMemo(() => {
    if (!timetable || !Array.isArray(timetable.entries)) {
      return [];
    }

    return timetable.entries.filter(Boolean);
  }, [timetable]);

  /* =======================================================================
     PERIOD FALLBACK
     ======================================================================= */

  const displayPeriods = useMemo(() => {
    if (periods.length > 0) {
      return periods;
    }

    /*
     * If periods somehow aren't stored but entries have period numbers,
     * still render Period 1-10.
     */

    const periodNumbers = new Set();

    entries.forEach((entry) => {
      const number = parsePeriodNumber(entry.period);

      if (number !== null) {
        periodNumbers.add(number);
      }
    });

    if (periodNumbers.size > 0) {
      return Array.from(periodNumbers)
        .sort((a, b) => a - b)
        .map((period) => ({
          period,
          startTime: "",
          endTime: "",
        }));
    }

    return Array.from({ length: 10 }, (_, index) => ({
      period: index + 1,
      startTime: "",
      endTime: "",
    }));
  }, [periods, entries]);

  /* =======================================================================
     OPTIONS
     ======================================================================= */

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(entries.map((item) => normalize(item.className)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const subjectOptions = useMemo(() => {
    return Array.from(
      new Set(
        entries
          .map(
            (item) =>
              normalize(item.subjectName) || normalize(item.subjectCode),
          )
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const branchOptions = useMemo(() => {
    return Array.from(
      new Set(entries.map((item) => normalize(item.branch)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const semesterOptions = useMemo(() => {
    return Array.from(
      new Set(entries.map((item) => normalize(item.semester)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const roomOptions = useMemo(() => {
    return Array.from(
      new Set(entries.map((item) => normalize(item.roomNo)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  /* =======================================================================
     FILTER ENTRIES
     ======================================================================= */

  const filteredEntries = useMemo(() => {
    const search = normalizeLower(filters.search);

    return entries.filter((entry) => {
      const entryClass = normalize(entry.className);

      const entrySubject =
        normalize(entry.subjectName) || normalize(entry.subjectCode);

      const searchableText = [
        entry.subjectCode,
        entry.subjectName,
        entry.className,
        entry.program,
        entry.branch,
        entry.semester,
        entry.section,
        entry.roomNo,
        entry.sessionType,
        entry.slotType,
        entry.remarks,
        entry.day,
      ]
        .map(normalizeLower)
        .join(" ");

      if (search && !searchableText.includes(search)) {
        return false;
      }

      if (filters.className !== "all" && entryClass !== filters.className) {
        return false;
      }

      if (filters.subject !== "all" && entrySubject !== filters.subject) {
        return false;
      }

      if (
        filters.branch !== "all" &&
        normalize(entry.branch) !== filters.branch
      ) {
        return false;
      }

      if (
        filters.semester !== "all" &&
        normalize(entry.semester) !== filters.semester
      ) {
        return false;
      }

      if (filters.room !== "all" && normalize(entry.roomNo) !== filters.room) {
        return false;
      }

      if (
        filters.slotType !== "all" &&
        normalize(entry.slotType) !== filters.slotType
      ) {
        return false;
      }

      if (
        filters.sessionType !== "all" &&
        normalize(entry.sessionType) !== filters.sessionType
      ) {
        return false;
      }

      if (filters.day !== "all" && normalize(entry.day) !== filters.day) {
        return false;
      }

      return true;
    });
  }, [entries, filters]);

  /* =======================================================================
     GRID
     ======================================================================= */

  const entryMap = useMemo(() => {
    const map = new Map();

    filteredEntries.forEach((entry) => {
      const day = normalize(entry.day);

      const period = parsePeriodNumber(entry.period);

      if (!day || period === null) {
        return;
      }

      map.set(`${day}-${period}`, entry);
    });

    return map;
  }, [filteredEntries]);

  /* =======================================================================
     ANALYTICS
     ======================================================================= */

  const analytics = useMemo(() => {
    const subjectEntries = filteredEntries.filter((entry) => {
      const slotType = normalizeLower(entry.slotType);

      return (
        slotType !== "break" &&
        slotType !== "short-break" &&
        slotType !== "lunch" &&
        slotType !== "free"
      );
    });

    const theory = subjectEntries.filter(
      (entry) => normalizeLower(entry.sessionType) === "theory",
    ).length;

    const labs = subjectEntries.filter(
      (entry) => normalizeLower(entry.sessionType) === "lab",
    ).length;

    const activities = subjectEntries.filter(
      (entry) => normalizeLower(entry.sessionType) === "activity",
    ).length;

    const uniqueSubjects = new Set(
      subjectEntries
        .map(
          (entry) =>
            normalize(entry.subjectCode) || normalize(entry.subjectName),
        )
        .filter(Boolean),
    );

    const uniqueClasses = new Set(
      subjectEntries.map((entry) => normalize(entry.className)).filter(Boolean),
    );

    const uniqueRooms = new Set(
      subjectEntries.map((entry) => normalize(entry.roomNo)).filter(Boolean),
    );

    const uniqueDays = new Set(
      subjectEntries.map((entry) => normalize(entry.day)).filter(Boolean),
    );

    const totalGridSlots = DAYS.length * displayPeriods.length;

    const occupiedSlots = filteredEntries.filter((entry) => {
      const slotType = normalizeLower(entry.slotType);

      return (
        slotType !== "break" &&
        slotType !== "short-break" &&
        slotType !== "lunch" &&
        slotType !== "free"
      );
    }).length;

    const occupancyPercentage =
      totalGridSlots > 0 ? (occupiedSlots / totalGridSlots) * 100 : 0;

    return {
      totalEntries: filteredEntries.length,
      subjectEntries: subjectEntries.length,
      theory,
      labs,
      activities,
      subjects: uniqueSubjects.size,
      classes: uniqueClasses.size,
      rooms: uniqueRooms.size,
      days: uniqueDays.size,
      totalGridSlots,
      occupiedSlots,
      freeSlots: Math.max(totalGridSlots - occupiedSlots, 0),
      occupancyPercentage,
    };
  }, [filteredEntries, displayPeriods]);

  /* =======================================================================
     FILTER ACTIONS
     ======================================================================= */

  const clearFilters = () => {
    setFilters({
      search: "",
      className: "all",
      subject: "all",
      branch: "all",
      semester: "all",
      room: "all",
      slotType: "all",
      sessionType: "all",
      day: "all",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== "all",
    );
  }, [filters]);

  /* =======================================================================
     PRINT / PDF
     ======================================================================= */

  const printTimetable = () => {
    window.print();
  };

  /* =======================================================================
     EXCEL EXPORT
     ======================================================================= */

  const exportExcel = () => {
    const headers = [
      "Day",
      "Period",
      "Start Time",
      "End Time",
      "Subject Code",
      "Subject Name",
      "Class",
      "Program",
      "Branch",
      "Semester",
      "Section",
      "Room No",
      "Session Type",
      "Slot Type",
      "Remarks",
    ];

    const rows = [];

    DAYS.forEach((day) => {
      displayPeriods.forEach((period) => {
        const entry = entryMap.get(`${day}-${period.period}`);

        rows.push([
          day,
          period.period,
          entry?.startTime || period.startTime || "",
          entry?.endTime || period.endTime || "",
          entry?.subjectCode || "",
          entry?.subjectName || "",
          entry?.className || "",
          entry?.program || "",
          entry?.branch || "",
          entry?.semester || "",
          entry?.section || "",
          entry?.roomNo || "",
          entry?.sessionType || "",
          entry?.slotType || "",
          entry?.remarks || "",
        ]);
      });
    });

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const fileName = `${getFileSafeName(
      timetable?.timetableTitle || "Faculty_Timetable",
    )}.csv`;

    downloadBlob(csv, fileName, "text/csv;charset=utf-8;");
  };

  /* =======================================================================
     WORD EXPORT
     ======================================================================= */

  const exportWord = () => {
    const title = normalize(timetable?.timetableTitle) || "Faculty Timetable";

    const institution = normalize(timetable?.institutionName) || "";

    const academicYear = normalize(timetable?.academicYear) || "";

    const facultyName = normalize(timetable?.facultyName) || "";

    const rows = DAYS.map((day) => {
      const cells = displayPeriods
        .map((period) => {
          const entry = entryMap.get(`${day}-${period.period}`);

          if (!entry) {
            return `
              <td style="height:90px;text-align:center;color:#999;">
                Free
              </td>
            `;
          }

          const subject =
            normalize(entry.subjectCode) ||
            normalize(entry.subjectName) ||
            "Free";

          const subjectName =
            entry.subjectCode && entry.subjectName
              ? `<div>${escapeHtml(entry.subjectName)}</div>`
              : "";

          return `
            <td style="vertical-align:top;height:90px;">
              <strong>${escapeHtml(subject)}</strong>
              ${subjectName}
              ${
                entry.className
                  ? `<div>Class: ${escapeHtml(entry.className)}</div>`
                  : ""
              }
              ${
                entry.section
                  ? `<div>Section: ${escapeHtml(entry.section)}</div>`
                  : ""
              }
              ${
                entry.roomNo
                  ? `<div>Room: ${escapeHtml(entry.roomNo)}</div>`
                  : ""
              }
              ${
                entry.sessionType
                  ? `<div>${escapeHtml(
                      formatSessionType(entry.sessionType),
                    )}</div>`
                  : ""
              }
            </td>
          `;
        })
        .join("");

      return `
        <tr>
          <th>${escapeHtml(day)}</th>
          ${cells}
        </tr>
      `;
    }).join("");

    const periodHeaders = displayPeriods
      .map(
        (period) => `
          <th>
            P${period.period}
            <br/>
            <span style="font-weight:normal;font-size:10px;">
              ${escapeHtml(formatTime(period.startTime))}
              -
              ${escapeHtml(formatTime(period.endTime))}
            </span>
          </th>
        `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />

        <title>${escapeHtml(title)}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 25px;
            color: #111827;
          }

          h1 {
            text-align: center;
            margin-bottom: 5px;
          }

          .meta {
            text-align: center;
            margin-bottom: 20px;
            color: #4b5563;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 7px;
            font-size: 10px;
          }

          th {
            background: #f3f4f6;
            text-align: center;
          }

          td {
            vertical-align: top;
          }

          .footer {
            margin-top: 20px;
            font-size: 10px;
            color: #6b7280;
          }

          @media print {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>

      <body>

        <h1>${escapeHtml(title)}</h1>

        <div class="meta">
          ${institution ? `<div>${escapeHtml(institution)}</div>` : ""}

          ${facultyName ? `<div>Faculty: ${escapeHtml(facultyName)}</div>` : ""}

          ${
            academicYear
              ? `<div>Academic Year: ${escapeHtml(academicYear)}</div>`
              : ""
          }
        </div>

        <table>
          <thead>
            <tr>
              <th>Day</th>
              ${periodHeaders}
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          Generated from Faculty Dashboard.
        </div>

      </body>
      </html>
    `;

    downloadBlob(html, `${getFileSafeName(title)}.doc`, "application/msword");
  };

  /* =======================================================================
     CURRENT TIMETABLE INFO
     ======================================================================= */

  const timetableTitle =
    normalize(timetable?.timetableTitle) || "Faculty Timetable";

  const institutionName = normalize(timetable?.institutionName) || "College";

  const academicYear = normalize(timetable?.academicYear) || "Academic Year";

  const facultyName =
    normalize(timetable?.facultyName) ||
    normalize(getStoredUser()?.name) ||
    normalize(getStoredUser()?.fullName) ||
    "Faculty";

  /* =======================================================================
     LOADING
     ======================================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 w-72 rounded-lg bg-gray-200" />

            <div className="mt-3 h-5 w-96 rounded bg-gray-200" />

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 rounded-2xl bg-gray-200" />
              ))}
            </div>

            <div className="mt-8 h-[600px] rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================================
     ERROR
     ======================================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-900/10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={28} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to load timetable
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              {error}
            </p>

            <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
              API:
              <span className="ml-1 font-mono text-gray-700">
                /api/timetable/get-my-timetable
              </span>
            </div>

            <button
              type="button"
              onClick={fetchTimetable}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================================
     MAIN UI
     ======================================================================= */

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="mx-auto max-w-[1900px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ===============================================================
            HEADER
        ================================================================ */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between print:mb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <CalendarDays size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {timetableTitle}
                </h1>

                <p className="mt-1 text-sm text-gray-500">{institutionName}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge type="indigo">Academic Year: {academicYear}</Badge>

              <Badge type="emerald">Faculty: {facultyName}</Badge>

              <Badge type="sky">{entries.length} timetable entries</Badge>

              {timetable?.status ? (
                <Badge type="purple">
                  Status: {formatSlotType(timetable.status)}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={fetchTimetable}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={printTimetable}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <FileText size={16} />
              PDF / Print
            </button>

            <button
              type="button"
              onClick={exportWord}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <FileText size={16} />
              Word
            </button>

            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <FileSpreadsheet size={16} />
              Excel
            </button>
          </div>
        </div>

        {/* ===============================================================
            ANALYTICS
        ================================================================ */}

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Timetable Analytics
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Overview of the timetable currently displayed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Total Entries"
              value={analytics.totalEntries}
              subtitle="Filtered timetable records"
              icon={Calendar}
            />

            <StatCard
              title="Classes"
              value={analytics.classes}
              subtitle="Unique classes"
              icon={Users}
            />

            <StatCard
              title="Subjects"
              value={analytics.subjects}
              subtitle="Unique subjects"
              icon={BookOpen}
            />

            <StatCard
              title="Theory"
              value={analytics.theory}
              subtitle="Theory periods"
              icon={GraduationCap}
            />

            <StatCard
              title="Labs"
              value={analytics.labs}
              subtitle="Lab periods"
              icon={Layers}
            />

            <StatCard
              title="Occupied"
              value={`${analytics.occupancyPercentage.toFixed(1)}%`}
              subtitle={`${analytics.occupiedSlots} occupied slots`}
              icon={CheckCircle2}
            />
          </div>
        </section>

        {/* ===============================================================
            FILTERS
        ================================================================ */}

        <section className="mb-8 rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/10 print:hidden">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Filter size={18} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">Filter Timetable</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Search and filter the timetable grid.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setShowFilters((previous) => !previous)}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                <ChevronDown
                  size={14}
                  className={`transition ${showFilters ? "rotate-180" : ""}`}
                />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          </div>

          {showFilters ? (
            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* SEARCH */}

                <div className="relative xl:col-span-2">
                  <Search
                    size={17}
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
                    placeholder="Search subject, class, room, branch..."
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* CLASS */}

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

                {/* SUBJECT */}

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

                {/* BRANCH */}

                <select
                  value={filters.branch}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      branch: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All Branches</option>

                  {branchOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {/* SEMESTER */}

                <select
                  value={filters.semester}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      semester: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All Semesters</option>

                  {semesterOptions.map((item) => (
                    <option key={item} value={item}>
                      Semester {item}
                    </option>
                  ))}
                </select>

                {/* ROOM */}

                <select
                  value={filters.room}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      room: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All Rooms</option>

                  {roomOptions.map((item) => (
                    <option key={item} value={item}>
                      Room {item}
                    </option>
                  ))}
                </select>

                {/* DAY */}

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

                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                {/* SESSION TYPE */}

                <select
                  value={filters.sessionType}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      sessionType: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All Session Types</option>

                  {SESSION_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {formatSessionType(item)}
                    </option>
                  ))}
                </select>

                {/* SLOT TYPE */}

                <select
                  value={filters.slotType}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      slotType: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All Slot Types</option>

                  {SLOT_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {formatSlotType(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  Showing:
                </span>

                <Badge type="indigo">{filteredEntries.length} entries</Badge>

                <Badge type="emerald">
                  {analytics.subjectEntries} teaching slots
                </Badge>

                <Badge type="default">
                  {analytics.freeSlots} free grid slots
                </Badge>
              </div>
            </div>
          ) : null}
        </section>

        {/* ===============================================================
            TIMETABLE INFORMATION
        ================================================================ */}

        <section className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 print:mb-5 print:shadow-none">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {timetableTitle}
              </h2>

              <p className="mt-1 text-sm text-gray-500">{institutionName}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Academic Year
                </div>

                <div className="mt-1 font-semibold text-gray-900">
                  {academicYear || "--"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Revision
                </div>

                <div className="mt-1 font-semibold text-gray-900">
                  {normalize(timetable?.revisionNumber) || "--"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Faculty
                </div>

                <div className="mt-1 font-semibold text-gray-900">
                  {facultyName}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Status
                </div>

                <div className="mt-1 font-semibold capitalize text-gray-900">
                  {normalize(timetable?.status) || "--"}
                </div>
              </div>
            </div>
          </div>

          {timetable?.lunchStartTime || timetable?.lunchEndTime ? (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <div className="text-xs text-gray-500">
                Lunch Break:
                <span className="ml-1 font-semibold text-gray-700">
                  {formatTime(timetable?.lunchStartTime)}
                  {" - "}
                  {formatTime(timetable?.lunchEndTime)}
                </span>
              </div>
            </div>
          ) : null}
        </section>

        {/* ===============================================================
            TIMETABLE GRID
        ================================================================ */}

        <section className="mb-8 rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/10 print:shadow-none print:ring-0">
          <div className="border-b border-gray-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Weekly Timetable
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Monday to Saturday · Period-wise schedule
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge type="indigo">{displayPeriods.length} Periods</Badge>

                <Badge type="emerald">{filteredEntries.length} Entries</Badge>

                {lastUpdated ? (
                  <Badge type="default">
                    Updated{" "}
                    {lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-30 w-[150px] min-w-[150px] border-b border-r border-gray-200 bg-gray-100 px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                    Day
                  </th>

                  {displayPeriods.map((period) => (
                    <th
                      key={period.period}
                      className="border-b border-r border-gray-200 bg-gray-100 px-3 py-3 text-center"
                    >
                      <div className="text-sm font-bold text-gray-900">
                        Period {period.period}
                      </div>

                      <div className="mt-1 whitespace-nowrap text-[10px] font-medium text-gray-500">
                        {formatTime(period.startTime)}
                        {" - "}
                        {formatTime(period.endTime)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {DAYS.map((day) => {
                  const dayEntries = filteredEntries.filter(
                    (entry) => normalize(entry.day) === day,
                  );

                  const dayHasEntries = dayEntries.length > 0;

                  return (
                    <tr key={day}>
                      <td className="sticky left-0 z-20 border-b border-r border-gray-200 bg-gray-50 p-3 align-top">
                        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-900/5">
                          <div className="text-sm font-bold text-gray-900">
                            {day}
                          </div>

                          <div className="mt-1 text-[10px] text-gray-500">
                            {dayEntries.length}{" "}
                            {dayEntries.length === 1 ? "class" : "classes"}
                          </div>

                          {!dayHasEntries ? (
                            <div className="mt-2 text-[10px] text-gray-300">
                              No classes
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {displayPeriods.map((period) => {
                        const entry = entryMap.get(`${day}-${period.period}`);

                        return (
                          <td
                            key={`${day}-${period.period}`}
                            className="border-b border-r border-gray-200 bg-gray-50/40 p-2 align-top"
                          >
                            <TimetableCell entry={entry} />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* GRID LEGEND */}

          <div className="flex flex-wrap gap-3 border-t border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded bg-indigo-100 ring-1 ring-indigo-200" />
              Theory
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded bg-purple-100 ring-1 ring-purple-200" />
              Lab
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded bg-gray-100 ring-1 ring-gray-200" />
              Free / Break
            </div>
          </div>
        </section>

        {/* ===============================================================
            SUBJECT SUMMARY
        ================================================================ */}

        <section className="mb-8 grid gap-6 lg:grid-cols-2 print:hidden">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-5">
              <h2 className="font-bold text-gray-900">Subject Summary</h2>

              <p className="mt-1 text-xs text-gray-500">
                Number of timetable periods assigned to each subject.
              </p>
            </div>

            <div className="space-y-3">
              {Array.from(
                filteredEntries.reduce((map, entry) => {
                  const key =
                    normalize(entry.subjectCode) ||
                    normalize(entry.subjectName) ||
                    "Unnamed";

                  map.set(key, (map.get(key) || 0) + 1);

                  return map;
                }, new Map()),
              )
                .sort((a, b) => b[1] - a[1])
                .map(([subject, count]) => (
                  <div
                    key={subject}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-800">
                        {subject}
                      </div>
                    </div>

                    <div className="ml-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-gray-200">
                      {count}
                    </div>
                  </div>
                ))}

              {filteredEntries.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No subjects match the current filters.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-5">
              <h2 className="font-bold text-gray-900">Class Summary</h2>

              <p className="mt-1 text-xs text-gray-500">
                Number of timetable periods assigned to each class.
              </p>
            </div>

            <div className="space-y-3">
              {Array.from(
                filteredEntries.reduce((map, entry) => {
                  const key =
                    normalize(entry.className) || "Class not specified";

                  map.set(key, (map.get(key) || 0) + 1);

                  return map;
                }, new Map()),
              )
                .sort((a, b) => b[1] - a[1])
                .map(([className, count]) => (
                  <div
                    key={className}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Users size={15} className="shrink-0 text-indigo-500" />

                      <div className="truncate text-sm font-semibold text-gray-800">
                        {className}
                      </div>
                    </div>

                    <div className="ml-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-gray-200">
                      {count}
                    </div>
                  </div>
                ))}

              {filteredEntries.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No classes match the current filters.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ===============================================================
            EXPORT PANEL
        ================================================================ */}

        <section className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 print:hidden">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Export Timetable
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Export the currently filtered timetable.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={printTimetable}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <FileText size={17} />
                Print / PDF
              </button>

              <button
                type="button"
                onClick={exportWord}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <FileText size={17} />
                Word
              </button>

              <button
                type="button"
                onClick={exportExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Download size={17} />
                Excel
              </button>
            </div>
          </div>
        </section>

        {/* ===============================================================
            FOOTER
        ================================================================ */}

        <div className="py-6 text-center text-xs text-gray-400 print:hidden">
          Faculty Timetable Dashboard · {new Date().getFullYear()}
        </div>
      </div>

      {/* ===============================================================
          PRINT CSS
      ================================================================ */}

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }

          body {
            background: white !important;
          }

          .min-h-screen {
            min-height: auto !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          thead {
            display: table-header-group;
          }

          .sticky {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}

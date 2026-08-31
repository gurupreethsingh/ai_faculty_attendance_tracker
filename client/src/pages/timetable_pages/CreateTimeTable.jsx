// // import React, { useEffect, useMemo, useState } from "react";
// // import axios from "axios";
// // import {
// //   FaArrowLeft,
// //   FaCalendarAlt,
// //   FaCheckCircle,
// //   FaChevronDown,
// //   FaClock,
// //   FaExclamationCircle,
// //   FaSave,
// //   FaSyncAlt,
// //   FaTrash,
// //   FaUserTie,
// //   FaUsers,
// //   FaBookOpen,
// //   FaBuilding,
// //   FaGraduationCap,
// //   FaDoorOpen,
// //   FaClipboardList,
// // } from "react-icons/fa";
// // import { Link, useNavigate } from "react-router-dom";
// // import globalBackendRoute from "../../config/Config";

// // const API_BASE_URL = `${globalBackendRoute}/api`;

// // const DAYS = [
// //   "Monday",
// //   "Tuesday",
// //   "Wednesday",
// //   "Thursday",
// //   "Friday",
// //   "Saturday",
// // ];

// // const PERIODS = [
// //   {
// //     period: 1,
// //     startTime: "9:10AM",
// //     endTime: "10:00AM",
// //   },
// //   {
// //     period: 2,
// //     startTime: "10:00AM",
// //     endTime: "10:50AM",
// //   },
// //   {
// //     period: 3,
// //     startTime: "10:50AM",
// //     endTime: "11:40AM",
// //   },
// //   {
// //     period: 4,
// //     startTime: "11:40AM",
// //     endTime: "12:30PM",
// //   },
// //   {
// //     period: 5,
// //     startTime: "12:30PM",
// //     endTime: "1:20PM",
// //   },
// //   {
// //     period: 6,
// //     startTime: "1:20PM",
// //     endTime: "2:10PM",
// //   },
// //   {
// //     period: 7,
// //     startTime: "2:10PM",
// //     endTime: "3:00PM",
// //   },
// //   {
// //     period: 8,
// //     startTime: "3:00PM",
// //     endTime: "3:10PM",
// //   },
// //   {
// //     period: 9,
// //     startTime: "3:10PM",
// //     endTime: "4:00PM",
// //   },
// //   {
// //     period: 10,
// //     startTime: "4:00PM",
// //     endTime: "4:50PM",
// //   },
// // ];

// // const SLOT_TYPES = [
// //   {
// //     value: "subject",
// //     label: "Subject",
// //   },
// //   {
// //     value: "lab",
// //     label: "Lab",
// //   },
// //   {
// //     value: "break",
// //     label: "Break",
// //   },
// //   {
// //     value: "short-break",
// //     label: "Short Break",
// //   },
// //   {
// //     value: "lunch",
// //     label: "Lunch",
// //   },
// //   {
// //     value: "sports",
// //     label: "Sports",
// //   },
// //   {
// //     value: "library",
// //     label: "Library",
// //   },
// //   {
// //     value: "activity",
// //     label: "Activity",
// //   },
// //   {
// //     value: "doubt-session",
// //     label: "Doubt Session",
// //   },
// //   {
// //     value: "cultural",
// //     label: "Cultural Activity",
// //   },
// //   {
// //     value: "outdoor-activity",
// //     label: "Outdoor Activity",
// //   },
// //   {
// //     value: "indoor-activity",
// //     label: "Indoor Activity",
// //   },
// //   {
// //     value: "free",
// //     label: "Free Period",
// //   },
// //   {
// //     value: "other",
// //     label: "Other",
// //   },
// // ];

// // const SPECIAL_LABELS = {
// //   break: "BREAK",
// //   "short-break": "SHORT BREAK",
// //   lunch: "LUNCH BREAK",
// //   sports: "SPORTS",
// //   library: "LIB",
// //   activity: "ACTIVITY",
// //   "doubt-session": "DOUBT SESSION",
// //   cultural: "CULTURAL CLUB ACTIVITY",
// //   "outdoor-activity": "OUTDOOR ACTIVITY",
// //   "indoor-activity": "INDOOR ACTIVITY",
// //   free: "FREE PERIOD",
// //   other: "OTHER",
// // };

// // const getToken = () => {
// //   return (
// //     localStorage.getItem("travel_token") ||
// //     localStorage.getItem("token") ||
// //     localStorage.getItem("accessToken") ||
// //     ""
// //   );
// // };

// // const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   withCredentials: true,
// // });

// // api.interceptors.request.use(
// //   (config) => {
// //     const token = getToken();
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error),
// // );

// // const getResponseData = (response) => {
// //   return (
// //     response?.data?.data ||
// //     response?.data?.faculties ||
// //     response?.data?.faculty ||
// //     response?.data?.results ||
// //     response?.data
// //   );
// // };

// // const normalizeFacultyArray = (response) => {
// //   const data = getResponseData(response);
// //   if (Array.isArray(data)) {
// //     return data;
// //   }
// //   if (Array.isArray(data?.faculties)) {
// //     return data.faculties;
// //   }
// //   if (Array.isArray(data?.data)) {
// //     return data.data;
// //   }
// //   if (Array.isArray(response?.data?.faculties)) {
// //     return response.data.faculties;
// //   }
// //   return [];
// // };

// // const getFacultyId = (faculty) => {
// //   return faculty?._id || faculty?.id || faculty?.facultyId || "";
// // };

// // const getFacultyName = (faculty) => {
// //   if (!faculty) {
// //     return "";
// //   }
// //   if (faculty.facultyName) {
// //     return faculty.facultyName;
// //   }
// //   if (faculty.fullName) {
// //     return faculty.fullName;
// //   }
// //   if (faculty.name) {
// //     return faculty.name;
// //   }
// //   if (faculty.employeeName) {
// //     return faculty.employeeName;
// //   }

// //   if (faculty.userId && typeof faculty.userId === "object") {
// //     return (
// //       faculty.userId.fullName ||
// //       faculty.userId.name ||
// //       faculty.userId.username ||
// //       faculty.userId.email ||
// //       ""
// //     );
// //   }
// //   return "";
// // };

// // const normalizeClasses = (faculty) => {
// //   if (!faculty) {
// //     return [];
// //   }

// //   const source = Array.isArray(faculty.classes)
// //     ? faculty.classes
// //     : Array.isArray(faculty.assignedClasses)
// //       ? faculty.assignedClasses
// //       : [];

// //   return source
// //     .map((item) => {
// //       if (typeof item === "string") {
// //         return {
// //           value: item.trim(),
// //           label: item.trim(),
// //         };
// //       }

// //       const value =
// //         item?.className || item?.name || item?.class || item?.class_name || "";

// //       return {
// //         value: String(value).trim(),
// //         label: String(value).trim(),
// //       };
// //     })
// //     .filter((item) => item.value);
// // };

// // const normalizeSubjects = (faculty) => {
// //   if (!faculty) {
// //     return [];
// //   }

// //   const source = Array.isArray(faculty.subjects)
// //     ? faculty.subjects
// //     : Array.isArray(faculty.assignedSubjects)
// //       ? faculty.assignedSubjects
// //       : [];

// //   return source
// //     .map((item) => {
// //       if (typeof item === "string") {
// //         return {
// //           subjectCode: item.trim().toUpperCase(),
// //           subjectName: item.trim(),
// //           ltp: "",
// //           credits: "",
// //         };
// //       }

// //       return {
// //         subjectCode: String(
// //           item?.subjectCode ||
// //             item?.code ||
// //             item?.courseCode ||
// //             item?.course_code ||
// //             "",
// //         )
// //           .trim()
// //           .toUpperCase(),

// //         subjectName: String(
// //           item?.subjectName ||
// //             item?.name ||
// //             item?.courseName ||
// //             item?.course_name ||
// //             "",
// //         ).trim(),

// //         ltp: String(
// //           item?.ltp ||
// //             item?.LTP ||
// //             item?.l_t_p ||
// //             item?.lectureTutorialPractical ||
// //             "",
// //         ).trim(),

// //         credits:
// //           item?.credits !== undefined && item?.credits !== null
// //             ? String(item.credits).trim()
// //             : "",
// //       };
// //     })
// //     .filter((item) => item.subjectCode);
// // };

// // const createEmptyEntry = (day, periodInfo) => {
// //   return {
// //     day,
// //     period: periodInfo.period,
// //     startTime: periodInfo.startTime,
// //     endTime: periodInfo.endTime,
// //     slotType: "free",
// //     subjectCode: "",
// //     subjectName: "",
// //     className: "",
// //     program: "",
// //     branch: "",
// //     semester: "",
// //     section: "",
// //     roomNo: "",
// //     sessionType: "other",
// //     remarks: "",
// //   };
// // };

// // const createInitialGrid = () => {
// //   const grid = {};
// //   DAYS.forEach((day) => {
// //     grid[day] = {};
// //     PERIODS.forEach((periodInfo) => {
// //       grid[day][periodInfo.period] = createEmptyEntry(day, periodInfo);
// //     });
// //   });
// //   return grid;
// // };

// // const getSlotLabel = (entry) => {
// //   if (!entry) {
// //     return "";
// //   }

// //   if (entry.slotType !== "subject" && entry.slotType !== "lab") {
// //     return SPECIAL_LABELS[entry.slotType] || entry.subjectName || "OTHER";
// //   }
// //   return entry.subjectCode || entry.subjectName || "";
// // };

// // const getEntryClass = (entry) => {
// //   if (!entry) {
// //     return "";
// //   }
// //   if (entry.slotType !== "subject" && entry.slotType !== "lab") {
// //     return "bg-slate-100 border-slate-300 text-slate-700";
// //   }
// //   if (entry.slotType === "lab") {
// //     return "bg-indigo-50 border-indigo-300 text-indigo-800";
// //   }
// //   return "bg-blue-50 border-blue-300 text-blue-800";
// // };

// // const CreateTimeTable = () => {
// //   const navigate = useNavigate();
// //   const [faculties, setFaculties] = useState([]);
// //   const [selectedFacultyId, setSelectedFacultyId] = useState("");
// //   const [selectedFaculty, setSelectedFaculty] = useState(null);
// //   const [classes, setClasses] = useState([]);
// //   const [subjects, setSubjects] = useState([]);
// //   const [grid, setGrid] = useState(createInitialGrid());
// //   const [academicYear, setAcademicYear] = useState("2026-2027");
// //   const [issueDate, setIssueDate] = useState("");
// //   const [effectiveFrom, setEffectiveFrom] = useState("");
// //   const [revisionNumber, setRevisionNumber] = useState("1.0");
// //   const [institutionName, setInstitutionName] = useState(
// //     "COLLEGE OF ENGINEERING & COMPUTER APPLICATION(CECA)",
// //   );
// //   const [timetableTitle, setTimetableTitle] = useState("Time Table");
// //   const [loadingFaculties, setLoadingFaculties] = useState(false);
// //   const [saving, setSaving] = useState(false);
// //   const [error, setError] = useState("");
// //   const [success, setSuccess] = useState("");
// //   const [activeCell, setActiveCell] = useState(null);
// //   const [cellEditor, setCellEditor] = useState({
// //     slotType: "free",
// //     subjectCode: "",
// //     className: "",
// //     program: "",
// //     branch: "",
// //     semester: "",
// //     section: "",
// //     roomNo: "",
// //     remarks: "",
// //   });

// //   useEffect(() => {
// //     fetchFaculties();
// //   }, []);

// //   useEffect(() => {
// //     if (!selectedFacultyId) {
// //       setSelectedFaculty(null);
// //       setClasses([]);
// //       setSubjects([]);
// //       return;
// //     }
// //     const faculty = faculties.find(
// //       (item) => String(getFacultyId(item)) === String(selectedFacultyId),
// //     );
// //     if (!faculty) {
// //       return;
// //     }
// //     setSelectedFaculty(faculty);
// //     const facultyClasses = normalizeClasses(faculty);
// //     const facultySubjects = normalizeSubjects(faculty);
// //     setClasses(facultyClasses);
// //     setSubjects(facultySubjects);
// //   }, [selectedFacultyId, faculties]);

// //   const fetchFaculties = async () => {
// //     try {
// //       setLoadingFaculties(true);
// //       setError("");
// //       setSuccess("");
// //       const response = await api.get("/faculty/get-all-faculties");
// //       const facultyList = normalizeFacultyArray(response);
// //       setFaculties(facultyList);

// //       if (facultyList.length === 0) {
// //         setError("No faculty records were found.");
// //       }
// //     } catch (err) {
// //       console.error("FETCH FACULTIES ERROR:", err);
// //       const message =
// //         err?.response?.data?.message || "Failed to load faculty records.";
// //       setError(message);
// //     } finally {
// //       setLoadingFaculties(false);
// //     }
// //   };

// //   const handleFacultyChange = (event) => {
// //     const facultyId = event.target.value;
// //     setSelectedFacultyId(facultyId);
// //     setGrid(createInitialGrid());
// //     setActiveCell(null);
// //     setSuccess("");
// //     setError("");

// //     if (!facultyId) {
// //       setSelectedFaculty(null);
// //       setClasses([]);
// //       setSubjects([]);
// //       return;
// //     }

// //     const faculty = faculties.find(
// //       (item) => String(getFacultyId(item)) === String(facultyId),
// //     );

// //     if (faculty) {
// //       setSelectedFaculty(faculty);
// //       setClasses(normalizeClasses(faculty));
// //       setSubjects(normalizeSubjects(faculty));
// //     }
// //   };

// //   const handleCellClick = (day, period) => {
// //     const entry = grid?.[day]?.[period];

// //     if (!entry) {
// //       return;
// //     }

// //     setActiveCell({
// //       day,
// //       period,
// //     });

// //     setCellEditor({
// //       slotType: entry.slotType || "free",
// //       subjectCode: entry.subjectCode || "",
// //       className: entry.className || "",
// //       program: entry.program || "",
// //       branch: entry.branch || "",
// //       semester: entry.semester || "",
// //       section: entry.section || "",
// //       roomNo: entry.roomNo || "",
// //       remarks: entry.remarks || "",
// //     });
// //     setError("");
// //   };

// //   const handleCellEditorChange = (field, value) => {
// //     setCellEditor((previous) => ({
// //       ...previous,
// //       [field]: value,
// //     }));
// //   };

// //   const applyCellEditor = () => {
// //     if (!activeCell) {
// //       return;
// //     }
// //     const { day, period } = activeCell;
// //     const periodInfo = PERIODS.find((item) => item.period === period);
// //     if (!periodInfo) {
// //       return;
// //     }

// //     let subjectCode = cellEditor.subjectCode;
// //     let subjectName = "";
// //     const selectedSubject = subjects.find(
// //       (item) =>
// //         item.subjectCode.toUpperCase() === String(subjectCode).toUpperCase(),
// //     );

// //     if (cellEditor.slotType === "subject" || cellEditor.slotType === "lab") {
// //       if (!subjectCode) {
// //         setError("Please select a subject.");
// //         return;
// //       }

// //       if (!selectedSubject) {
// //         setError("The selected subject is not assigned to this faculty.");
// //         return;
// //       }

// //       if (!cellEditor.className) {
// //         setError("Please select a class.");
// //         return;
// //       }
// //       const validClass = classes.some(
// //         (item) =>
// //           item.value.toLowerCase() === cellEditor.className.toLowerCase(),
// //       );
// //       if (!validClass) {
// //         setError("The selected class is not assigned to this faculty.");
// //         return;
// //       }

// //       subjectCode = selectedSubject.subjectCode;
// //       subjectName = selectedSubject.subjectName;
// //     } else {
// //       subjectCode = "";
// //       subjectName = SPECIAL_LABELS[cellEditor.slotType] || "Other";
// //     }

// //     const sessionType =
// //       cellEditor.slotType === "lab"
// //         ? "lab"
// //         : cellEditor.slotType === "subject"
// //           ? "theory"
// //           : cellEditor.slotType === "activity"
// //             ? "activity"
// //             : "other";
// //     const updatedEntry = {
// //       day,
// //       period,
// //       startTime: periodInfo.startTime,
// //       endTime: periodInfo.endTime,
// //       slotType: cellEditor.slotType,
// //       subjectCode,
// //       subjectName,
// //       className:
// //         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
// //           ? cellEditor.className
// //           : "",
// //       program:
// //         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
// //           ? cellEditor.program
// //           : "",
// //       branch:
// //         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
// //           ? cellEditor.branch
// //           : "",
// //       semester:
// //         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
// //           ? cellEditor.semester
// //           : "",
// //       section:
// //         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
// //           ? cellEditor.section
// //           : "",
// //       roomNo:
// //         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
// //           ? cellEditor.roomNo
// //           : "",
// //       sessionType,
// //       remarks: cellEditor.remarks || "",
// //     };

// //     setGrid((previous) => ({
// //       ...previous,
// //       [day]: {
// //         ...previous[day],
// //         [period]: updatedEntry,
// //       },
// //     }));
// //     setError("");
// //     setSuccess("");
// //     setActiveCell(null);
// //   };

// //   const clearCell = () => {
// //     if (!activeCell) {
// //       return;
// //     }
// //     const { day, period } = activeCell;
// //     const periodInfo = PERIODS.find((item) => item.period === period);
// //     if (!periodInfo) {
// //       return;
// //     }

// //     setGrid((previous) => ({
// //       ...previous,
// //       [day]: {
// //         ...previous[day],
// //         [period]: createEmptyEntry(day, periodInfo),
// //       },
// //     }));

// //     setActiveCell(null);
// //     setError("");
// //     setSuccess("");
// //   };
// //   const clearEntireTimetable = () => {
// //     const confirmed = window.confirm(
// //       "Are you sure you want to clear the complete timetable?",
// //     );

// //     if (!confirmed) {
// //       return;
// //     }
// //     setGrid(createInitialGrid());
// //     setActiveCell(null);
// //     setSuccess("");
// //     setError("");
// //   };

// //   const entries = useMemo(() => {
// //     const result = [];
// //     DAYS.forEach((day) => {
// //       PERIODS.forEach((periodInfo) => {
// //         const entry = grid?.[day]?.[periodInfo.period];
// //         if (!entry) {
// //           return;
// //         }

// //         if (
// //           entry.slotType === "free" &&
// //           !entry.subjectCode &&
// //           !entry.className &&
// //           !entry.remarks
// //         ) {
// //           return;
// //         }
// //         result.push({
// //           ...entry,
// //         });
// //       });
// //     });
// //     return result;
// //   }, [grid]);

// //   const subjectEntries = useMemo(() => {
// //     return entries.filter(
// //       (entry) => entry.slotType === "subject" || entry.slotType === "lab",
// //     );
// //   }, [entries]);

// //   const specialEntries = useMemo(() => {
// //     return entries.filter(
// //       (entry) => entry.slotType !== "subject" && entry.slotType !== "lab",
// //     );
// //   }, [entries]);

// //   const subjectFrequency = useMemo(() => {
// //     const map = {};
// //     subjectEntries.forEach((entry) => {
// //       const code = entry.subjectCode;
// //       if (!code) {
// //         return;
// //       }

// //       if (!map[code]) {
// //         map[code] = {
// //           subjectCode: code,
// //           subjectName: entry.subjectName,
// //           classes: new Set(),
// //           periods: 0,
// //         };
// //       }

// //       map[code].periods += 1;

// //       if (entry.className) {
// //         map[code].classes.add(entry.className);
// //       }
// //     });
// //     return Object.values(map);
// //   }, [subjectEntries]);

// //   const validateBeforeSave = () => {
// //     if (!selectedFacultyId) {
// //       return "Please select a faculty.";
// //     }
// //     if (!academicYear.trim()) {
// //       return "Academic year is required.";
// //     }

// //     for (const entry of entries) {
// //       if (entry.slotType === "subject" || entry.slotType === "lab") {
// //         if (!entry.subjectCode) {
// //           return `${entry.day}, Period ${entry.period}: Subject is required.`;
// //         }

// //         if (!entry.className) {
// //           return `${entry.day}, Period ${entry.period}: Class is required.`;
// //         }

// //         const validSubject = subjects.some(
// //           (subject) =>
// //             subject.subjectCode.toUpperCase() ===
// //             entry.subjectCode.toUpperCase(),
// //         );
// //         if (!validSubject) {
// //           return `${entry.subjectCode} is not assigned to this faculty.`;
// //         }
// //         const validClass = classes.some(
// //           (item) => item.value.toLowerCase() === entry.className.toLowerCase(),
// //         );
// //         if (!validClass) {
// //           return `${entry.className} is not assigned to this faculty.`;
// //         }

// //         if (!entry.program?.trim()) {
// //           return `${entry.day}, Period ${entry.period}: Program is required.`;
// //         }
// //         if (!entry.branch?.trim()) {
// //           return `${entry.day}, Period ${entry.period}: Branch is required.`;
// //         }
// //         if (!entry.semester?.trim()) {
// //           return `${entry.day}, Period ${entry.period}: Semester is required.`;
// //         }
// //       }
// //     }
// //     return "";
// //   };

// //   const handleSave = async () => {
// //     try {
// //       setSaving(true);
// //       setError("");
// //       setSuccess("");
// //       const validationError = validateBeforeSave();

// //       if (validationError) {
// //         setError(validationError);
// //         setSaving(false);
// //         window.scrollTo({
// //           top: 0,
// //           behavior: "smooth",
// //         });
// //         return;
// //       }

// //       const facultyId = getFacultyId(selectedFaculty);
// //       const facultyName = getFacultyName(selectedFaculty);

// //       if (!facultyId) {
// //         setError("Invalid faculty selected.");
// //         setSaving(false);
// //         return;
// //       }

// //       const payload = {
// //         facultyId,
// //         academicYear: academicYear.trim(),
// //         issueDate: issueDate || null,
// //         effectiveFrom: effectiveFrom || null,
// //         revisionNumber: revisionNumber.trim() || "1.0",
// //         institutionName: institutionName.trim(),
// //         timetableTitle: timetableTitle.trim(),
// //         periods: PERIODS.map((periodInfo) => ({
// //           period: periodInfo.period,
// //           startTime: periodInfo.startTime,
// //           endTime: periodInfo.endTime,
// //         })),

// //         entries: entries.map((entry) => ({
// //           ...entry,
// //           facultyId,
// //           facultyName,
// //           academicYear: academicYear.trim(),
// //         })),
// //         status: "active",
// //       };

// //       console.log("CREATE TIMETABLE PAYLOAD:", payload);
// //       const response = await api.post("/timetable/create-timetable", payload);

// //       if (response?.data?.success === false) {
// //         throw new Error(
// //           response?.data?.message || "Failed to create timetable.",
// //         );
// //       }

// //       setSuccess(
// //         response?.data?.message || "Faculty timetable created successfully.",
// //       );

// //       window.scrollTo({
// //         top: 0,
// //         behavior: "smooth",
// //       });
// //     } catch (err) {
// //       console.error("CREATE TIMETABLE ERROR:", err);

// //       const message =
// //         err?.response?.data?.message ||
// //         err?.message ||
// //         "Failed to create timetable.";

// //       setError(message);

// //       window.scrollTo({
// //         top: 0,
// //         behavior: "smooth",
// //       });
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const selectedFacultyName = getFacultyName(selectedFaculty);
// //   const activeEntry = activeCell && grid?.[activeCell.day]?.[activeCell.period];

// //   return (
// //     <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
// //       <div className="mx-auto max-w-[1800px]">
// //         <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
// //           <div>
// //             <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
// //               <Link to="/" className="transition hover:text-blue-600">
// //                 Dashboard
// //               </Link>

// //               <span>/</span>

// //               <span>Time Table</span>

// //               <span>/</span>

// //               <span className="text-slate-800">Create</span>
// //             </div>

// //             <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 md:text-3xl">
// //               <FaCalendarAlt className="text-blue-600" />
// //               Create Faculty Time Table
// //             </h1>

// //             <p className="mt-1 text-sm text-slate-500">
// //               Create the complete Monday to Saturday timetable for a faculty
// //               member.
// //             </p>
// //           </div>

// //           <div className="flex flex-wrap gap-3">
// //             <Link
// //               to="/all-timetables"
// //               className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
// //             >
// //               <FaArrowLeft />
// //               Back
// //             </Link>

// //             <button
// //               type="button"
// //               onClick={fetchFaculties}
// //               disabled={loadingFaculties}
// //               className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
// //             >
// //               <FaSyncAlt className={loadingFaculties ? "animate-spin" : ""} />
// //               Refresh Faculty
// //             </button>

// //             <button
// //               type="button"
// //               onClick={handleSave}
// //               disabled={saving || !selectedFacultyId}
// //               className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
// //             >
// //               <FaSave />

// //               {saving ? "Saving..." : "Save Time Table"}
// //             </button>
// //           </div>
// //         </div>

// //         {error && (
// //           <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
// //             <FaExclamationCircle className="mt-0.5 shrink-0" />

// //             <div>
// //               <p className="font-semibold">Unable to continue</p>

// //               <p className="mt-1 text-sm">{error}</p>
// //             </div>
// //           </div>
// //         )}

// //         {success && (
// //           <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
// //             <FaCheckCircle className="mt-0.5 shrink-0" />

// //             <div>
// //               <p className="font-semibold">Time table saved</p>

// //               <p className="mt-1 text-sm">{success}</p>
// //             </div>
// //           </div>
// //         )}

// //         <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
// //           {/* FACULTY */}

// //           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //             <div className="mb-4 flex items-center gap-3">
// //               <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
// //                 <FaUserTie />
// //               </div>

// //               <div>
// //                 <h2 className="font-bold text-slate-900">Faculty</h2>

// //                 <p className="text-xs text-slate-500">
// //                   Select faculty to load assigned data
// //                 </p>
// //               </div>
// //             </div>

// //             <label className="mb-2 block text-sm font-semibold text-slate-700">
// //               Faculty
// //             </label>

// //             <div className="relative">
// //               <select
// //                 value={selectedFacultyId}
// //                 onChange={handleFacultyChange}
// //                 disabled={loadingFaculties}
// //                 className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
// //               >
// //                 <option value="">
// //                   {loadingFaculties ? "Loading faculty..." : "Select Faculty"}
// //                 </option>

// //                 {faculties.map((faculty) => {
// //                   const id = getFacultyId(faculty);

// //                   const name = getFacultyName(faculty);

// //                   return (
// //                     <option key={id} value={id}>
// //                       {name || "Unnamed Faculty"}

// //                       {faculty.employeeId ? ` - ${faculty.employeeId}` : ""}
// //                     </option>
// //                   );
// //                 })}
// //               </select>

// //               <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
// //             </div>

// //             {selectedFaculty && (
// //               <div className="mt-4 rounded-xl bg-slate-50 p-4">
// //                 <p className="font-bold text-slate-900">
// //                   {selectedFacultyName}
// //                 </p>

// //                 {selectedFaculty.employeeId && (
// //                   <p className="mt-1 text-xs text-slate-500">
// //                     Employee ID:{" "}
// //                     <span className="font-semibold">
// //                       {selectedFaculty.employeeId}
// //                     </span>
// //                   </p>
// //                 )}

// //                 {selectedFaculty.designation && (
// //                   <p className="mt-1 text-xs text-slate-500">
// //                     {selectedFaculty.designation}
// //                   </p>
// //                 )}

// //                 {selectedFaculty.department && (
// //                   <p className="mt-1 text-xs text-slate-500">
// //                     {selectedFaculty.department}
// //                   </p>
// //                 )}
// //               </div>
// //             )}
// //           </div>

// //           {/* SUBJECTS */}

// //           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //             <div className="mb-4 flex items-center gap-3">
// //               <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
// //                 <FaBookOpen />
// //               </div>

// //               <div>
// //                 <h2 className="font-bold text-slate-900">Assigned Subjects</h2>

// //                 <p className="text-xs text-slate-500">
// //                   Loaded directly from Faculty
// //                 </p>
// //               </div>
// //             </div>

// //             {subjects.length === 0 ? (
// //               <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
// //                 No assigned subjects found.
// //               </div>
// //             ) : (
// //               <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
// //                 {subjects.map((subject) => (
// //                   <div
// //                     key={subject.subjectCode}
// //                     className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
// //                   >
// //                     <span className="font-bold text-blue-700">
// //                       {subject.subjectCode}
// //                     </span>

// //                     <span className="ml-3 text-right text-xs text-slate-600">
// //                       {subject.subjectName}
// //                     </span>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </div>

// //           {/* CLASSES */}

// //           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //             <div className="mb-4 flex items-center gap-3">
// //               <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
// //                 <FaUsers />
// //               </div>

// //               <div>
// //                 <h2 className="font-bold text-slate-900">Assigned Classes</h2>

// //                 <p className="text-xs text-slate-500">
// //                   Loaded directly from Faculty
// //                 </p>
// //               </div>
// //             </div>

// //             {classes.length === 0 ? (
// //               <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
// //                 No assigned classes found.
// //               </div>
// //             ) : (
// //               <div className="flex flex-wrap gap-2">
// //                 {classes.map((item) => (
// //                   <span
// //                     key={item.value}
// //                     className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700"
// //                   >
// //                     {item.label}
// //                   </span>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* =================================================
// //             TIME TABLE INFORMATION

// //             ONLY GLOBAL DOCUMENT INFORMATION
// //         ================================================= */}

// //         <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //           <div className="mb-5 flex items-center gap-3">
// //             <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
// //               <FaClipboardList />
// //             </div>

// //             <div>
// //               <h2 className="text-lg font-bold text-slate-900">
// //                 Time Table Information
// //               </h2>

// //               <p className="text-sm text-slate-500">
// //                 General information for the complete timetable document.
// //               </p>
// //             </div>
// //           </div>

// //           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
// //             {/* INSTITUTION */}

// //             <div>
// //               <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                 Institution Name
// //               </label>

// //               <input
// //                 type="text"
// //                 value={institutionName}
// //                 onChange={(e) => setInstitutionName(e.target.value)}
// //                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //               />
// //             </div>

// //             {/* TITLE */}

// //             <div>
// //               <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                 Time Table Title
// //               </label>

// //               <input
// //                 type="text"
// //                 value={timetableTitle}
// //                 onChange={(e) => setTimetableTitle(e.target.value)}
// //                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //               />
// //             </div>

// //             {/* ISSUE DATE */}

// //             <div>
// //               <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                 Issue Date
// //               </label>

// //               <input
// //                 type="date"
// //                 value={issueDate}
// //                 onChange={(e) => setIssueDate(e.target.value)}
// //                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //               />
// //             </div>

// //             {/* EFFECTIVE FROM */}

// //             <div>
// //               <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                 With Effect From
// //               </label>

// //               <input
// //                 type="date"
// //                 value={effectiveFrom}
// //                 onChange={(e) => setEffectiveFrom(e.target.value)}
// //                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //               />
// //             </div>

// //             {/* REVISION */}

// //             <div>
// //               <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                 Revision Number
// //               </label>

// //               <input
// //                 type="text"
// //                 value={revisionNumber}
// //                 onChange={(e) => setRevisionNumber(e.target.value)}
// //                 placeholder="1.0"
// //                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //               />
// //             </div>

// //             {/* ACADEMIC YEAR */}

// //             <div>
// //               <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                 Academic Year
// //               </label>

// //               <input
// //                 type="text"
// //                 value={academicYear}
// //                 onChange={(e) => setAcademicYear(e.target.value)}
// //                 placeholder="2026-2027"
// //                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //               />
// //             </div>
// //           </div>

// //           {/* INFORMATION MESSAGE */}

// //           <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
// //             <p className="font-semibold">Important</p>

// //             <p className="mt-1">
// //               Program, Branch, Semester, Section, Class and Room are entered
// //               inside each timetable period because they can be different for
// //               different classes and subjects.
// //             </p>
// //           </div>
// //         </div>

// //         <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //           <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
// //             <div>
// //               <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
// //                 <FaClock className="text-blue-600" />
// //                 Weekly Time Table
// //               </h2>

// //               <p className="mt-1 text-sm text-slate-500">
// //                 Click any timetable cell to assign a subject, lab, break,
// //                 activity or other slot.
// //               </p>
// //             </div>

// //             <button
// //               type="button"
// //               onClick={clearEntireTimetable}
// //               className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
// //             >
// //               <FaTrash />
// //               Clear Time Table
// //             </button>
// //           </div>

// //           <div className="overflow-x-auto rounded-xl border border-slate-200">
// //             <table className="min-w-[1500px] w-full border-collapse">
// //               {/* TABLE HEADER */}

// //               <thead>
// //                 <tr>
// //                   <th className="sticky left-0 z-20 min-w-[155px] border border-slate-200 bg-slate-900 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-white">
// //                     Day / Time
// //                   </th>

// //                   {PERIODS.map((periodInfo) => (
// //                     <th
// //                       key={periodInfo.period}
// //                       className="min-w-[145px] border border-slate-200 bg-slate-800 px-2 py-3 text-center text-white"
// //                     >
// //                       <div className="text-sm font-bold">
// //                         Period {periodInfo.period}
// //                       </div>

// //                       <div className="mt-1 text-[11px] font-medium text-slate-300">
// //                         {periodInfo.startTime} - {periodInfo.endTime}
// //                       </div>
// //                     </th>
// //                   ))}
// //                 </tr>
// //               </thead>

// //               {/* TABLE BODY */}

// //               <tbody>
// //                 {DAYS.map((day) => (
// //                   <tr key={day}>
// //                     {/* DAY */}

// //                     <td className="sticky left-0 z-10 border border-slate-200 bg-white px-3 py-4 text-center">
// //                       <div className="font-bold text-slate-900">{day}</div>

// //                       <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
// //                         Day
// //                       </div>
// //                     </td>

// //                     {/* PERIODS */}

// //                     {PERIODS.map((periodInfo) => {
// //                       const entry = grid?.[day]?.[periodInfo.period];

// //                       const isActive =
// //                         activeCell?.day === day &&
// //                         activeCell?.period === periodInfo.period;

// //                       return (
// //                         <td
// //                           key={`${day}-${periodInfo.period}`}
// //                           className="border border-slate-200 bg-slate-50 p-1"
// //                         >
// //                           <button
// //                             type="button"
// //                             onClick={() =>
// //                               handleCellClick(day, periodInfo.period)
// //                             }
// //                             className={`group min-h-[110px] w-full rounded-lg border p-2 text-center transition hover:-translate-y-0.5 hover:shadow-md ${getEntryClass(
// //                               entry,
// //                             )} ${isActive ? "ring-2 ring-blue-500" : ""}`}
// //                           >
// //                             {/* SUBJECT / LAB */}

// //                             {entry?.slotType === "subject" ||
// //                             entry?.slotType === "lab" ? (
// //                               <>
// //                                 <div className="text-sm font-extrabold">
// //                                   {entry.subjectCode || "SELECT SUBJECT"}
// //                                 </div>

// //                                 <div className="mt-2 line-clamp-2 text-[11px] font-semibold">
// //                                   {entry.subjectName}
// //                                 </div>

// //                                 {entry.className && (
// //                                   <div className="mt-2 text-[10px] font-bold">
// //                                     {entry.className}
// //                                   </div>
// //                                 )}

// //                                 {entry.program &&
// //                                   entry.branch &&
// //                                   entry.semester && (
// //                                     <div className="mt-1 text-[9px] text-slate-500">
// //                                       {entry.program} {entry.branch}{" "}
// //                                       {entry.semester}
// //                                     </div>
// //                                   )}

// //                                 {entry.roomNo && (
// //                                   <div className="mt-1 text-[10px]">
// //                                     Room: {entry.roomNo}
// //                                   </div>
// //                                 )}

// //                                 {entry.slotType === "lab" && (
// //                                   <div className="mt-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-700">
// //                                     LAB
// //                                   </div>
// //                                 )}
// //                               </>
// //                             ) : (
// //                               /* SPECIAL SLOT */

// //                               <>
// //                                 <div className="text-xs font-extrabold">
// //                                   {getSlotLabel(entry)}
// //                                 </div>

// //                                 <div className="mt-3 text-[10px] text-slate-400">
// //                                   Click to edit
// //                                 </div>
// //                               </>
// //                             )}
// //                           </button>
// //                         </td>
// //                       );
// //                     })}
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>

// //         {activeCell && activeEntry && (
// //           <div className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
// //             <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
// //               <div>
// //                 <h2 className="text-xl font-bold text-slate-900">
// //                   Edit Time Table Cell
// //                 </h2>

// //                 <p className="mt-1 text-sm text-slate-500">
// //                   {activeCell.day} · Period {activeCell.period} ·{" "}
// //                   {activeEntry.startTime} - {activeEntry.endTime}
// //                 </p>
// //               </div>

// //               <button
// //                 type="button"
// //                 onClick={() => setActiveCell(null)}
// //                 className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
// //               >
// //                 Close
// //               </button>
// //             </div>

// //             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
// //               {/* SLOT TYPE */}

// //               <div>
// //                 <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                   Slot Type
// //                 </label>

// //                 <select
// //                   value={cellEditor.slotType}
// //                   onChange={(e) =>
// //                     handleCellEditorChange("slotType", e.target.value)
// //                   }
// //                   className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                 >
// //                   {SLOT_TYPES.map((slot) => (
// //                     <option key={slot.value} value={slot.value}>
// //                       {slot.label}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* SUBJECT / LAB FIELDS */}

// //               {(cellEditor.slotType === "subject" ||
// //                 cellEditor.slotType === "lab") && (
// //                 <>
// //                   {/* SUBJECT CODE */}

// //                   <div>
// //                     <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                       Subject Code
// //                     </label>

// //                     <select
// //                       value={cellEditor.subjectCode}
// //                       onChange={(e) =>
// //                         handleCellEditorChange("subjectCode", e.target.value)
// //                       }
// //                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                     >
// //                       <option value="">Select Subject Code</option>

// //                       {subjects.map((subject) => (
// //                         <option
// //                           key={subject.subjectCode}
// //                           value={subject.subjectCode}
// //                         >
// //                           {subject.subjectCode} - {subject.subjectName}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   {/* CLASS */}

// //                   <div>
// //                     <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                       Class
// //                     </label>

// //                     <select
// //                       value={cellEditor.className}
// //                       onChange={(e) =>
// //                         handleCellEditorChange("className", e.target.value)
// //                       }
// //                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                     >
// //                       <option value="">Select Class</option>

// //                       {classes.map((item) => (
// //                         <option key={item.value} value={item.value}>
// //                           {item.label}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   {/* PROGRAM */}

// //                   <div>
// //                     <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                       Program
// //                     </label>

// //                     <input
// //                       type="text"
// //                       value={cellEditor.program}
// //                       onChange={(e) =>
// //                         handleCellEditorChange("program", e.target.value)
// //                       }
// //                       placeholder="BTech / MTech"
// //                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                     />
// //                   </div>

// //                   {/* BRANCH */}

// //                   <div>
// //                     <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                       Branch
// //                     </label>

// //                     <input
// //                       type="text"
// //                       value={cellEditor.branch}
// //                       onChange={(e) =>
// //                         handleCellEditorChange("branch", e.target.value)
// //                       }
// //                       placeholder="CSE / IT"
// //                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                     />
// //                   </div>

// //                   {/* SEMESTER */}

// //                   <div>
// //                     <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                       Semester
// //                     </label>

// //                     <input
// //                       type="text"
// //                       value={cellEditor.semester}
// //                       onChange={(e) =>
// //                         handleCellEditorChange("semester", e.target.value)
// //                       }
// //                       placeholder="V / III"
// //                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                     />
// //                   </div>

// //                   {/* SECTION */}

// //                   <div>
// //                     <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                       Section
// //                     </label>

// //                     <input
// //                       type="text"
// //                       value={cellEditor.section}
// //                       onChange={(e) =>
// //                         handleCellEditorChange("section", e.target.value)
// //                       }
// //                       placeholder="A"
// //                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                     />
// //                   </div>

// //                   {/* ROOM */}

// //                   <div>
// //                     <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                       Room No
// //                     </label>

// //                     <input
// //                       type="text"
// //                       value={cellEditor.roomNo}
// //                       onChange={(e) =>
// //                         handleCellEditorChange("roomNo", e.target.value)
// //                       }
// //                       placeholder="Room 301 / Lab 2"
// //                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                     />
// //                   </div>
// //                 </>
// //               )}

// //               {/* REMARKS */}

// //               <div className="md:col-span-2 lg:col-span-4">
// //                 <label className="mb-2 block text-sm font-semibold text-slate-700">
// //                   Remarks
// //                 </label>

// //                 <input
// //                   type="text"
// //                   value={cellEditor.remarks}
// //                   onChange={(e) =>
// //                     handleCellEditorChange("remarks", e.target.value)
// //                   }
// //                   placeholder="Optional remarks"
// //                   className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
// //                 />
// //               </div>
// //             </div>

// //             {/* EDITOR ACTIONS */}

// //             <div className="mt-5 flex flex-wrap justify-end gap-3">
// //               <button
// //                 type="button"
// //                 onClick={clearCell}
// //                 className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
// //               >
// //                 <FaTrash />
// //                 Clear Cell
// //               </button>

// //               <button
// //                 type="button"
// //                 onClick={applyCellEditor}
// //                 className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
// //               >
// //                 <FaCheckCircle />
// //                 Apply Cell
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
// //           {/* SCHEDULED */}

// //           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //             <div className="flex items-center gap-3">
// //               <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
// //                 <FaCalendarAlt />
// //               </div>

// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
// //                   Scheduled Entries
// //                 </p>

// //                 <p className="mt-1 text-2xl font-bold text-slate-900">
// //                   {entries.length}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* SUBJECTS */}

// //           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //             <div className="flex items-center gap-3">
// //               <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
// //                 <FaBookOpen />
// //               </div>

// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
// //                   Subject / Lab Periods
// //                 </p>

// //                 <p className="mt-1 text-2xl font-bold text-slate-900">
// //                   {subjectEntries.length}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* SPECIAL */}

// //           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //             <div className="flex items-center gap-3">
// //               <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
// //                 <FaClipboardList />
// //               </div>

// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
// //                   Special Slots
// //                 </p>

// //                 <p className="mt-1 text-2xl font-bold text-slate-900">
// //                   {specialEntries.length}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //           <div className="mb-5">
// //             <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
// //               <FaBookOpen className="text-blue-600" />
// //               Course Summary
// //             </h2>

// //             <p className="mt-1 text-sm text-slate-500">
// //               Courses are taken directly from the selected faculty's assigned
// //               subjects.
// //             </p>
// //           </div>

// //           {subjects.length === 0 ? (
// //             <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
// //               Select a faculty to display the course list.
// //             </div>
// //           ) : (
// //             <div className="overflow-x-auto rounded-xl border border-slate-200">
// //               <table className="w-full min-w-[900px] border-collapse">
// //                 <thead>
// //                   <tr className="bg-slate-900 text-left text-xs font-bold uppercase tracking-wide text-white">
// //                     <th className="border border-slate-700 px-4 py-3">
// //                       Course Code
// //                     </th>

// //                     <th className="border border-slate-700 px-4 py-3">
// //                       Course Name
// //                     </th>

// //                     <th className="border border-slate-700 px-4 py-3">L-T-P</th>

// //                     <th className="border border-slate-700 px-4 py-3">
// //                       Total Credits
// //                     </th>

// //                     <th className="border border-slate-700 px-4 py-3">
// //                       Faculty Name
// //                     </th>

// //                     <th className="border border-slate-700 px-4 py-3">
// //                       Scheduled Periods
// //                     </th>

// //                     <th className="border border-slate-700 px-4 py-3">
// //                       Classes
// //                     </th>
// //                   </tr>
// //                 </thead>

// //                 <tbody>
// //                   {subjects.map((subject) => {
// //                     const summary = subjectFrequency.find(
// //                       (item) => item.subjectCode === subject.subjectCode,
// //                     );

// //                     const scheduledClasses = summary
// //                       ? Array.from(summary.classes)
// //                       : [];

// //                     return (
// //                       <tr
// //                         key={subject.subjectCode}
// //                         className="hover:bg-slate-50"
// //                       >
// //                         <td className="border border-slate-200 px-4 py-3 font-bold text-blue-700">
// //                           {subject.subjectCode}
// //                         </td>

// //                         <td className="border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800">
// //                           {subject.subjectName}
// //                         </td>

// //                         <td className="border border-slate-200 px-4 py-3 text-sm text-slate-500">
// //                           {subject.ltp || "—"}
// //                         </td>

// //                         <td className="border border-slate-200 px-4 py-3 text-sm text-slate-500">
// //                           {subject.credits || "—"}
// //                         </td>

// //                         <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
// //                           {selectedFacultyName || "—"}
// //                         </td>

// //                         <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
// //                           {summary?.periods || 0}
// //                         </td>

// //                         <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
// //                           {scheduledClasses.length > 0
// //                             ? scheduledClasses.join(", ")
// //                             : "—"}
// //                         </td>
// //                       </tr>
// //                     );
// //                   })}
// //                 </tbody>
// //               </table>
// //             </div>
// //           )}
// //         </div>

// //         {/* =================================================
// //             CURRENT SELECTION SUMMARY
// //         ================================================= */}

// //         <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
// //           <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
// //             {/* FACULTY */}

// //             <div className="flex items-start gap-3">
// //               <FaUserTie className="mt-1 text-blue-600" />

// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
// //                   Faculty
// //                 </p>

// //                 <p className="mt-1 font-semibold text-slate-900">
// //                   {selectedFacultyName || "Not Selected"}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* ASSIGNED CLASSES */}

// //             <div className="flex items-start gap-3">
// //               <FaUsers className="mt-1 text-violet-600" />

// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
// //                   Assigned Classes
// //                 </p>

// //                 <p className="mt-1 font-semibold text-slate-900">
// //                   {classes.length}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* ASSIGNED SUBJECTS */}

// //             <div className="flex items-start gap-3">
// //               <FaGraduationCap className="mt-1 text-emerald-600" />

// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
// //                   Assigned Subjects
// //                 </p>

// //                 <p className="mt-1 font-semibold text-slate-900">
// //                   {subjects.length}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* SCHEDULED */}

// //             <div className="flex items-start gap-3">
// //               <FaDoorOpen className="mt-1 text-amber-600" />

// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
// //                   Scheduled Periods
// //                 </p>

// //                 <p className="mt-1 font-semibold text-slate-900">
// //                   {subjectEntries.length}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
// //           <div>
// //             <p className="text-sm font-semibold text-slate-700">
// //               Timetable Schedule
// //             </p>

// //             <p className="mt-1 text-sm text-slate-500">
// //               Monday to Saturday · 10 periods per day
// //             </p>
// //           </div>

// //           <button
// //             type="button"
// //             onClick={handleSave}
// //             disabled={saving || !selectedFacultyId}
// //             className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
// //           >
// //             <FaSave />

// //             {saving ? "Creating Time Table..." : "Create Time Table"}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CreateTimeTable;

// // with update time table.

// //

// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import {
//   FaArrowLeft,
//   FaCalendarAlt,
//   FaCheckCircle,
//   FaChevronDown,
//   FaClock,
//   FaExclamationCircle,
//   FaSave,
//   FaSyncAlt,
//   FaTrash,
//   FaUserTie,
//   FaUsers,
//   FaBookOpen,
//   FaBuilding,
//   FaGraduationCap,
//   FaDoorOpen,
//   FaClipboardList,
//   FaEdit,
//   FaPlus,
//   FaTimes,
// } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import globalBackendRoute from "../../config/Config";

// const API_BASE_URL = `${globalBackendRoute}/api`;
// const DAYS = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ];
// const PERIODS = [
//   { period: 1, startTime: "9:10AM", endTime: "10:00AM" },
//   { period: 2, startTime: "10:00AM", endTime: "10:50AM" },
//   { period: 3, startTime: "10:50AM", endTime: "11:40AM" },
//   { period: 4, startTime: "11:40AM", endTime: "12:30PM" },
//   { period: 5, startTime: "12:30PM", endTime: "1:20PM" },
//   { period: 6, startTime: "1:20PM", endTime: "2:10PM" },
//   { period: 7, startTime: "2:10PM", endTime: "3:00PM" },
//   { period: 8, startTime: "3:00PM", endTime: "3:10PM" },
//   { period: 9, startTime: "3:10PM", endTime: "4:00PM" },
//   { period: 10, startTime: "4:00PM", endTime: "4:50PM" },
// ];
// const SLOT_TYPES = [
//   { value: "subject", label: "Subject" },
//   { value: "lab", label: "Lab" },
//   { value: "break", label: "Break" },
//   { value: "short-break", label: "Short Break" },
//   { value: "lunch", label: "Lunch" },
//   { value: "sports", label: "Sports" },
//   { value: "library", label: "Library" },
//   { value: "activity", label: "Activity" },
//   { value: "doubt-session", label: "Doubt Session" },
//   { value: "cultural", label: "Cultural Activity" },
//   { value: "outdoor-activity", label: "Outdoor Activity" },
//   { value: "indoor-activity", label: "Indoor Activity" },
//   { value: "free", label: "Free Period" },
//   { value: "other", label: "Other" },
// ];
// const SPECIAL_LABELS = {
//   break: "BREAK",
//   "short-break": "SHORT BREAK",
//   lunch: "LUNCH BREAK",
//   sports: "SPORTS",
//   library: "LIB",
//   activity: "ACTIVITY",
//   "doubt-session": "DOUBT SESSION",
//   cultural: "CULTURAL CLUB ACTIVITY",
//   "outdoor-activity": "OUTDOOR ACTIVITY",
//   "indoor-activity": "INDOOR ACTIVITY",
//   free: "FREE PERIOD",
//   other: "OTHER",
// };
// const getToken = () =>
//   localStorage.getItem("travel_token") ||
//   localStorage.getItem("token") ||
//   localStorage.getItem("accessToken") ||
//   "";
// const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
// api.interceptors.request.use((config) => {
//   const token = getToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
// const getResponseData = (response) =>
//   response?.data?.data ??
//   response?.data?.faculties ??
//   response?.data?.faculty ??
//   response?.data?.results ??
//   response?.data;
// const normalizeFacultyArray = (response) => {
//   const data = getResponseData(response);
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data?.faculties)) return data.faculties;
//   if (Array.isArray(data?.data)) return data.data;
//   if (Array.isArray(data?.results)) return data.results;
//   if (Array.isArray(response?.data?.faculties)) return response.data.faculties;
//   return [];
// };
// const getFacultyId = (faculty) => {
//   if (!faculty) return "";
//   if (typeof faculty === "string") return faculty;
//   return (
//     faculty?._id ||
//     faculty?.id ||
//     faculty?.facultyId ||
//     faculty?.faculty_id ||
//     ""
//   );
// };
// const getFacultyName = (faculty) => {
//   if (!faculty) return "";
//   if (typeof faculty === "string") return faculty;
//   if (faculty.facultyName) return String(faculty.facultyName).trim();
//   if (faculty.fullName) return String(faculty.fullName).trim();
//   if (faculty.name) return String(faculty.name).trim();
//   if (faculty.employeeName) return String(faculty.employeeName).trim();
//   if (faculty.userId && typeof faculty.userId === "object") {
//     return String(
//       faculty.userId.fullName ||
//         faculty.userId.name ||
//         faculty.userId.username ||
//         faculty.userId.email ||
//         "",
//     ).trim();
//   }
//   if (faculty.user && typeof faculty.user === "object") {
//     return String(
//       faculty.user.fullName ||
//         faculty.user.name ||
//         faculty.user.username ||
//         faculty.user.email ||
//         "",
//     ).trim();
//   }
//   return "";
// };
// const normalizeClasses = (faculty) => {
//   if (!faculty) return [];
//   const source = Array.isArray(faculty.classes)
//     ? faculty.classes
//     : Array.isArray(faculty.assignedClasses)
//       ? faculty.assignedClasses
//       : [];
//   return source
//     .map((item) => {
//       if (typeof item === "string") {
//         return { value: item.trim(), label: item.trim() };
//       }
//       const value =
//         item?.className ||
//         item?.name ||
//         item?.class ||
//         item?.class_name ||
//         item?.value ||
//         "";
//       return { value: String(value).trim(), label: String(value).trim() };
//     })
//     .filter((item) => item.value);
// };
// const normalizeSubjects = (faculty) => {
//   if (!faculty) return [];
//   const source = Array.isArray(faculty.subjects)
//     ? faculty.subjects
//     : Array.isArray(faculty.assignedSubjects)
//       ? faculty.assignedSubjects
//       : [];
//   return source
//     .map((item) => {
//       if (typeof item === "string") {
//         return {
//           subjectCode: item.trim().toUpperCase(),
//           subjectName: item.trim(),
//           ltp: "",
//           credits: "",
//         };
//       }
//       return {
//         subjectCode: String(
//           item?.subjectCode ||
//             item?.code ||
//             item?.courseCode ||
//             item?.course_code ||
//             "",
//         )
//           .trim()
//           .toUpperCase(),
//         subjectName: String(
//           item?.subjectName ||
//             item?.name ||
//             item?.courseName ||
//             item?.course_name ||
//             "",
//         ).trim(),
//         ltp: String(
//           item?.ltp ||
//             item?.LTP ||
//             item?.l_t_p ||
//             item?.lectureTutorialPractical ||
//             "",
//         ).trim(),
//         credits:
//           item?.credits !== undefined && item?.credits !== null
//             ? String(item.credits).trim()
//             : "",
//       };
//     })
//     .filter((item) => item.subjectCode);
// };
// const createEmptyEntry = (day, periodInfo) => ({
//   day,
//   period: periodInfo.period,
//   startTime: periodInfo.startTime,
//   endTime: periodInfo.endTime,
//   slotType: "free",
//   subjectCode: "",
//   subjectName: "",
//   className: "",
//   program: "",
//   branch: "",
//   semester: "",
//   section: "",
//   roomNo: "",
//   sessionType: "other",
//   remarks: "",
// });
// const createInitialGrid = () => {
//   const grid = {};
//   DAYS.forEach((day) => {
//     grid[day] = {};
//     PERIODS.forEach((periodInfo) => {
//       grid[day][periodInfo.period] = createEmptyEntry(day, periodInfo);
//     });
//   });
//   return grid;
// };
// const getSlotLabel = (entry) => {
//   if (!entry) return "";
//   if (entry.slotType !== "subject" && entry.slotType !== "lab")
//     return SPECIAL_LABELS[entry.slotType] || entry.subjectName || "OTHER";
//   return entry.subjectCode || entry.subjectName || "";
// };
// const getEntryClass = (entry) => {
//   if (!entry) return "";
//   if (entry.slotType !== "subject" && entry.slotType !== "lab")
//     return "bg-slate-100 border-slate-300 text-slate-700";
//   if (entry.slotType === "lab")
//     return "bg-indigo-50 border-indigo-300 text-indigo-800";
//   return "bg-blue-50 border-blue-300 text-blue-800";
// };
// const extractTimetableObject = (response) => {
//   const root = response?.data;
//   const data = root?.data ?? root?.timetable ?? root?.result ?? root;
//   if (Array.isArray(data)) {
//     return (
//       data.find((item) => item && (item._id || item.id || item.entries)) || null
//     );
//   }
//   if (data?.timetable && typeof data.timetable === "object")
//     return data.timetable;
//   if (data?.result && typeof data.result === "object") return data.result;
//   return data && typeof data === "object" ? data : null;
// };
// const normalizeTimetableEntries = (timetable) => {
//   if (!timetable) return [];
//   const source = Array.isArray(timetable.entries)
//     ? timetable.entries
//     : Array.isArray(timetable.schedule)
//       ? timetable.schedule
//       : Array.isArray(timetable.slots)
//         ? timetable.slots
//         : Array.isArray(timetable.data?.entries)
//           ? timetable.data.entries
//           : [];
//   return source
//     .map((item) => ({
//       ...item,
//       day: String(item?.day || "").trim(),
//       period: Number(item?.period || item?.periodNumber || 0),
//       startTime:
//         item?.startTime ||
//         PERIODS.find((p) => p.period === Number(item?.period || 0))
//           ?.startTime ||
//         "",
//       endTime:
//         item?.endTime ||
//         PERIODS.find((p) => p.period === Number(item?.period || 0))?.endTime ||
//         "",
//       slotType:
//         item?.slotType ||
//         (item?.sessionType === "lab"
//           ? "lab"
//           : item?.sessionType === "theory"
//             ? "subject"
//             : "free"),
//       subjectCode: item?.subjectCode || "",
//       subjectName: item?.subjectName || "",
//       className: item?.className || "",
//       program: item?.program || "",
//       branch: item?.branch || "",
//       semester: item?.semester || "",
//       section: item?.section || "",
//       roomNo: item?.roomNo || "",
//       sessionType: item?.sessionType || "other",
//       remarks: item?.remarks || "",
//     }))
//     .filter(
//       (item) =>
//         DAYS.includes(item.day) && item.period >= 1 && item.period <= 10,
//     );
// };
// const buildGridFromTimetable = (timetable) => {
//   const grid = createInitialGrid();
//   const entries = normalizeTimetableEntries(timetable);
//   entries.forEach((entry) => {
//     grid[entry.day][entry.period] = entry;
//   });
//   return grid;
// };
// const CreateTimeTable = () => {
//   const navigate = useNavigate();
//   const [faculties, setFaculties] = useState([]);
//   const [selectedFacultyId, setSelectedFacultyId] = useState("");
//   const [selectedFaculty, setSelectedFaculty] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [grid, setGrid] = useState(createInitialGrid());
//   const [academicYear, setAcademicYear] = useState("2026-2027");
//   const [issueDate, setIssueDate] = useState("");
//   const [effectiveFrom, setEffectiveFrom] = useState("");
//   const [revisionNumber, setRevisionNumber] = useState("1.0");
//   const [institutionName, setInstitutionName] = useState(
//     "COLLEGE OF ENGINEERING & COMPUTER APPLICATION(CECA)",
//   );
//   const [timetableTitle, setTimetableTitle] = useState("Time Table");
//   const [loadingFaculties, setLoadingFaculties] = useState(false);
//   const [loadingTimetable, setLoadingTimetable] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [activeCell, setActiveCell] = useState(null);
//   const [existingTimetableId, setExistingTimetableId] = useState("");
//   const [existingTimetable, setExistingTimetable] = useState(null);
//   const [isUpdateMode, setIsUpdateMode] = useState(false);
//   const [cellEditor, setCellEditor] = useState({
//     slotType: "free",
//     subjectCode: "",
//     className: "",
//     program: "",
//     branch: "",
//     semester: "",
//     section: "",
//     roomNo: "",
//     remarks: "",
//   });
//   useEffect(() => {
//     fetchFaculties();
//   }, []);
//   useEffect(() => {
//     if (!selectedFacultyId) {
//       setSelectedFaculty(null);
//       setClasses([]);
//       setSubjects([]);
//       setGrid(createInitialGrid());
//       setExistingTimetable(null);
//       setExistingTimetableId("");
//       setIsUpdateMode(false);
//       setActiveCell(null);
//       return;
//     }
//     const faculty = faculties.find(
//       (item) => String(getFacultyId(item)) === String(selectedFacultyId),
//     );
//     if (!faculty) return;
//     setSelectedFaculty(faculty);
//     setClasses(normalizeClasses(faculty));
//     setSubjects(normalizeSubjects(faculty));
//     loadFacultyTimetable(selectedFacultyId);
//   }, [selectedFacultyId, faculties]);
//   const fetchFaculties = async () => {
//     try {
//       setLoadingFaculties(true);
//       setError("");
//       const response = await api.get("/faculty/get-all-faculties");
//       const facultyList = normalizeFacultyArray(response);
//       setFaculties(facultyList);
//       if (facultyList.length === 0) setError("No faculty records were found.");
//     } catch (err) {
//       console.error("FETCH FACULTIES ERROR:", err);
//       setError(
//         err?.response?.data?.message || "Failed to load faculty records.",
//       );
//     } finally {
//       setLoadingFaculties(false);
//     }
//   };
//   const loadFacultyTimetable = async (facultyId) => {
//     try {
//       setLoadingTimetable(true);
//       setError("");
//       setSuccess("");
//       setExistingTimetable(null);
//       setExistingTimetableId("");
//       setIsUpdateMode(false);
//       setActiveCell(null);
//       setGrid(createInitialGrid());
//       const response = await api.get(
//         `/timetable/get-faculty-timetable/${facultyId}`,
//       );
//       const timetable = extractTimetableObject(response);
//       if (
//         !timetable ||
//         (!timetable._id &&
//           !timetable.id &&
//           !Array.isArray(timetable.entries) &&
//           !Array.isArray(timetable.schedule))
//       ) {
//         setExistingTimetable(null);
//         setExistingTimetableId("");
//         setGrid(createInitialGrid());
//         return;
//       }
//       const timetableId =
//         timetable._id || timetable.id || timetable.timetableId || "";
//       const timetableEntries = normalizeTimetableEntries(timetable);
//       if (!timetableId && timetableEntries.length === 0) {
//         setExistingTimetable(null);
//         setExistingTimetableId("");
//         setGrid(createInitialGrid());
//         return;
//       }
//       setExistingTimetable(timetable);
//       setExistingTimetableId(String(timetableId));
//       setGrid(buildGridFromTimetable(timetable));
//       if (timetable.academicYear)
//         setAcademicYear(String(timetable.academicYear));
//       if (timetable.issueDate)
//         setIssueDate(String(timetable.issueDate).substring(0, 10));
//       if (timetable.effectiveFrom)
//         setEffectiveFrom(String(timetable.effectiveFrom).substring(0, 10));
//       if (timetable.revisionNumber !== undefined)
//         setRevisionNumber(String(timetable.revisionNumber));
//       if (timetable.institutionName)
//         setInstitutionName(String(timetable.institutionName));
//       if (timetable.timetableTitle)
//         setTimetableTitle(String(timetable.timetableTitle));
//       setSuccess("Existing faculty timetable loaded successfully.");
//     } catch (err) {
//       if (err?.response?.status === 404) {
//         setExistingTimetable(null);
//         setExistingTimetableId("");
//         setGrid(createInitialGrid());
//         setIsUpdateMode(false);
//         setError("");
//       } else {
//         console.error("LOAD FACULTY TIMETABLE ERROR:", err);
//         setError(
//           err?.response?.data?.message || "Failed to load faculty timetable.",
//         );
//       }
//     } finally {
//       setLoadingTimetable(false);
//     }
//   };
//   const handleFacultyChange = (event) => {
//     const facultyId = event.target.value;
//     setSelectedFacultyId(facultyId);
//     setGrid(createInitialGrid());
//     setActiveCell(null);
//     setExistingTimetable(null);
//     setExistingTimetableId("");
//     setIsUpdateMode(false);
//     setSuccess("");
//     setError("");
//     if (!facultyId) {
//       setSelectedFaculty(null);
//       setClasses([]);
//       setSubjects([]);
//       return;
//     }
//     const faculty = faculties.find(
//       (item) => String(getFacultyId(item)) === String(facultyId),
//     );
//     if (faculty) {
//       setSelectedFaculty(faculty);
//       setClasses(normalizeClasses(faculty));
//       setSubjects(normalizeSubjects(faculty));
//     }
//   };
//   const handleStartUpdate = () => {
//     if (!existingTimetableId) {
//       setError("No existing timetable was found for this faculty.");
//       return;
//     }
//     setIsUpdateMode(true);
//     setSuccess("");
//     setError("");
//   };
//   const handleCancelUpdate = () => {
//     if (existingTimetable) {
//       setGrid(buildGridFromTimetable(existingTimetable));
//     }
//     setIsUpdateMode(false);
//     setActiveCell(null);
//     setError("");
//     setSuccess("Changes were discarded.");
//   };
//   const handleCellClick = (day, period) => {
//     if (existingTimetableId && !isUpdateMode) return;
//     const entry = grid?.[day]?.[period];
//     if (!entry) return;
//     setActiveCell({ day, period });
//     setCellEditor({
//       slotType: entry.slotType || "free",
//       subjectCode: entry.subjectCode || "",
//       className: entry.className || "",
//       program: entry.program || "",
//       branch: entry.branch || "",
//       semester: entry.semester || "",
//       section: entry.section || "",
//       roomNo: entry.roomNo || "",
//       remarks: entry.remarks || "",
//     });
//     setError("");
//   };
//   const handleCellEditorChange = (field, value) => {
//     setCellEditor((previous) => ({ ...previous, [field]: value }));
//   };
//   const applyCellEditor = () => {
//     if (!activeCell) return;
//     const { day, period } = activeCell;
//     const periodInfo = PERIODS.find((item) => item.period === period);
//     if (!periodInfo) return;
//     let subjectCode = cellEditor.subjectCode;
//     let subjectName = "";
//     const selectedSubject = subjects.find(
//       (item) =>
//         item.subjectCode.toUpperCase() === String(subjectCode).toUpperCase(),
//     );
//     if (cellEditor.slotType === "subject" || cellEditor.slotType === "lab") {
//       if (!subjectCode) {
//         setError("Please select a subject.");
//         return;
//       }
//       if (!selectedSubject) {
//         setError("The selected subject is not assigned to this faculty.");
//         return;
//       }
//       if (!cellEditor.className) {
//         setError("Please select a class.");
//         return;
//       }
//       const validClass = classes.some(
//         (item) =>
//           item.value.toLowerCase() === cellEditor.className.toLowerCase(),
//       );
//       if (!validClass) {
//         setError("The selected class is not assigned to this faculty.");
//         return;
//       }
//       subjectCode = selectedSubject.subjectCode;
//       subjectName = selectedSubject.subjectName;
//     } else {
//       subjectCode = "";
//       subjectName = SPECIAL_LABELS[cellEditor.slotType] || "Other";
//     }
//     const sessionType =
//       cellEditor.slotType === "lab"
//         ? "lab"
//         : cellEditor.slotType === "subject"
//           ? "theory"
//           : cellEditor.slotType === "activity"
//             ? "activity"
//             : "other";
//     const previousEntry = grid?.[day]?.[period] || {};
//     const updatedEntry = {
//       ...previousEntry,
//       day,
//       period,
//       startTime: periodInfo.startTime,
//       endTime: periodInfo.endTime,
//       slotType: cellEditor.slotType,
//       subjectCode,
//       subjectName,
//       className:
//         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
//           ? cellEditor.className
//           : "",
//       program:
//         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
//           ? cellEditor.program
//           : "",
//       branch:
//         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
//           ? cellEditor.branch
//           : "",
//       semester:
//         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
//           ? cellEditor.semester
//           : "",
//       section:
//         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
//           ? cellEditor.section
//           : "",
//       roomNo:
//         cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
//           ? cellEditor.roomNo
//           : "",
//       sessionType,
//       remarks: cellEditor.remarks || "",
//     };
//     setGrid((previous) => ({
//       ...previous,
//       [day]: {
//         ...previous[day],
//         [period]: updatedEntry,
//       },
//     }));
//     setError("");
//     setSuccess("");
//     setActiveCell(null);
//   };
//   const clearCell = () => {
//     if (!activeCell) return;
//     const { day, period } = activeCell;
//     const periodInfo = PERIODS.find((item) => item.period === period);
//     if (!periodInfo) return;
//     setGrid((previous) => ({
//       ...previous,
//       [day]: {
//         ...previous[day],
//         [period]: createEmptyEntry(day, periodInfo),
//       },
//     }));
//     setActiveCell(null);
//     setError("");
//     setSuccess("");
//   };
//   const clearEntireTimetable = () => {
//     if (existingTimetableId && !isUpdateMode) {
//       setError("Click Update Time Table before making changes.");
//       return;
//     }
//     const confirmed = window.confirm(
//       "Are you sure you want to clear the complete timetable?",
//     );
//     if (!confirmed) return;
//     setGrid(createInitialGrid());
//     setActiveCell(null);
//     setSuccess("");
//     setError("");
//   };
//   const entries = useMemo(() => {
//     const result = [];
//     DAYS.forEach((day) => {
//       PERIODS.forEach((periodInfo) => {
//         const entry = grid?.[day]?.[periodInfo.period];
//         if (!entry) return;
//         if (
//           entry.slotType === "free" &&
//           !entry.subjectCode &&
//           !entry.className &&
//           !entry.remarks
//         )
//           return;
//         result.push({ ...entry });
//       });
//     });
//     return result;
//   }, [grid]);
//   const subjectEntries = useMemo(
//     () =>
//       entries.filter(
//         (entry) => entry.slotType === "subject" || entry.slotType === "lab",
//       ),
//     [entries],
//   );
//   const specialEntries = useMemo(
//     () =>
//       entries.filter(
//         (entry) => entry.slotType !== "subject" && entry.slotType !== "lab",
//       ),
//     [entries],
//   );
//   const subjectFrequency = useMemo(() => {
//     const map = {};
//     subjectEntries.forEach((entry) => {
//       const code = entry.subjectCode;
//       if (!code) return;
//       if (!map[code]) {
//         map[code] = {
//           subjectCode: code,
//           subjectName: entry.subjectName,
//           classes: new Set(),
//           periods: 0,
//         };
//       }
//       map[code].periods += 1;
//       if (entry.className) map[code].classes.add(entry.className);
//     });
//     return Object.values(map);
//   }, [subjectEntries]);
//   const validateBeforeSave = () => {
//     if (!selectedFacultyId) return "Please select a faculty.";
//     if (!academicYear.trim()) return "Academic year is required.";
//     for (const entry of entries) {
//       if (entry.slotType === "subject" || entry.slotType === "lab") {
//         if (!entry.subjectCode)
//           return `${entry.day}, Period ${entry.period}: Subject is required.`;
//         if (!entry.className)
//           return `${entry.day}, Period ${entry.period}: Class is required.`;
//         const validSubject = subjects.some(
//           (subject) =>
//             subject.subjectCode.toUpperCase() ===
//             entry.subjectCode.toUpperCase(),
//         );
//         if (!validSubject)
//           return `${entry.subjectCode} is not assigned to this faculty.`;
//         const validClass = classes.some(
//           (item) => item.value.toLowerCase() === entry.className.toLowerCase(),
//         );
//         if (!validClass)
//           return `${entry.className} is not assigned to this faculty.`;
//         if (!entry.program?.trim())
//           return `${entry.day}, Period ${entry.period}: Program is required.`;
//         if (!entry.branch?.trim())
//           return `${entry.day}, Period ${entry.period}: Branch is required.`;
//         if (!entry.semester?.trim())
//           return `${entry.day}, Period ${entry.period}: Semester is required.`;
//       }
//     }
//     return "";
//   };
//   const buildPayload = () => {
//     const facultyId = getFacultyId(selectedFaculty);
//     const facultyName = getFacultyName(selectedFaculty);
//     return {
//       facultyId,
//       academicYear: academicYear.trim(),
//       issueDate: issueDate || null,
//       effectiveFrom: effectiveFrom || null,
//       revisionNumber: revisionNumber.trim() || "1.0",
//       institutionName: institutionName.trim(),
//       timetableTitle: timetableTitle.trim(),
//       periods: PERIODS.map((periodInfo) => ({
//         period: periodInfo.period,
//         startTime: periodInfo.startTime,
//         endTime: periodInfo.endTime,
//       })),
//       entries: entries.map((entry) => ({
//         ...entry,
//         facultyId,
//         facultyName,
//         academicYear: academicYear.trim(),
//       })),
//       status: "active",
//     };
//   };
//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       setError("");
//       setSuccess("");
//       const validationError = validateBeforeSave();
//       if (validationError) {
//         setError(validationError);
//         setSaving(false);
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         return;
//       }
//       const facultyId = getFacultyId(selectedFaculty);
//       const facultyName = getFacultyName(selectedFaculty);
//       if (!facultyId) {
//         setError("Invalid faculty selected.");
//         setSaving(false);
//         return;
//       }
//       const payload = buildPayload();
//       console.log(
//         existingTimetableId
//           ? "UPDATE TIMETABLE PAYLOAD:"
//           : "CREATE TIMETABLE PAYLOAD:",
//         payload,
//       );
//       let response;
//       if (existingTimetableId) {
//         response = await api.put(
//           `/timetable/update-timetable/${existingTimetableId}`,
//           payload,
//         );
//       } else {
//         response = await api.post("/timetable/create-timetable", payload);
//       }
//       if (response?.data?.success === false) {
//         throw new Error(
//           response?.data?.message || "Timetable operation failed.",
//         );
//       }
//       const updatedTimetable = extractTimetableObject(response);
//       if (updatedTimetable && (updatedTimetable._id || updatedTimetable.id)) {
//         const newId = updatedTimetable._id || updatedTimetable.id;
//         setExistingTimetableId(String(newId));
//         setExistingTimetable(updatedTimetable);
//       } else if (!existingTimetableId) {
//         try {
//           const reloadResponse = await api.get(
//             `/timetable/get-faculty-timetable/${facultyId}`,
//           );
//           const reloadedTimetable = extractTimetableObject(reloadResponse);
//           if (reloadedTimetable) {
//             setExistingTimetable(reloadedTimetable);
//             setExistingTimetableId(
//               String(
//                 reloadedTimetable._id ||
//                   reloadedTimetable.id ||
//                   reloadedTimetable.timetableId ||
//                   "",
//               ),
//             );
//           }
//         } catch (reloadError) {
//           console.error("RELOAD TIMETABLE AFTER SAVE ERROR:", reloadError);
//         }
//       }
//       setIsUpdateMode(false);
//       setActiveCell(null);
//       setSuccess(
//         existingTimetableId
//           ? response?.data?.message || "Faculty timetable updated successfully."
//           : response?.data?.message ||
//               "Faculty timetable created successfully.",
//       );
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (err) {
//       console.error("TIMETABLE SAVE ERROR:", err);
//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to save timetable.",
//       );
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } finally {
//       setSaving(false);
//     }
//   };
//   const selectedFacultyName = getFacultyName(selectedFaculty);
//   const activeEntry = activeCell && grid?.[activeCell.day]?.[activeCell.period];
//   const isExisting = Boolean(existingTimetableId);
//   const canEditGrid = !isExisting || isUpdateMode;
//   return (
//     <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
//       <div className="mx-auto max-w-[1800px]">
//         <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
//               <Link to="/" className="transition hover:text-blue-600">
//                 Dashboard
//               </Link>
//               <span>/</span>
//               <span>Time Table</span>
//               <span>/</span>
//               <span className="text-slate-800">
//                 {isExisting ? "Manage" : "Create"}
//               </span>
//             </div>
//             <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 md:text-3xl">
//               <FaCalendarAlt className="text-blue-600" />
//               {isExisting ? "Faculty Time Table" : "Create Faculty Time Table"}
//             </h1>
//             <p className="mt-1 text-sm text-slate-500">
//               {isExisting
//                 ? "View and update the complete faculty timetable."
//                 : "Create the complete Monday to Saturday timetable for a faculty member."}
//             </p>
//           </div>
//           <div className="flex flex-wrap gap-3">
//             <Link
//               to="/all-timetables"
//               className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//             >
//               <FaArrowLeft />
//               Back
//             </Link>
//             <button
//               type="button"
//               onClick={fetchFaculties}
//               disabled={loadingFaculties}
//               className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <FaSyncAlt className={loadingFaculties ? "animate-spin" : ""} />
//               Refresh Faculty
//             </button>
//             {isExisting && !isUpdateMode && (
//               <button
//                 type="button"
//                 onClick={handleStartUpdate}
//                 disabled={loadingTimetable}
//                 className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <FaEdit />
//                 Update Time Table
//               </button>
//             )}
//             {isExisting && isUpdateMode && (
//               <button
//                 type="button"
//                 onClick={handleCancelUpdate}
//                 disabled={saving}
//                 className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <FaTimes />
//                 Cancel Update
//               </button>
//             )}
//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={
//                 saving || !selectedFacultyId || (isExisting && !isUpdateMode)
//               }
//               className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <FaSave />
//               {saving
//                 ? "Saving..."
//                 : isExisting
//                   ? "Save Updated Time Table"
//                   : "Save Time Table"}
//             </button>
//           </div>
//         </div>
//         {loadingTimetable && (
//           <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
//             <FaSyncAlt className="animate-spin" />
//             <div>
//               <p className="font-semibold">Loading timetable</p>
//               <p className="mt-1 text-sm">
//                 Loading the selected faculty's existing timetable...
//               </p>
//             </div>
//           </div>
//         )}
//         {isExisting && !isUpdateMode && !loadingTimetable && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
//             <FaEdit className="mt-0.5 shrink-0" />
//             <div>
//               <p className="font-semibold">Existing timetable loaded</p>
//               <p className="mt-1 text-sm">
//                 Click <span className="font-bold">Update Time Table</span> to
//                 edit, move, add or remove classes.
//               </p>
//             </div>
//           </div>
//         )}
//         {isExisting && isUpdateMode && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
//             <FaEdit className="mt-0.5 shrink-0" />
//             <div>
//               <p className="font-semibold">Update mode is active</p>
//               <p className="mt-1 text-sm">
//                 Click any timetable cell to change its subject, class, room, day
//                 or period. Clear a cell and assign the class to another period
//                 to move it.
//               </p>
//             </div>
//           </div>
//         )}
//         {error && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
//             <FaExclamationCircle className="mt-0.5 shrink-0" />
//             <div>
//               <p className="font-semibold">Unable to continue</p>
//               <p className="mt-1 text-sm">{error}</p>
//             </div>
//           </div>
//         )}
//         {success && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
//             <FaCheckCircle className="mt-0.5 shrink-0" />
//             <div>
//               <p className="font-semibold">Time table</p>
//               <p className="mt-1 text-sm">{success}</p>
//             </div>
//           </div>
//         )}
//         <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="mb-4 flex items-center gap-3">
//               <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
//                 <FaUserTie />
//               </div>
//               <div>
//                 <h2 className="font-bold text-slate-900">Faculty</h2>
//                 <p className="text-xs text-slate-500">
//                   Select faculty to load assigned data
//                 </p>
//               </div>
//             </div>
//             <label className="mb-2 block text-sm font-semibold text-slate-700">
//               Faculty
//             </label>
//             <div className="relative">
//               <select
//                 value={selectedFacultyId}
//                 onChange={handleFacultyChange}
//                 disabled={loadingFaculties}
//                 className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               >
//                 <option value="">
//                   {loadingFaculties ? "Loading faculty..." : "Select Faculty"}
//                 </option>
//                 {faculties.map((faculty) => {
//                   const id = getFacultyId(faculty);
//                   const name = getFacultyName(faculty);
//                   return (
//                     <option key={id} value={id}>
//                       {name || "Unnamed Faculty"}
//                       {faculty.employeeId ? ` - ${faculty.employeeId}` : ""}
//                     </option>
//                   );
//                 })}
//               </select>
//               <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
//             </div>
//             {selectedFaculty && (
//               <div className="mt-4 rounded-xl bg-slate-50 p-4">
//                 <p className="font-bold text-slate-900">
//                   {selectedFacultyName}
//                 </p>
//                 {selectedFaculty.employeeId && (
//                   <p className="mt-1 text-xs text-slate-500">
//                     Employee ID:{" "}
//                     <span className="font-semibold">
//                       {selectedFaculty.employeeId}
//                     </span>
//                   </p>
//                 )}
//                 {selectedFaculty.designation && (
//                   <p className="mt-1 text-xs text-slate-500">
//                     {selectedFaculty.designation}
//                   </p>
//                 )}
//                 {selectedFaculty.department && (
//                   <p className="mt-1 text-xs text-slate-500">
//                     {selectedFaculty.department}
//                   </p>
//                 )}
//                 {isExisting && (
//                   <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
//                     <FaCheckCircle /> Existing timetable
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="mb-4 flex items-center gap-3">
//               <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
//                 <FaBookOpen />
//               </div>
//               <div>
//                 <h2 className="font-bold text-slate-900">Assigned Subjects</h2>
//                 <p className="text-xs text-slate-500">
//                   Loaded directly from Faculty
//                 </p>
//               </div>
//             </div>
//             {subjects.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
//                 No assigned subjects found.
//               </div>
//             ) : (
//               <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
//                 {subjects.map((subject) => (
//                   <div
//                     key={subject.subjectCode}
//                     className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
//                   >
//                     <span className="font-bold text-blue-700">
//                       {subject.subjectCode}
//                     </span>
//                     <span className="ml-3 text-right text-xs text-slate-600">
//                       {subject.subjectName}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="mb-4 flex items-center gap-3">
//               <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
//                 <FaUsers />
//               </div>
//               <div>
//                 <h2 className="font-bold text-slate-900">Assigned Classes</h2>
//                 <p className="text-xs text-slate-500">
//                   Loaded directly from Faculty
//                 </p>
//               </div>
//             </div>
//             {classes.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
//                 No assigned classes found.
//               </div>
//             ) : (
//               <div className="flex flex-wrap gap-2">
//                 {classes.map((item) => (
//                   <span
//                     key={item.value}
//                     className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700"
//                   >
//                     {item.label}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="mb-5 flex items-center gap-3">
//             <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
//               <FaClipboardList />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-slate-900">
//                 Time Table Information
//               </h2>
//               <p className="text-sm text-slate-500">
//                 General information for the complete timetable document.
//               </p>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Institution Name
//               </label>
//               <input
//                 type="text"
//                 value={institutionName}
//                 onChange={(e) => setInstitutionName(e.target.value)}
//                 disabled={isExisting && !isUpdateMode}
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               />
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Time Table Title
//               </label>
//               <input
//                 type="text"
//                 value={timetableTitle}
//                 onChange={(e) => setTimetableTitle(e.target.value)}
//                 disabled={isExisting && !isUpdateMode}
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               />
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Issue Date
//               </label>
//               <input
//                 type="date"
//                 value={issueDate}
//                 onChange={(e) => setIssueDate(e.target.value)}
//                 disabled={isExisting && !isUpdateMode}
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               />
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 With Effect From
//               </label>
//               <input
//                 type="date"
//                 value={effectiveFrom}
//                 onChange={(e) => setEffectiveFrom(e.target.value)}
//                 disabled={isExisting && !isUpdateMode}
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               />
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Revision Number
//               </label>
//               <input
//                 type="text"
//                 value={revisionNumber}
//                 onChange={(e) => setRevisionNumber(e.target.value)}
//                 placeholder="1.0"
//                 disabled={isExisting && !isUpdateMode}
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               />
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Academic Year
//               </label>
//               <input
//                 type="text"
//                 value={academicYear}
//                 onChange={(e) => setAcademicYear(e.target.value)}
//                 placeholder="2026-2027"
//                 disabled={isExisting && !isUpdateMode}
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               />
//             </div>
//           </div>
//           <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
//             <p className="font-semibold">Important</p>
//             <p className="mt-1">
//               Program, Branch, Semester, Section, Class and Room are entered
//               inside each timetable period because they can be different for
//               different classes and subjects.
//             </p>
//           </div>
//         </div>
//         <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
//                 <FaClock className="text-blue-600" />
//                 Weekly Time Table
//               </h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 {isExisting && !isUpdateMode
//                   ? "Existing faculty timetable. Click Update Time Table to make changes."
//                   : "Click any timetable cell to assign or modify a subject, lab, break, activity or other slot."}
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={clearEntireTimetable}
//               disabled={!canEditGrid}
//               className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <FaTrash />
//               Clear Time Table
//             </button>
//           </div>
//           <div className="overflow-x-auto rounded-xl border border-slate-200">
//             <table className="min-w-[1500px] w-full border-collapse">
//               <thead>
//                 <tr>
//                   <th className="sticky left-0 z-20 min-w-[155px] border border-slate-200 bg-slate-900 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-white">
//                     Day / Time
//                   </th>
//                   {PERIODS.map((periodInfo) => (
//                     <th
//                       key={periodInfo.period}
//                       className="min-w-[145px] border border-slate-200 bg-slate-800 px-2 py-3 text-center text-white"
//                     >
//                       <div className="text-sm font-bold">
//                         Period {periodInfo.period}
//                       </div>
//                       <div className="mt-1 text-[11px] font-medium text-slate-300">
//                         {periodInfo.startTime} - {periodInfo.endTime}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {DAYS.map((day) => (
//                   <tr key={day}>
//                     <td className="sticky left-0 z-10 border border-slate-200 bg-white px-3 py-4 text-center">
//                       <div className="font-bold text-slate-900">{day}</div>
//                       <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
//                         Day
//                       </div>
//                     </td>
//                     {PERIODS.map((periodInfo) => {
//                       const entry = grid?.[day]?.[periodInfo.period];
//                       const isActive =
//                         activeCell?.day === day &&
//                         activeCell?.period === periodInfo.period;
//                       return (
//                         <td
//                           key={`${day}-${periodInfo.period}`}
//                           className="border border-slate-200 bg-slate-50 p-1"
//                         >
//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleCellClick(day, periodInfo.period)
//                             }
//                             disabled={!canEditGrid}
//                             className={`group min-h-[110px] w-full rounded-lg border p-2 text-center transition hover:-translate-y-0.5 hover:shadow-md ${getEntryClass(entry)} ${isActive ? "ring-2 ring-blue-500" : ""} ${!canEditGrid ? "cursor-default" : ""}`}
//                           >
//                             {entry?.slotType === "subject" ||
//                             entry?.slotType === "lab" ? (
//                               <>
//                                 <div className="text-sm font-extrabold">
//                                   {entry.subjectCode || "SELECT SUBJECT"}
//                                 </div>
//                                 <div className="mt-2 line-clamp-2 text-[11px] font-semibold">
//                                   {entry.subjectName}
//                                 </div>
//                                 {entry.className && (
//                                   <div className="mt-2 text-[10px] font-bold">
//                                     {entry.className}
//                                   </div>
//                                 )}
//                                 {entry.program &&
//                                   entry.branch &&
//                                   entry.semester && (
//                                     <div className="mt-1 text-[9px] text-slate-500">
//                                       {entry.program} {entry.branch}{" "}
//                                       {entry.semester}
//                                     </div>
//                                   )}
//                                 {entry.roomNo && (
//                                   <div className="mt-1 text-[10px]">
//                                     Room: {entry.roomNo}
//                                   </div>
//                                 )}
//                                 {entry.slotType === "lab" && (
//                                   <div className="mt-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-700">
//                                     LAB
//                                   </div>
//                                 )}
//                               </>
//                             ) : (
//                               <>
//                                 <div className="text-xs font-extrabold">
//                                   {getSlotLabel(entry)}
//                                 </div>
//                                 {canEditGrid && (
//                                   <div className="mt-3 text-[10px] text-slate-400">
//                                     Click to edit
//                                   </div>
//                                 )}
//                               </>
//                             )}
//                           </button>
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//         {activeCell && activeEntry && canEditGrid && (
//           <div className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
//             <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//               <div>
//                 <h2 className="text-xl font-bold text-slate-900">
//                   Edit Time Table Cell
//                 </h2>
//                 <p className="mt-1 text-sm text-slate-500">
//                   {activeCell.day} · Period {activeCell.period} ·{" "}
//                   {activeEntry.startTime} - {activeEntry.endTime}
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setActiveCell(null)}
//                 className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
//               >
//                 Close
//               </button>
//             </div>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-slate-700">
//                   Slot Type
//                 </label>
//                 <select
//                   value={cellEditor.slotType}
//                   onChange={(e) =>
//                     handleCellEditorChange("slotType", e.target.value)
//                   }
//                   className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                 >
//                   {SLOT_TYPES.map((slot) => (
//                     <option key={slot.value} value={slot.value}>
//                       {slot.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {(cellEditor.slotType === "subject" ||
//                 cellEditor.slotType === "lab") && (
//                 <>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Subject Code
//                     </label>
//                     <select
//                       value={cellEditor.subjectCode}
//                       onChange={(e) =>
//                         handleCellEditorChange("subjectCode", e.target.value)
//                       }
//                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     >
//                       <option value="">Select Subject Code</option>
//                       {subjects.map((subject) => (
//                         <option
//                           key={subject.subjectCode}
//                           value={subject.subjectCode}
//                         >
//                           {subject.subjectCode} - {subject.subjectName}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Class
//                     </label>
//                     <select
//                       value={cellEditor.className}
//                       onChange={(e) =>
//                         handleCellEditorChange("className", e.target.value)
//                       }
//                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     >
//                       <option value="">Select Class</option>
//                       {classes.map((item) => (
//                         <option key={item.value} value={item.value}>
//                           {item.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Program
//                     </label>
//                     <input
//                       type="text"
//                       value={cellEditor.program}
//                       onChange={(e) =>
//                         handleCellEditorChange("program", e.target.value)
//                       }
//                       placeholder="BTech / MTech"
//                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Branch
//                     </label>
//                     <input
//                       type="text"
//                       value={cellEditor.branch}
//                       onChange={(e) =>
//                         handleCellEditorChange("branch", e.target.value)
//                       }
//                       placeholder="CSE / IT"
//                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Semester
//                     </label>
//                     <input
//                       type="text"
//                       value={cellEditor.semester}
//                       onChange={(e) =>
//                         handleCellEditorChange("semester", e.target.value)
//                       }
//                       placeholder="V / III"
//                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Section
//                     </label>
//                     <input
//                       type="text"
//                       value={cellEditor.section}
//                       onChange={(e) =>
//                         handleCellEditorChange("section", e.target.value)
//                       }
//                       placeholder="A"
//                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Room No
//                     </label>
//                     <input
//                       type="text"
//                       value={cellEditor.roomNo}
//                       onChange={(e) =>
//                         handleCellEditorChange("roomNo", e.target.value)
//                       }
//                       placeholder="Room 301 / Lab 2"
//                       className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                 </>
//               )}
//               <div className="md:col-span-2 lg:col-span-4">
//                 <label className="mb-2 block text-sm font-semibold text-slate-700">
//                   Remarks
//                 </label>
//                 <input
//                   type="text"
//                   value={cellEditor.remarks}
//                   onChange={(e) =>
//                     handleCellEditorChange("remarks", e.target.value)
//                   }
//                   placeholder="Optional remarks"
//                   className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                 />
//               </div>
//             </div>
//             <div className="mt-5 flex flex-wrap justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={clearCell}
//                 className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
//               >
//                 <FaTrash />
//                 Clear Cell
//               </button>
//               <button
//                 type="button"
//                 onClick={applyCellEditor}
//                 className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
//               >
//                 <FaCheckCircle />
//                 Apply Cell
//               </button>
//             </div>
//           </div>
//         )}
//         <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
//                 <FaCalendarAlt />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Scheduled Entries
//                 </p>
//                 <p className="mt-1 text-2xl font-bold text-slate-900">
//                   {entries.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
//                 <FaBookOpen />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Subject / Lab Periods
//                 </p>
//                 <p className="mt-1 text-2xl font-bold text-slate-900">
//                   {subjectEntries.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
//                 <FaClipboardList />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Special Slots
//                 </p>
//                 <p className="mt-1 text-2xl font-bold text-slate-900">
//                   {specialEntries.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="mb-5">
//             <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
//               <FaBookOpen className="text-blue-600" />
//               Course Summary
//             </h2>
//             <p className="mt-1 text-sm text-slate-500">
//               Courses are taken directly from the selected faculty's assigned
//               subjects.
//             </p>
//           </div>
//           {subjects.length === 0 ? (
//             <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
//               Select a faculty to display the course list.
//             </div>
//           ) : (
//             <div className="overflow-x-auto rounded-xl border border-slate-200">
//               <table className="w-full min-w-[900px] border-collapse">
//                 <thead>
//                   <tr className="bg-slate-900 text-left text-xs font-bold uppercase tracking-wide text-white">
//                     <th className="border border-slate-700 px-4 py-3">
//                       Course Code
//                     </th>
//                     <th className="border border-slate-700 px-4 py-3">
//                       Course Name
//                     </th>
//                     <th className="border border-slate-700 px-4 py-3">L-T-P</th>
//                     <th className="border border-slate-700 px-4 py-3">
//                       Total Credits
//                     </th>
//                     <th className="border border-slate-700 px-4 py-3">
//                       Faculty Name
//                     </th>
//                     <th className="border border-slate-700 px-4 py-3">
//                       Scheduled Periods
//                     </th>
//                     <th className="border border-slate-700 px-4 py-3">
//                       Classes
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {subjects.map((subject) => {
//                     const summary = subjectFrequency.find(
//                       (item) => item.subjectCode === subject.subjectCode,
//                     );
//                     const scheduledClasses = summary
//                       ? Array.from(summary.classes)
//                       : [];
//                     return (
//                       <tr
//                         key={subject.subjectCode}
//                         className="hover:bg-slate-50"
//                       >
//                         <td className="border border-slate-200 px-4 py-3 font-bold text-blue-700">
//                           {subject.subjectCode}
//                         </td>
//                         <td className="border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800">
//                           {subject.subjectName}
//                         </td>
//                         <td className="border border-slate-200 px-4 py-3 text-sm text-slate-500">
//                           {subject.ltp || "—"}
//                         </td>
//                         <td className="border border-slate-200 px-4 py-3 text-sm text-slate-500">
//                           {subject.credits || "—"}
//                         </td>
//                         <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
//                           {selectedFacultyName || "—"}
//                         </td>
//                         <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
//                           {summary?.periods || 0}
//                         </td>
//                         <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
//                           {scheduledClasses.length > 0
//                             ? scheduledClasses.join(", ")
//                             : "—"}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//         <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
//             <div className="flex items-start gap-3">
//               <FaUserTie className="mt-1 text-blue-600" />
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Faculty
//                 </p>
//                 <p className="mt-1 font-semibold text-slate-900">
//                   {selectedFacultyName || "Not Selected"}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <FaUsers className="mt-1 text-violet-600" />
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Assigned Classes
//                 </p>
//                 <p className="mt-1 font-semibold text-slate-900">
//                   {classes.length}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <FaGraduationCap className="mt-1 text-emerald-600" />
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Assigned Subjects
//                 </p>
//                 <p className="mt-1 font-semibold text-slate-900">
//                   {subjects.length}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <FaDoorOpen className="mt-1 text-amber-600" />
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Scheduled Periods
//                 </p>
//                 <p className="mt-1 font-semibold text-slate-900">
//                   {subjectEntries.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
//           <div>
//             <p className="text-sm font-semibold text-slate-700">
//               Timetable Schedule
//             </p>
//             <p className="mt-1 text-sm text-slate-500">
//               Monday to Saturday · 10 periods per day
//             </p>
//           </div>
//           <div className="flex flex-wrap gap-3">
//             {isExisting && isUpdateMode && (
//               <button
//                 type="button"
//                 onClick={handleCancelUpdate}
//                 disabled={saving}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <FaTimes />
//                 Cancel Update
//               </button>
//             )}
//             {isExisting && !isUpdateMode && (
//               <button
//                 type="button"
//                 onClick={handleStartUpdate}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
//               >
//                 <FaEdit />
//                 Update Time Table
//               </button>
//             )}
//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={
//                 saving || !selectedFacultyId || (isExisting && !isUpdateMode)
//               }
//               className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <FaSave />
//               {saving
//                 ? "Saving..."
//                 : isExisting
//                   ? "Save Updated Time Table"
//                   : "Create Time Table"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default CreateTimeTable;

//

//

//

//

//

//

//

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaExclamationCircle,
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaUserTie,
  FaUsers,
  FaBookOpen,
  FaGraduationCap,
  FaDoorOpen,
  FaClipboardList,
  FaEdit,
  FaTimes,
  FaExchangeAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import globalBackendRoute from "../../config/Config";

const API_BASE_URL = `${globalBackendRoute}/api`;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const PERIODS = [
  { period: 1, startTime: "9:10AM", endTime: "10:00AM" },
  { period: 2, startTime: "10:00AM", endTime: "10:50AM" },
  { period: 3, startTime: "10:50AM", endTime: "11:40AM" },
  { period: 4, startTime: "11:40AM", endTime: "12:30PM" },
  { period: 5, startTime: "12:30PM", endTime: "1:20PM" },
  { period: 6, startTime: "1:20PM", endTime: "2:10PM" },
  { period: 7, startTime: "2:10PM", endTime: "3:00PM" },
  { period: 8, startTime: "3:00PM", endTime: "3:10PM" },
  { period: 9, startTime: "3:10PM", endTime: "4:00PM" },
  { period: 10, startTime: "4:00PM", endTime: "4:50PM" },
];

const SLOT_TYPES = [
  { value: "subject", label: "Subject" },
  { value: "lab", label: "Lab" },
  { value: "break", label: "Break" },
  { value: "short-break", label: "Short Break" },
  { value: "lunch", label: "Lunch" },
  { value: "sports", label: "Sports" },
  { value: "library", label: "Library" },
  { value: "activity", label: "Activity" },
  { value: "doubt-session", label: "Doubt Session" },
  { value: "cultural", label: "Cultural Activity" },
  { value: "outdoor-activity", label: "Outdoor Activity" },
  { value: "indoor-activity", label: "Indoor Activity" },
  { value: "free", label: "Free Period" },
  { value: "other", label: "Other" },
];

const SPECIAL_LABELS = {
  break: "BREAK",
  "short-break": "SHORT BREAK",
  lunch: "LUNCH BREAK",
  sports: "SPORTS",
  library: "LIB",
  activity: "ACTIVITY",
  "doubt-session": "DOUBT SESSION",
  cultural: "CULTURAL CLUB ACTIVITY",
  "outdoor-activity": "OUTDOOR ACTIVITY",
  "indoor-activity": "INDOOR ACTIVITY",
  free: "FREE PERIOD",
  other: "OTHER",
};

const getToken = () =>
  localStorage.getItem("travel_token") ||
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getResponseData = (response) =>
  response?.data?.data ??
  response?.data?.faculties ??
  response?.data?.faculty ??
  response?.data?.results ??
  response?.data;

const normalizeFacultyArray = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.faculties)) return data.faculties;

  if (Array.isArray(data?.data)) return data.data;

  if (Array.isArray(data?.results)) return data.results;

  if (Array.isArray(response?.data?.faculties)) {
    return response.data.faculties;
  }

  return [];
};

const getFacultyId = (faculty) => {
  if (!faculty) return "";

  if (typeof faculty === "string") return faculty;

  return (
    faculty?._id ||
    faculty?.id ||
    faculty?.facultyId ||
    faculty?.faculty_id ||
    ""
  );
};

const getFacultyName = (faculty) => {
  if (!faculty) return "";

  if (typeof faculty === "string") return faculty;

  if (faculty.facultyName) {
    return String(faculty.facultyName).trim();
  }

  if (faculty.fullName) {
    return String(faculty.fullName).trim();
  }

  if (faculty.name) {
    return String(faculty.name).trim();
  }

  if (faculty.employeeName) {
    return String(faculty.employeeName).trim();
  }

  if (faculty.userId && typeof faculty.userId === "object") {
    return String(
      faculty.userId.fullName ||
        faculty.userId.name ||
        faculty.userId.username ||
        faculty.userId.email ||
        "",
    ).trim();
  }

  if (faculty.user && typeof faculty.user === "object") {
    return String(
      faculty.user.fullName ||
        faculty.user.name ||
        faculty.user.username ||
        faculty.user.email ||
        "",
    ).trim();
  }

  return "";
};

const normalizeClasses = (faculty) => {
  if (!faculty) return [];

  const source = Array.isArray(faculty.classes)
    ? faculty.classes
    : Array.isArray(faculty.assignedClasses)
      ? faculty.assignedClasses
      : [];

  return source
    .map((item) => {
      if (typeof item === "string") {
        return {
          value: item.trim(),
          label: item.trim(),
        };
      }

      const value =
        item?.className ||
        item?.name ||
        item?.class ||
        item?.class_name ||
        item?.value ||
        "";

      return {
        value: String(value).trim(),
        label: String(value).trim(),
      };
    })
    .filter((item) => item.value);
};

const normalizeSubjects = (faculty) => {
  if (!faculty) return [];

  const source = Array.isArray(faculty.subjects)
    ? faculty.subjects
    : Array.isArray(faculty.assignedSubjects)
      ? faculty.assignedSubjects
      : [];

  return source
    .map((item) => {
      if (typeof item === "string") {
        return {
          subjectCode: item.trim().toUpperCase(),
          subjectName: item.trim(),
          ltp: "",
          credits: "",
        };
      }

      return {
        subjectCode: String(
          item?.subjectCode ||
            item?.code ||
            item?.courseCode ||
            item?.course_code ||
            "",
        )
          .trim()
          .toUpperCase(),

        subjectName: String(
          item?.subjectName ||
            item?.name ||
            item?.courseName ||
            item?.course_name ||
            "",
        ).trim(),

        ltp: String(
          item?.ltp ||
            item?.LTP ||
            item?.l_t_p ||
            item?.lectureTutorialPractical ||
            "",
        ).trim(),

        credits:
          item?.credits !== undefined && item?.credits !== null
            ? String(item.credits).trim()
            : "",
      };
    })
    .filter((item) => item.subjectCode);
};

const createEmptyEntry = (day, periodInfo) => ({
  day,
  period: periodInfo.period,
  startTime: periodInfo.startTime,
  endTime: periodInfo.endTime,
  slotType: "free",
  subjectCode: "",
  subjectName: "",
  className: "",
  program: "",
  branch: "",
  semester: "",
  section: "",
  roomNo: "",
  sessionType: "other",
  remarks: "",
});

const createInitialGrid = () => {
  const grid = {};

  DAYS.forEach((day) => {
    grid[day] = {};

    PERIODS.forEach((periodInfo) => {
      grid[day][periodInfo.period] = createEmptyEntry(day, periodInfo);
    });
  });

  return grid;
};

const isEmptyEntry = (entry) => {
  if (!entry) return true;

  return (
    entry.slotType === "free" &&
    !entry.subjectCode &&
    !entry.subjectName &&
    !entry.className &&
    !entry.remarks
  );
};

const getSlotLabel = (entry) => {
  if (!entry) return "";

  if (entry.slotType !== "subject" && entry.slotType !== "lab") {
    return SPECIAL_LABELS[entry.slotType] || entry.subjectName || "OTHER";
  }

  return entry.subjectCode || entry.subjectName || "";
};

const getEntryClass = (entry) => {
  if (!entry) return "";

  if (entry.slotType !== "subject" && entry.slotType !== "lab") {
    return "bg-slate-100 border-slate-300 text-slate-700";
  }

  if (entry.slotType === "lab") {
    return "bg-indigo-50 border-indigo-300 text-indigo-800";
  }

  return "bg-blue-50 border-blue-300 text-blue-800";
};

const extractTimetableObject = (response) => {
  const root = response?.data;

  const data = root?.data ?? root?.timetable ?? root?.result ?? root;

  if (Array.isArray(data)) {
    return (
      data.find((item) => item && (item._id || item.id || item.entries)) || null
    );
  }

  if (data?.timetable && typeof data.timetable === "object") {
    return data.timetable;
  }

  if (data?.result && typeof data.result === "object") {
    return data.result;
  }

  return data && typeof data === "object" ? data : null;
};

const normalizeTimetableEntries = (timetable) => {
  if (!timetable) return [];

  const source = Array.isArray(timetable.entries)
    ? timetable.entries
    : Array.isArray(timetable.schedule)
      ? timetable.schedule
      : Array.isArray(timetable.slots)
        ? timetable.slots
        : Array.isArray(timetable.data?.entries)
          ? timetable.data.entries
          : [];

  return source
    .map((item) => {
      const periodNumber = Number(item?.period || item?.periodNumber || 0);

      const periodInfo = PERIODS.find((p) => p.period === periodNumber);

      return {
        ...item,

        day: String(item?.day || "").trim(),

        period: periodNumber,

        startTime: item?.startTime || periodInfo?.startTime || "",

        endTime: item?.endTime || periodInfo?.endTime || "",

        slotType:
          item?.slotType ||
          (item?.sessionType === "lab"
            ? "lab"
            : item?.sessionType === "theory"
              ? "subject"
              : "free"),

        subjectCode: item?.subjectCode || "",

        subjectName: item?.subjectName || "",

        className: item?.className || "",

        program: item?.program || "",

        branch: item?.branch || "",

        semester: item?.semester || "",

        section: item?.section || "",

        roomNo: item?.roomNo || "",

        sessionType: item?.sessionType || "other",

        remarks: item?.remarks || "",
      };
    })
    .filter(
      (item) =>
        DAYS.includes(item.day) && item.period >= 1 && item.period <= 10,
    );
};

const buildGridFromTimetable = (timetable) => {
  const grid = createInitialGrid();

  const timetableEntries = normalizeTimetableEntries(timetable);

  timetableEntries.forEach((entry) => {
    grid[entry.day][entry.period] = entry;
  });

  return grid;
};

const CreateTimeTable = () => {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);

  const [selectedFacultyId, setSelectedFacultyId] = useState("");

  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const [classes, setClasses] = useState([]);

  const [subjects, setSubjects] = useState([]);

  const [grid, setGrid] = useState(createInitialGrid());

  const [academicYear, setAcademicYear] = useState("2026-2027");

  const [issueDate, setIssueDate] = useState("");

  const [effectiveFrom, setEffectiveFrom] = useState("");

  const [revisionNumber, setRevisionNumber] = useState("1.0");

  const [institutionName, setInstitutionName] = useState(
    "COLLEGE OF ENGINEERING & COMPUTER APPLICATION(CECA)",
  );

  const [timetableTitle, setTimetableTitle] = useState("Time Table");

  const [loadingFaculties, setLoadingFaculties] = useState(false);

  const [loadingTimetable, setLoadingTimetable] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [activeCell, setActiveCell] = useState(null);

  const [existingTimetableId, setExistingTimetableId] = useState("");

  const [existingTimetable, setExistingTimetable] = useState(null);

  const [isUpdateMode, setIsUpdateMode] = useState(false);

  /*
   * DRAG AND DROP STATE
   */
  const [draggedCell, setDraggedCell] = useState(null);

  const [dragOverCell, setDragOverCell] = useState(null);

  const [cellEditor, setCellEditor] = useState({
    slotType: "free",
    subjectCode: "",
    className: "",
    program: "",
    branch: "",
    semester: "",
    section: "",
    roomNo: "",
    remarks: "",
  });

  /*
   * --------------------------------------------------
   * LOAD FACULTIES
   * --------------------------------------------------
   */

  useEffect(() => {
    fetchFaculties();
  }, []);

  /*
   * --------------------------------------------------
   * WHEN FACULTY CHANGES
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!selectedFacultyId) {
      setSelectedFaculty(null);
      setClasses([]);
      setSubjects([]);
      setGrid(createInitialGrid());
      setExistingTimetable(null);
      setExistingTimetableId("");
      setIsUpdateMode(false);
      setActiveCell(null);
      setDraggedCell(null);
      setDragOverCell(null);

      return;
    }

    const faculty = faculties.find(
      (item) => String(getFacultyId(item)) === String(selectedFacultyId),
    );

    if (!faculty) return;

    setSelectedFaculty(faculty);

    setClasses(normalizeClasses(faculty));

    setSubjects(normalizeSubjects(faculty));

    loadFacultyTimetable(selectedFacultyId);
  }, [selectedFacultyId, faculties]);

  /*
   * --------------------------------------------------
   * FETCH FACULTIES
   * --------------------------------------------------
   */

  const fetchFaculties = async () => {
    try {
      setLoadingFaculties(true);
      setError("");

      const response = await api.get("/faculty/get-all-faculties");

      const facultyList = normalizeFacultyArray(response);

      console.log("FACULTY API RESPONSE:", response.data);

      console.log("NORMALIZED FACULTIES:", facultyList);

      setFaculties(facultyList);

      if (facultyList.length === 0) {
        setError("No faculty records were found.");
      }
    } catch (err) {
      console.error("FETCH FACULTIES ERROR:", err);

      setError(
        err?.response?.data?.message || "Failed to load faculty records.",
      );
    } finally {
      setLoadingFaculties(false);
    }
  };

  /*
   * --------------------------------------------------
   * LOAD FACULTY TIMETABLE
   * --------------------------------------------------
   */

  const loadFacultyTimetable = async (facultyId) => {
    try {
      setLoadingTimetable(true);
      setError("");
      setSuccess("");

      setExistingTimetable(null);
      setExistingTimetableId("");
      setIsUpdateMode(false);

      setActiveCell(null);
      setDraggedCell(null);
      setDragOverCell(null);

      setGrid(createInitialGrid());

      const response = await api.get(
        `/timetable/get-faculty-timetable/${facultyId}`,
      );

      console.log("FACULTY TIMETABLE RESPONSE:", response.data);

      const timetable = extractTimetableObject(response);

      if (
        !timetable ||
        (!timetable._id &&
          !timetable.id &&
          !Array.isArray(timetable.entries) &&
          !Array.isArray(timetable.schedule))
      ) {
        setExistingTimetable(null);
        setExistingTimetableId("");
        setGrid(createInitialGrid());

        return;
      }

      const timetableId =
        timetable._id || timetable.id || timetable.timetableId || "";

      const timetableEntries = normalizeTimetableEntries(timetable);

      if (!timetableId && timetableEntries.length === 0) {
        setExistingTimetable(null);
        setExistingTimetableId("");
        setGrid(createInitialGrid());

        return;
      }

      setExistingTimetable(timetable);

      setExistingTimetableId(String(timetableId));

      setGrid(buildGridFromTimetable(timetable));

      if (timetable.academicYear) {
        setAcademicYear(String(timetable.academicYear));
      }

      if (timetable.issueDate) {
        setIssueDate(String(timetable.issueDate).substring(0, 10));
      }

      if (timetable.effectiveFrom) {
        setEffectiveFrom(String(timetable.effectiveFrom).substring(0, 10));
      }

      if (timetable.revisionNumber !== undefined) {
        setRevisionNumber(String(timetable.revisionNumber));
      }

      if (timetable.institutionName) {
        setInstitutionName(String(timetable.institutionName));
      }

      if (timetable.timetableTitle) {
        setTimetableTitle(String(timetable.timetableTitle));
      }

      setSuccess("Existing faculty timetable loaded successfully.");
    } catch (err) {
      if (err?.response?.status === 404) {
        setExistingTimetable(null);
        setExistingTimetableId("");
        setGrid(createInitialGrid());
        setIsUpdateMode(false);

        setError("");
      } else {
        console.error("LOAD FACULTY TIMETABLE ERROR:", err);

        setError(
          err?.response?.data?.message || "Failed to load faculty timetable.",
        );
      }
    } finally {
      setLoadingTimetable(false);
    }
  };

  /*
   * --------------------------------------------------
   * FACULTY CHANGE
   * --------------------------------------------------
   */

  const handleFacultyChange = (event) => {
    const facultyId = event.target.value;

    setSelectedFacultyId(facultyId);

    setGrid(createInitialGrid());

    setActiveCell(null);
    setDraggedCell(null);
    setDragOverCell(null);

    setExistingTimetable(null);
    setExistingTimetableId("");
    setIsUpdateMode(false);

    setSuccess("");
    setError("");

    if (!facultyId) {
      setSelectedFaculty(null);
      setClasses([]);
      setSubjects([]);

      return;
    }

    const faculty = faculties.find(
      (item) => String(getFacultyId(item)) === String(facultyId),
    );

    if (faculty) {
      setSelectedFaculty(faculty);

      setClasses(normalizeClasses(faculty));

      setSubjects(normalizeSubjects(faculty));
    }
  };

  /*
   * --------------------------------------------------
   * START UPDATE MODE
   * --------------------------------------------------
   */

  const handleStartUpdate = () => {
    if (!existingTimetableId) {
      setError("No existing timetable was found for this faculty.");

      return;
    }

    setIsUpdateMode(true);

    setSuccess("");
    setError("");
  };

  /*
   * --------------------------------------------------
   * CANCEL UPDATE
   * --------------------------------------------------
   */

  const handleCancelUpdate = () => {
    if (existingTimetable) {
      setGrid(buildGridFromTimetable(existingTimetable));
    }

    setIsUpdateMode(false);

    setActiveCell(null);
    setDraggedCell(null);
    setDragOverCell(null);

    setError("");

    setSuccess("Changes were discarded.");
  };

  /*
   * --------------------------------------------------
   * CLICK CELL
   * --------------------------------------------------
   */

  const handleCellClick = (day, period) => {
    if (existingTimetableId && !isUpdateMode) {
      return;
    }

    const entry = grid?.[day]?.[period];

    if (!entry) return;

    setActiveCell({
      day,
      period,
    });

    setCellEditor({
      slotType: entry.slotType || "free",

      subjectCode: entry.subjectCode || "",

      className: entry.className || "",

      program: entry.program || "",

      branch: entry.branch || "",

      semester: entry.semester || "",

      section: entry.section || "",

      roomNo: entry.roomNo || "",

      remarks: entry.remarks || "",
    });

    setError("");
  };

  /*
   * --------------------------------------------------
   * CELL EDITOR
   * --------------------------------------------------
   */

  const handleCellEditorChange = (field, value) => {
    setCellEditor((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * --------------------------------------------------
   * APPLY CELL EDITOR
   * --------------------------------------------------
   */

  const applyCellEditor = () => {
    if (!activeCell) return;

    const { day, period } = activeCell;

    const periodInfo = PERIODS.find((item) => item.period === period);

    if (!periodInfo) return;

    let subjectCode = cellEditor.subjectCode;

    let subjectName = "";

    const selectedSubject = subjects.find(
      (item) =>
        item.subjectCode.toUpperCase() === String(subjectCode).toUpperCase(),
    );

    if (cellEditor.slotType === "subject" || cellEditor.slotType === "lab") {
      if (!subjectCode) {
        setError("Please select a subject.");

        return;
      }

      if (!selectedSubject) {
        setError("The selected subject is not assigned to this faculty.");

        return;
      }

      if (!cellEditor.className) {
        setError("Please select a class.");

        return;
      }

      const validClass = classes.some(
        (item) =>
          item.value.toLowerCase() === cellEditor.className.toLowerCase(),
      );

      if (!validClass) {
        setError("The selected class is not assigned to this faculty.");

        return;
      }

      subjectCode = selectedSubject.subjectCode;

      subjectName = selectedSubject.subjectName;
    } else {
      subjectCode = "";

      subjectName = SPECIAL_LABELS[cellEditor.slotType] || "Other";
    }

    const sessionType =
      cellEditor.slotType === "lab"
        ? "lab"
        : cellEditor.slotType === "subject"
          ? "theory"
          : cellEditor.slotType === "activity"
            ? "activity"
            : "other";

    const previousEntry = grid?.[day]?.[period] || {};

    const updatedEntry = {
      ...previousEntry,

      day,

      period,

      startTime: periodInfo.startTime,

      endTime: periodInfo.endTime,

      slotType: cellEditor.slotType,

      subjectCode,

      subjectName,

      className:
        cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
          ? cellEditor.className
          : "",

      program:
        cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
          ? cellEditor.program
          : "",

      branch:
        cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
          ? cellEditor.branch
          : "",

      semester:
        cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
          ? cellEditor.semester
          : "",

      section:
        cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
          ? cellEditor.section
          : "",

      roomNo:
        cellEditor.slotType === "subject" || cellEditor.slotType === "lab"
          ? cellEditor.roomNo
          : "",

      sessionType,

      remarks: cellEditor.remarks || "",
    };

    setGrid((previous) => ({
      ...previous,

      [day]: {
        ...previous[day],

        [period]: updatedEntry,
      },
    }));

    setError("");
    setSuccess("");
    setActiveCell(null);
  };

  /*
   * --------------------------------------------------
   * CLEAR CELL
   * --------------------------------------------------
   */

  const clearCell = () => {
    if (!activeCell) return;

    const { day, period } = activeCell;

    const periodInfo = PERIODS.find((item) => item.period === period);

    if (!periodInfo) return;

    setGrid((previous) => ({
      ...previous,

      [day]: {
        ...previous[day],

        [period]: createEmptyEntry(day, periodInfo),
      },
    }));

    setActiveCell(null);

    setError("");
    setSuccess("");
  };

  /*
   * --------------------------------------------------
   * CLEAR ENTIRE TIMETABLE
   * --------------------------------------------------
   */

  const clearEntireTimetable = () => {
    if (existingTimetableId && !isUpdateMode) {
      setError("Click Update Time Table before making changes.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear the complete timetable?",
    );

    if (!confirmed) return;

    setGrid(createInitialGrid());

    setActiveCell(null);
    setDraggedCell(null);
    setDragOverCell(null);

    setSuccess("");
    setError("");
  };

  /*
   * ==================================================
   * DRAG AND DROP
   * ==================================================
   */

  const handleDragStart = (event, day, period) => {
    if (!canEditGrid) {
      event.preventDefault();
      return;
    }

    const entry = grid?.[day]?.[period];

    if (!entry) {
      event.preventDefault();
      return;
    }

    if (isEmptyEntry(entry)) {
      event.preventDefault();
      return;
    }

    setDraggedCell({
      day,
      period,
    });

    setDragOverCell(null);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        day,
        period,
      }),
    );
  };

  const handleDragOver = (event, day, period) => {
    if (!canEditGrid) return;

    if (!draggedCell) return;

    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setDragOverCell({
      day,
      period,
    });
  };

  const handleDragLeave = (event) => {
    /*
     * Prevent flickering when moving
     * between children inside the button.
     */
    const currentTarget = event.currentTarget;

    const relatedTarget = event.relatedTarget;

    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }

    setDragOverCell(null);
  };

  const handleDrop = (event, targetDay, targetPeriod) => {
    event.preventDefault();

    if (!canEditGrid) {
      setDraggedCell(null);
      setDragOverCell(null);

      return;
    }

    if (!draggedCell) {
      setDraggedCell(null);
      setDragOverCell(null);

      return;
    }

    const sourceDay = draggedCell.day;

    const sourcePeriod = draggedCell.period;

    /*
     * Same cell
     */
    if (sourceDay === targetDay && sourcePeriod === targetPeriod) {
      setDraggedCell(null);
      setDragOverCell(null);

      return;
    }

    const sourceEntry = grid?.[sourceDay]?.[sourcePeriod];

    const targetEntry = grid?.[targetDay]?.[targetPeriod];

    if (!sourceEntry) {
      setDraggedCell(null);
      setDragOverCell(null);

      return;
    }

    const sourcePeriodInfo = PERIODS.find(
      (item) => item.period === sourcePeriod,
    );

    const targetPeriodInfo = PERIODS.find(
      (item) => item.period === targetPeriod,
    );

    if (!sourcePeriodInfo || !targetPeriodInfo) {
      setDraggedCell(null);
      setDragOverCell(null);

      return;
    }

    const targetIsOccupied = !isEmptyEntry(targetEntry);

    /*
     * ------------------------------------------------
     * MOVE / SWAP
     * ------------------------------------------------
     */

    setGrid((previous) => {
      const updatedGrid = {
        ...previous,

        [sourceDay]: {
          ...previous[sourceDay],
        },

        [targetDay]: {
          ...previous[targetDay],
        },
      };

      /*
       * ----------------------------------------------
       * TARGET OCCUPIED
       *
       * Swap the two timetable entries.
       * ----------------------------------------------
       */

      if (targetIsOccupied) {
        const movedToTarget = {
          ...sourceEntry,

          day: targetDay,

          period: targetPeriod,

          startTime: targetPeriodInfo.startTime,

          endTime: targetPeriodInfo.endTime,
        };

        const movedToSource = {
          ...targetEntry,

          day: sourceDay,

          period: sourcePeriod,

          startTime: sourcePeriodInfo.startTime,

          endTime: sourcePeriodInfo.endTime,
        };

        updatedGrid[sourceDay][sourcePeriod] = movedToSource;

        updatedGrid[targetDay][targetPeriod] = movedToTarget;
      } else {
        /*
         * --------------------------------------------
         * TARGET EMPTY
         *
         * Move source to target and
         * make source free.
         * --------------------------------------------
         */

        const movedEntry = {
          ...sourceEntry,

          day: targetDay,

          period: targetPeriod,

          startTime: targetPeriodInfo.startTime,

          endTime: targetPeriodInfo.endTime,
        };

        updatedGrid[targetDay][targetPeriod] = movedEntry;

        updatedGrid[sourceDay][sourcePeriod] = createEmptyEntry(
          sourceDay,
          sourcePeriodInfo,
        );
      }

      return updatedGrid;
    });

    setDraggedCell(null);
    setDragOverCell(null);
    setActiveCell(null);

    setError("");

    setSuccess(
      targetIsOccupied
        ? "Classes swapped successfully. Click Save Updated Time Table to save the changes."
        : "Class moved successfully. Click Save Updated Time Table to save the changes.",
    );
  };

  const handleDragEnd = () => {
    setDraggedCell(null);
    setDragOverCell(null);
  };

  /*
   * --------------------------------------------------
   * CAN EDIT GRID
   * --------------------------------------------------
   */

  const isExisting = Boolean(existingTimetableId);

  const canEditGrid = !isExisting || isUpdateMode;

  /*
   * --------------------------------------------------
   * ENTRIES
   * --------------------------------------------------
   */

  const entries = useMemo(() => {
    const result = [];

    DAYS.forEach((day) => {
      PERIODS.forEach((periodInfo) => {
        const entry = grid?.[day]?.[periodInfo.period];

        if (!entry) return;

        if (isEmptyEntry(entry)) {
          return;
        }

        result.push({
          ...entry,
        });
      });
    });

    return result;
  }, [grid]);

  /*
   * --------------------------------------------------
   * SUBJECT ENTRIES
   * --------------------------------------------------
   */

  const subjectEntries = useMemo(
    () =>
      entries.filter(
        (entry) => entry.slotType === "subject" || entry.slotType === "lab",
      ),
    [entries],
  );

  /*
   * --------------------------------------------------
   * SPECIAL ENTRIES
   * --------------------------------------------------
   */

  const specialEntries = useMemo(
    () =>
      entries.filter(
        (entry) => entry.slotType !== "subject" && entry.slotType !== "lab",
      ),
    [entries],
  );

  /*
   * --------------------------------------------------
   * SUBJECT FREQUENCY
   * --------------------------------------------------
   */

  const subjectFrequency = useMemo(() => {
    const map = {};

    subjectEntries.forEach((entry) => {
      const code = entry.subjectCode;

      if (!code) return;

      if (!map[code]) {
        map[code] = {
          subjectCode: code,

          subjectName: entry.subjectName,

          classes: new Set(),

          periods: 0,
        };
      }

      map[code].periods += 1;

      if (entry.className) {
        map[code].classes.add(entry.className);
      }
    });

    return Object.values(map);
  }, [subjectEntries]);

  /*
   * --------------------------------------------------
   * VALIDATE
   * --------------------------------------------------
   */

  const validateBeforeSave = () => {
    if (!selectedFacultyId) {
      return "Please select a faculty.";
    }

    if (!academicYear.trim()) {
      return "Academic year is required.";
    }

    for (const entry of entries) {
      if (entry.slotType === "subject" || entry.slotType === "lab") {
        if (!entry.subjectCode) {
          return `${entry.day}, Period ${entry.period}: Subject is required.`;
        }

        if (!entry.className) {
          return `${entry.day}, Period ${entry.period}: Class is required.`;
        }

        const validSubject = subjects.some(
          (subject) =>
            subject.subjectCode.toUpperCase() ===
            entry.subjectCode.toUpperCase(),
        );

        if (!validSubject) {
          return `${entry.subjectCode} is not assigned to this faculty.`;
        }

        const validClass = classes.some(
          (item) => item.value.toLowerCase() === entry.className.toLowerCase(),
        );

        if (!validClass) {
          return `${entry.className} is not assigned to this faculty.`;
        }

        if (!entry.program?.trim()) {
          return `${entry.day}, Period ${entry.period}: Program is required.`;
        }

        if (!entry.branch?.trim()) {
          return `${entry.day}, Period ${entry.period}: Branch is required.`;
        }

        if (!entry.semester?.trim()) {
          return `${entry.day}, Period ${entry.period}: Semester is required.`;
        }
      }
    }

    return "";
  };

  /*
   * --------------------------------------------------
   * BUILD PAYLOAD
   * --------------------------------------------------
   */

  const buildPayload = () => {
    const facultyId = getFacultyId(selectedFaculty);

    const facultyName = getFacultyName(selectedFaculty);

    return {
      facultyId,

      academicYear: academicYear.trim(),

      issueDate: issueDate || null,

      effectiveFrom: effectiveFrom || null,

      revisionNumber: revisionNumber.trim() || "1.0",

      institutionName: institutionName.trim(),

      timetableTitle: timetableTitle.trim(),

      periods: PERIODS.map((periodInfo) => ({
        period: periodInfo.period,

        startTime: periodInfo.startTime,

        endTime: periodInfo.endTime,
      })),

      entries: entries.map((entry) => ({
        ...entry,

        facultyId,

        facultyName,

        academicYear: academicYear.trim(),
      })),

      status: "active",
    };
  };

  /*
   * --------------------------------------------------
   * SAVE
   * --------------------------------------------------
   */

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const validationError = validateBeforeSave();

      if (validationError) {
        setError(validationError);

        setSaving(false);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const facultyId = getFacultyId(selectedFaculty);

      const facultyName = getFacultyName(selectedFaculty);

      if (!facultyId) {
        setError("Invalid faculty selected.");

        setSaving(false);

        return;
      }

      const payload = buildPayload();

      console.log(
        existingTimetableId
          ? "UPDATE TIMETABLE PAYLOAD:"
          : "CREATE TIMETABLE PAYLOAD:",
        payload,
      );

      let response;

      if (existingTimetableId) {
        response = await api.put(
          `/timetable/update-timetable/${existingTimetableId}`,
          payload,
        );
      } else {
        response = await api.post("/timetable/create-timetable", payload);
      }

      if (response?.data?.success === false) {
        throw new Error(
          response?.data?.message || "Timetable operation failed.",
        );
      }

      const updatedTimetable = extractTimetableObject(response);

      if (updatedTimetable && (updatedTimetable._id || updatedTimetable.id)) {
        const newId = updatedTimetable._id || updatedTimetable.id;

        setExistingTimetableId(String(newId));

        setExistingTimetable(updatedTimetable);
      } else if (!existingTimetableId) {
        try {
          const reloadResponse = await api.get(
            `/timetable/get-faculty-timetable/${facultyId}`,
          );

          const reloadedTimetable = extractTimetableObject(reloadResponse);

          if (reloadedTimetable) {
            setExistingTimetable(reloadedTimetable);

            setExistingTimetableId(
              String(
                reloadedTimetable._id ||
                  reloadedTimetable.id ||
                  reloadedTimetable.timetableId ||
                  "",
              ),
            );
          }
        } catch (reloadError) {
          console.error("RELOAD TIMETABLE AFTER SAVE ERROR:", reloadError);
        }
      }

      setIsUpdateMode(false);

      setActiveCell(null);
      setDraggedCell(null);
      setDragOverCell(null);

      setSuccess(
        existingTimetableId
          ? response?.data?.message || "Faculty timetable updated successfully."
          : response?.data?.message ||
              "Faculty timetable created successfully.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("TIMETABLE SAVE ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save timetable.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------
   * DISPLAY VALUES
   * --------------------------------------------------
   */

  const selectedFacultyName = getFacultyName(selectedFaculty);

  const activeEntry = activeCell && grid?.[activeCell.day]?.[activeCell.period];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link to="/" className="transition hover:text-blue-600">
                Dashboard
              </Link>

              <span>/</span>

              <span>Time Table</span>

              <span>/</span>

              <span className="text-slate-800">
                {isExisting ? "Manage" : "Create"}
              </span>
            </div>

            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 md:text-3xl">
              <FaCalendarAlt className="text-blue-600" />

              {isExisting ? "Faculty Time Table" : "Create Faculty Time Table"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {isExisting
                ? "View and update the complete faculty timetable."
                : "Create the complete Monday to Saturday timetable for a faculty member."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/all-timetables"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FaArrowLeft />
              Back
            </Link>

            <button
              type="button"
              onClick={fetchFaculties}
              disabled={loadingFaculties}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSyncAlt className={loadingFaculties ? "animate-spin" : ""} />
              Refresh Faculty
            </button>

            {isExisting && !isUpdateMode && (
              <button
                type="button"
                onClick={handleStartUpdate}
                disabled={loadingTimetable}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaEdit />
                Update Time Table
              </button>
            )}

            {isExisting && isUpdateMode && (
              <button
                type="button"
                onClick={handleCancelUpdate}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaTimes />
                Cancel Update
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={
                saving || !selectedFacultyId || (isExisting && !isUpdateMode)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave />

              {saving
                ? "Saving..."
                : isExisting
                  ? "Save Updated Time Table"
                  : "Save Time Table"}
            </button>
          </div>
        </div>

        {/* ==================================================
            LOADING TIMETABLE
        ================================================== */}

        {loadingTimetable && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
            <FaSyncAlt className="animate-spin" />

            <div>
              <p className="font-semibold">Loading timetable</p>

              <p className="mt-1 text-sm">
                Loading the selected faculty's existing timetable...
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            EXISTING MODE
        ================================================== */}

        {isExisting && !isUpdateMode && !loadingTimetable && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <FaEdit className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Existing timetable loaded</p>

              <p className="mt-1 text-sm">
                Click <span className="font-bold">Update Time Table</span> to
                edit, move, add or remove classes.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            UPDATE MODE
        ================================================== */}

        {isExisting && isUpdateMode && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
            <FaEdit className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Update mode is active</p>

              <p className="mt-1 text-sm">
                Click a timetable cell to edit it. Drag a scheduled class to
                another day or period to move it. Dropping onto another
                scheduled class swaps the two classes.
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
                <span className="inline-flex items-center gap-2">
                  <FaExchangeAlt />
                  Drag & Drop to Move
                </span>

                <span>Click to Edit</span>

                <span>Drop on occupied cell = Swap</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FaExclamationCircle className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Unable to continue</p>

              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <FaCheckCircle className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Time table</p>

              <p className="mt-1 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* ==================================================
            FACULTY / SUBJECTS / CLASSES
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* FACULTY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FaUserTie />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Faculty</h2>

                <p className="text-xs text-slate-500">
                  Select faculty to load assigned data
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Faculty
            </label>

            <div className="relative">
              <select
                value={selectedFacultyId}
                onChange={handleFacultyChange}
                disabled={loadingFaculties}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingFaculties ? "Loading faculty..." : "Select Faculty"}
                </option>

                {faculties.map((faculty) => {
                  const id = getFacultyId(faculty);

                  const name = getFacultyName(faculty);

                  return (
                    <option key={id} value={id}>
                      {name || "Unnamed Faculty"}

                      {faculty.employeeId ? ` - ${faculty.employeeId}` : ""}
                    </option>
                  );
                })}
              </select>

              <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            </div>

            {selectedFaculty && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="font-bold text-slate-900">
                  {selectedFacultyName}
                </p>

                {selectedFaculty.employeeId && (
                  <p className="mt-1 text-xs text-slate-500">
                    Employee ID:{" "}
                    <span className="font-semibold">
                      {selectedFaculty.employeeId}
                    </span>
                  </p>
                )}

                {selectedFaculty.designation && (
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedFaculty.designation}
                  </p>
                )}

                {selectedFaculty.department && (
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedFaculty.department}
                  </p>
                )}

                {isExisting && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    <FaCheckCircle />
                    Existing timetable
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SUBJECTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FaBookOpen />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Assigned Subjects</h2>

                <p className="text-xs text-slate-500">
                  Loaded directly from Faculty
                </p>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                No assigned subjects found.
              </div>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {subjects.map((subject) => (
                  <div
                    key={subject.subjectCode}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="font-bold text-blue-700">
                      {subject.subjectCode}
                    </span>

                    <span className="ml-3 text-right text-xs text-slate-600">
                      {subject.subjectName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CLASSES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <FaUsers />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Assigned Classes</h2>

                <p className="text-xs text-slate-500">
                  Loaded directly from Faculty
                </p>
              </div>
            </div>

            {classes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                No assigned classes found.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {classes.map((item) => (
                  <span
                    key={item.value}
                    className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            TIMETABLE INFORMATION
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <FaClipboardList />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Time Table Information
              </h2>

              <p className="text-sm text-slate-500">
                General information for the complete timetable document.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Institution Name
              </label>

              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                disabled={isExisting && !isUpdateMode}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Time Table Title
              </label>

              <input
                type="text"
                value={timetableTitle}
                onChange={(e) => setTimetableTitle(e.target.value)}
                disabled={isExisting && !isUpdateMode}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Issue Date
              </label>

              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                disabled={isExisting && !isUpdateMode}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                With Effect From
              </label>

              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                disabled={isExisting && !isUpdateMode}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Revision Number
              </label>

              <input
                type="text"
                value={revisionNumber}
                onChange={(e) => setRevisionNumber(e.target.value)}
                placeholder="1.0"
                disabled={isExisting && !isUpdateMode}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Academic Year
              </label>

              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
                disabled={isExisting && !isUpdateMode}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Important</p>

            <p className="mt-1">
              Program, Branch, Semester, Section, Class and Room are entered
              inside each timetable period because they can be different for
              different classes and subjects.
            </p>
          </div>
        </div>

        {/* ==================================================
            WEEKLY TIMETABLE
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
                <FaClock className="text-blue-600" />
                Weekly Time Table
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isExisting && !isUpdateMode
                  ? "Existing faculty timetable. Click Update Time Table to make changes."
                  : "Click any timetable cell to edit. Drag and drop scheduled classes to move them between days and periods."}
              </p>

              {canEditGrid && (
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-blue-300 bg-blue-100" />
                    Drag Class
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-emerald-300 bg-emerald-100" />
                    Drop Location
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <FaExchangeAlt className="text-violet-500" />
                    Occupied Cell = Swap
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={clearEntireTimetable}
              disabled={!canEditGrid}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaTrash />
              Clear Time Table
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[1500px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 min-w-[155px] border border-slate-200 bg-slate-900 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-white">
                    Day / Time
                  </th>

                  {PERIODS.map((periodInfo) => (
                    <th
                      key={periodInfo.period}
                      className="min-w-[145px] border border-slate-200 bg-slate-800 px-2 py-3 text-center text-white"
                    >
                      <div className="text-sm font-bold">
                        Period {periodInfo.period}
                      </div>

                      <div className="mt-1 text-[11px] font-medium text-slate-300">
                        {periodInfo.startTime} - {periodInfo.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="sticky left-0 z-10 border border-slate-200 bg-white px-3 py-4 text-center">
                      <div className="font-bold text-slate-900">{day}</div>

                      <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                        Day
                      </div>
                    </td>

                    {PERIODS.map((periodInfo) => {
                      const entry = grid?.[day]?.[periodInfo.period];

                      const isActive =
                        activeCell?.day === day &&
                        activeCell?.period === periodInfo.period;

                      const isDragged =
                        draggedCell?.day === day &&
                        draggedCell?.period === periodInfo.period;

                      const isDragTarget =
                        dragOverCell?.day === day &&
                        dragOverCell?.period === periodInfo.period;

                      const isOccupied = !isEmptyEntry(entry);

                      return (
                        <td
                          key={`${day}-${periodInfo.period}`}
                          className="border border-slate-200 bg-slate-50 p-1"
                        >
                          <button
                            type="button"
                            draggable={canEditGrid && isOccupied}
                            onClick={() =>
                              handleCellClick(day, periodInfo.period)
                            }
                            onDragStart={(event) =>
                              handleDragStart(event, day, periodInfo.period)
                            }
                            onDragOver={(event) =>
                              handleDragOver(event, day, periodInfo.period)
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(event) =>
                              handleDrop(event, day, periodInfo.period)
                            }
                            onDragEnd={handleDragEnd}
                            disabled={!canEditGrid}
                            className={`
                                  group
                                  min-h-[110px]
                                  w-full
                                  rounded-lg
                                  border
                                  p-2
                                  text-center
                                  transition
                                  hover:-translate-y-0.5
                                  hover:shadow-md

                                  ${getEntryClass(entry)}

                                  ${isActive ? "ring-2 ring-blue-500" : ""}

                                  ${
                                    isDragTarget
                                      ? "scale-[1.02] border-emerald-400 bg-emerald-50 ring-4 ring-emerald-300"
                                      : ""
                                  }

                                  ${isDragged ? "scale-95 opacity-40" : ""}

                                  ${
                                    canEditGrid && isOccupied
                                      ? "cursor-grab active:cursor-grabbing"
                                      : ""
                                  }

                                  ${!canEditGrid ? "cursor-default" : ""}
                                `}
                          >
                            {entry?.slotType === "subject" ||
                            entry?.slotType === "lab" ? (
                              <>
                                <div className="text-sm font-extrabold">
                                  {entry.subjectCode || "SELECT SUBJECT"}
                                </div>

                                <div className="mt-2 line-clamp-2 text-[11px] font-semibold">
                                  {entry.subjectName}
                                </div>

                                {entry.className && (
                                  <div className="mt-2 text-[10px] font-bold">
                                    {entry.className}
                                  </div>
                                )}

                                {entry.program &&
                                  entry.branch &&
                                  entry.semester && (
                                    <div className="mt-1 text-[9px] text-slate-500">
                                      {entry.program} {entry.branch}{" "}
                                      {entry.semester}
                                    </div>
                                  )}

                                {entry.roomNo && (
                                  <div className="mt-1 text-[10px]">
                                    Room: {entry.roomNo}
                                  </div>
                                )}

                                {entry.slotType === "lab" && (
                                  <div className="mt-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-700">
                                    LAB
                                  </div>
                                )}

                                {isDragTarget && (
                                  <div className="mt-2 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold uppercase text-emerald-700">
                                    DROP HERE
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="text-xs font-extrabold">
                                  {getSlotLabel(entry)}
                                </div>

                                {canEditGrid && (
                                  <div className="mt-3 text-[10px] text-slate-400">
                                    Click to edit
                                  </div>
                                )}

                                {isDragTarget && (
                                  <div className="mt-2 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold uppercase text-emerald-700">
                                    DROP HERE
                                  </div>
                                )}
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================================================
            CELL EDITOR
        ================================================== */}

        {activeCell && activeEntry && canEditGrid && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Time Table Cell
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {activeCell.day} · Period {activeCell.period} ·{" "}
                  {activeEntry.startTime} - {activeEntry.endTime}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveCell(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* SLOT TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slot Type
                </label>

                <select
                  value={cellEditor.slotType}
                  onChange={(e) =>
                    handleCellEditorChange("slotType", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {SLOT_TYPES.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              {(cellEditor.slotType === "subject" ||
                cellEditor.slotType === "lab") && (
                <>
                  {/* SUBJECT */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Subject Code
                    </label>

                    <select
                      value={cellEditor.subjectCode}
                      onChange={(e) =>
                        handleCellEditorChange("subjectCode", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select Subject Code</option>

                      {subjects.map((subject) => (
                        <option
                          key={subject.subjectCode}
                          value={subject.subjectCode}
                        >
                          {subject.subjectCode} - {subject.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CLASS */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Class
                    </label>

                    <select
                      value={cellEditor.className}
                      onChange={(e) =>
                        handleCellEditorChange("className", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select Class</option>

                      {classes.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PROGRAM */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Program
                    </label>

                    <input
                      type="text"
                      value={cellEditor.program}
                      onChange={(e) =>
                        handleCellEditorChange("program", e.target.value)
                      }
                      placeholder="BTech / MTech"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* BRANCH */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Branch
                    </label>

                    <input
                      type="text"
                      value={cellEditor.branch}
                      onChange={(e) =>
                        handleCellEditorChange("branch", e.target.value)
                      }
                      placeholder="CSE / IT"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* SEMESTER */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Semester
                    </label>

                    <input
                      type="text"
                      value={cellEditor.semester}
                      onChange={(e) =>
                        handleCellEditorChange("semester", e.target.value)
                      }
                      placeholder="V / III"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* SECTION */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Section
                    </label>

                    <input
                      type="text"
                      value={cellEditor.section}
                      onChange={(e) =>
                        handleCellEditorChange("section", e.target.value)
                      }
                      placeholder="A"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* ROOM */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Room No
                    </label>

                    <input
                      type="text"
                      value={cellEditor.roomNo}
                      onChange={(e) =>
                        handleCellEditorChange("roomNo", e.target.value)
                      }
                      placeholder="Room 301 / Lab 2"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </>
              )}

              {/* REMARKS */}

              <div className="md:col-span-2 lg:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Remarks
                </label>

                <input
                  type="text"
                  value={cellEditor.remarks}
                  onChange={(e) =>
                    handleCellEditorChange("remarks", e.target.value)
                  }
                  placeholder="Optional remarks"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={clearCell}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                <FaTrash />
                Clear Cell
              </button>

              <button
                type="button"
                onClick={applyCellEditor}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <FaCheckCircle />
                Apply Cell
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FaCalendarAlt />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Scheduled Entries
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {entries.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FaBookOpen />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Subject / Lab Periods
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {subjectEntries.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <FaClipboardList />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Special Slots
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {specialEntries.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            COURSE SUMMARY
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <FaBookOpen className="text-blue-600" />
              Course Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Courses are taken directly from the selected faculty's assigned
              subjects.
            </p>
          </div>

          {subjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Select a faculty to display the course list.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-left text-xs font-bold uppercase tracking-wide text-white">
                    <th className="border border-slate-700 px-4 py-3">
                      Course Code
                    </th>

                    <th className="border border-slate-700 px-4 py-3">
                      Course Name
                    </th>

                    <th className="border border-slate-700 px-4 py-3">L-T-P</th>

                    <th className="border border-slate-700 px-4 py-3">
                      Total Credits
                    </th>

                    <th className="border border-slate-700 px-4 py-3">
                      Faculty Name
                    </th>

                    <th className="border border-slate-700 px-4 py-3">
                      Scheduled Periods
                    </th>

                    <th className="border border-slate-700 px-4 py-3">
                      Classes
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {subjects.map((subject) => {
                    const summary = subjectFrequency.find(
                      (item) => item.subjectCode === subject.subjectCode,
                    );

                    const scheduledClasses = summary
                      ? Array.from(summary.classes)
                      : [];

                    return (
                      <tr
                        key={subject.subjectCode}
                        className="hover:bg-slate-50"
                      >
                        <td className="border border-slate-200 px-4 py-3 font-bold text-blue-700">
                          {subject.subjectCode}
                        </td>

                        <td className="border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800">
                          {subject.subjectName}
                        </td>

                        <td className="border border-slate-200 px-4 py-3 text-sm text-slate-500">
                          {subject.ltp || "—"}
                        </td>

                        <td className="border border-slate-200 px-4 py-3 text-sm text-slate-500">
                          {subject.credits || "—"}
                        </td>

                        <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
                          {selectedFacultyName || "—"}
                        </td>

                        <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                          {summary?.periods || 0}
                        </td>

                        <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {scheduledClasses.length > 0
                            ? scheduledClasses.join(", ")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ==================================================
            FOOTER SUMMARY
        ================================================== */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <FaUserTie className="mt-1 text-blue-600" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Faculty
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedFacultyName || "Not Selected"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaUsers className="mt-1 text-violet-600" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Assigned Classes
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {classes.length}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaGraduationCap className="mt-1 text-emerald-600" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Assigned Subjects
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {subjects.length}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaDoorOpen className="mt-1 text-amber-600" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Scheduled Periods
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {subjectEntries.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            BOTTOM ACTIONS
        ================================================== */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Timetable Schedule
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Monday to Saturday · 10 periods per day
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isExisting && isUpdateMode && (
              <button
                type="button"
                onClick={handleCancelUpdate}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaTimes />
                Cancel Update
              </button>
            )}

            {isExisting && !isUpdateMode && (
              <button
                type="button"
                onClick={handleStartUpdate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
              >
                <FaEdit />
                Update Time Table
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={
                saving || !selectedFacultyId || (isExisting && !isUpdateMode)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave />

              {saving
                ? "Saving..."
                : isExisting
                  ? "Save Updated Time Table"
                  : "Create Time Table"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTimeTable;

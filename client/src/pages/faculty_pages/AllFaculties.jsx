import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSyncAlt,
  FaDownload,
  FaPrint,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaUserTie,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaRedo,
  FaCheckSquare,
  FaSquare,
  FaFileExcel,
  FaFileWord,
  FaFilePdf,
  FaFileCsv,
  FaBriefcase,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";

import * as XLSX from "xlsx";

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  HeadingLevel,
  AlignmentType,
} from "docx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAuth } from "../../context/AuthContext";

// CONSTANTS

const TOKEN_KEY = "travel_token";

const DEFAULT_PAGE_SIZE = 25;

const EXPORT_PAGE_SIZE = 100;

const SEARCH_DEBOUNCE_TIME = 450;

// HELPERS

const getFacultyId = (faculty) => {
  return faculty?._id || faculty?.id || "";
};

const getUser = (faculty) => {
  if (!faculty) {
    return {};
  }

  if (
    faculty.userId &&
    typeof faculty.userId === "object" &&
    !Array.isArray(faculty.userId)
  ) {
    return faculty.userId;
  }

  if (
    faculty.user &&
    typeof faculty.user === "object" &&
    !Array.isArray(faculty.user)
  ) {
    return faculty.user;
  }

  return {};
};

const getFacultyName = (faculty) => {
  const user = getUser(faculty);

  return (
    faculty?.fullName ||
    user?.fullName ||
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Unknown Faculty"
  );
};

const getEmail = (faculty) => {
  const user = getUser(faculty);

  return faculty?.email || user?.email || "";
};

const getPhone = (faculty) => {
  const user = getUser(faculty);

  return faculty?.phone || user?.phone || "";
};

const getDesignation = (faculty) => {
  return (
    faculty?.designation ||
    faculty?.designationName ||
    faculty?.position ||
    "Not specified"
  );
};

const getDepartment = (faculty) => {
  if (faculty?.department && typeof faculty.department === "object") {
    return (
      faculty.department.name ||
      faculty.department.departmentName ||
      "Not specified"
    );
  }

  if (faculty?.departmentId && typeof faculty.departmentId === "object") {
    return (
      faculty.departmentId.name ||
      faculty.departmentId.departmentName ||
      "Not specified"
    );
  }

  return faculty?.departmentName || faculty?.department || "Not specified";
};

const getEmployeeId = (faculty) => {
  return faculty?.employeeId || faculty?.employeeID || "—";
};

const getQualification = (faculty) => {
  return faculty?.qualification || "—";
};

const getSpecialization = (faculty) => {
  return faculty?.specialization || "—";
};

const getExperience = (faculty) => {
  return faculty?.experience ?? "—";
};

const getJoiningDate = (faculty) => {
  if (!faculty?.joiningDate) {
    return "—";
  }

  const date = new Date(faculty.joiningDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN");
};

const getEmploymentType = (faculty) => {
  return faculty?.employmentType || "—";
};

const getStatus = (faculty) => {
  if (faculty?.isActive === false) {
    return "inactive";
  }

  return (
    faculty?.status?.toLowerCase?.() ||
    faculty?.employmentStatus?.toLowerCase?.() ||
    "active"
  );
};

const getSubjects = (faculty) => {
  return Array.isArray(faculty?.subjects) ? faculty.subjects : [];
};

const getClasses = (faculty) => {
  return Array.isArray(faculty?.classes) ? faculty.classes : [];
};

const getProfileImage = (faculty) => {
  const user = getUser(faculty);

  return (
    faculty?.profileImage ||
    faculty?.profilePicture ||
    user?.profileImage ||
    user?.avatar ||
    ""
  );
};

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? "");

  return `"${stringValue.replace(/"/g, '""')}"`;
};

const formatExportFaculty = (faculty) => {
  return {
    "Employee ID": getEmployeeId(faculty),
    Name: getFacultyName(faculty),
    Email: getEmail(faculty),
    Phone: getPhone(faculty),
    Designation: getDesignation(faculty),
    Department: getDepartment(faculty),
    Qualification: getQualification(faculty),
    Specialization: getSpecialization(faculty),
    Experience: getExperience(faculty),
    "Joining Date": getJoiningDate(faculty),
    "Employment Type": getEmploymentType(faculty),
    Status: getStatus(faculty),
    Subjects: getSubjects(faculty).length,
    Classes: getClasses(faculty).length,
  };
};

// SORT FIELDS

const SORT_FIELDS = {
  createdAt: "Created Date",
  updatedAt: "Updated Date",
  employeeId: "Employee ID",
  designation: "Designation",
  department: "Department",
  experience: "Experience",
  joiningDate: "Joining Date",
  status: "Status",
  employmentType: "Employment Type",
};

// MAIN COMPONENT

const AllFaculties = () => {
  const { api, token, loading: authLoading } = useAuth();

  // ==========================================================
  // DATA
  // ==========================================================

  const [faculties, setFaculties] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [hasNextPage, setHasNextPage] = useState(false);

  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // ==========================================================
  // LOADING / ERROR
  // ==========================================================

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [designationFilter, setDesignationFilter] = useState("all");

  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  // ==========================================================
  // SORT
  // ==========================================================

  const [sortField, setSortField] = useState("createdAt");

  const [sortDirection, setSortDirection] = useState("desc");

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ==========================================================
  // UI
  // ==========================================================

  const [showFilters, setShowFilters] = useState(false);

  const [showColumns, setShowColumns] = useState(false);

  const [showExportMenu, setShowExportMenu] = useState(false);

  const [density, setDensity] = useState("comfortable");

  // ==========================================================
  // SELECTION
  // ==========================================================

  const [selectedIds, setSelectedIds] = useState([]);

  // ==========================================================
  // EXPORT
  // ==========================================================

  const [exporting, setExporting] = useState(false);

  const [exportType, setExportType] = useState("");

  // ==========================================================
  // COLUMNS
  // ==========================================================

  const [columns, setColumns] = useState({
    employeeId: true,
    faculty: true,
    designation: true,
    department: true,
    email: true,
    phone: true,
    qualification: true,
    specialization: true,
    experience: true,
    joiningDate: true,
    employmentType: true,
    subjects: true,
    classes: true,
    status: true,
    actions: true,
  });

  // ==========================================================
  // REFS
  // ==========================================================

  const exportMenuRef = useRef(null);

  const columnsMenuRef = useRef(null);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getCurrentToken = useCallback(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || "";

    return token || storedToken || "";
  }, [token]);

  // ==========================================================
  // SEARCH DEBOUNCE
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());

      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_TIME);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================================
  // CLOSE DROPDOWNS
  // ==========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }

      if (
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(event.target)
      ) {
        setShowColumns(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // FETCH FACULTIES

  const fetchFaculties = useCallback(
    async (showRefresh = false) => {
      if (!api) {
        return;
      }

      const currentToken = getCurrentToken();

      if (!currentToken) {
        setLoading(false);
        setRefreshing(false);

        setError("Authentication token not found. Please login again.");

        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        api.defaults.headers.common.Authorization = `Bearer ${currentToken}`;

        const params = {
          page: currentPage,
          limit: pageSize,
          isDeleted: false,
          sortBy: sortField,
          sortOrder: sortDirection,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (designationFilter !== "all") {
          params.designation = designationFilter;
        }

        if (departmentFilter !== "all") {
          params.department = departmentFilter;
        }

        if (employmentTypeFilter !== "all") {
          params.employmentType = employmentTypeFilter;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        console.log("FACULTY API REQUEST:", params);

        const response = await api.get("/faculty/get-all-faculties", {
          params,
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });

        console.log("GET ALL FACULTIES RESPONSE:", response?.data);

        const data = response?.data;

        const facultyData = Array.isArray(data?.faculty) ? data.faculty : [];

        setFaculties(facultyData);

        setTotalRecords(Number(data?.total || 0));

        setTotalPages(Math.max(1, Number(data?.totalPages || 1)));

        setHasNextPage(Boolean(data?.hasNextPage));

        setHasPreviousPage(Boolean(data?.hasPreviousPage));

        // Remove selections for records that no longer exist
        setSelectedIds((previousSelectedIds) => {
          const currentIds = new Set(
            facultyData.map(getFacultyId).filter(Boolean),
          );

          return previousSelectedIds.filter((id) => currentIds.has(id));
        });
      } catch (err) {
        console.error("GET ALL FACULTIES ERROR:", err?.response?.data || err);

        const status = err?.response?.status;

        if (status === 401) {
          setError(
            "Authentication failed. Your session may have expired. Please login again.",
          );
        } else if (status === 403) {
          setError("You are not authorized to view all faculty members.");
        } else if (status === 404) {
          setError(
            "Faculty API endpoint was not found. Please check FacultyRoutes.js.",
          );
        } else if (status >= 500) {
          setError(
            err?.response?.data?.message ||
              "The server encountered an error while loading faculty records.",
          );
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load faculty records. Please try again.",
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      api,
      currentPage,
      pageSize,
      debouncedSearch,
      designationFilter,
      departmentFilter,
      employmentTypeFilter,
      statusFilter,
      sortField,
      sortDirection,
      getCurrentToken,
    ],
  );

  // INITIAL / FILTER FETCH

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const currentToken = getCurrentToken();

    if (!currentToken) {
      setLoading(false);

      setError("Authentication token not found. Please login again.");

      return;
    }

    fetchFaculties(false);
  }, [authLoading, getCurrentToken, fetchFaculties]);

  // OPTIONS

  /*
    These options are extracted from the current page.

    If you eventually want filter dropdowns containing values
    from the entire database, the ideal solution is a separate
    metadata endpoint. The filtering itself is server-side.
  */

  const designations = useMemo(() => {
    return [...new Set(faculties.map(getDesignation).filter(Boolean))].sort(
      (a, b) => String(a).localeCompare(String(b)),
    );
  }, [faculties]);

  const departments = useMemo(() => {
    return [...new Set(faculties.map(getDepartment).filter(Boolean))].sort(
      (a, b) => String(a).localeCompare(String(b)),
    );
  }, [faculties]);

  const employmentTypes = useMemo(() => {
    return [
      ...new Set(
        faculties
          .map(getEmploymentType)
          .filter((value) => value && value !== "—"),
      ),
    ].sort((a, b) => String(a).localeCompare(String(b)));
  }, [faculties]);

  // CURRENT PAGE SELECTION

  const currentPageIds = useMemo(() => {
    return faculties.map(getFacultyId).filter(Boolean);
  }, [faculties]);

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  // SORT

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  // SELECTION

  const toggleSelect = (id) => {
    if (!id) {
      return;
    }

    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((previous) =>
        previous.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([...previous, ...currentPageIds]),
      ]);
    }
  };

  // RESET

  const resetFilters = () => {
    setSearch("");

    setDebouncedSearch("");

    setDesignationFilter("all");

    setDepartmentFilter("all");

    setEmploymentTypeFilter("all");

    setStatusFilter("all");

    setSortField("createdAt");

    setSortDirection("desc");

    setCurrentPage(1);

    setSelectedIds([]);
  };

  // PAGE NAVIGATION

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(1, page), totalPages);

    setCurrentPage(safePage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const pageNumbers = useMemo(() => {
    const pages = [];

    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 2);

    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  // COLUMN TOGGLE

  const toggleColumn = (column) => {
    setColumns((previous) => ({
      ...previous,
      [column]: !previous[column],
    }));
  };

  // EXPORT QUERY

  const getExportParams = useCallback(
    (page) => {
      const params = {
        page,
        limit: EXPORT_PAGE_SIZE,
        isDeleted: false,
        sortBy: sortField,
        sortOrder: sortDirection,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (designationFilter !== "all") {
        params.designation = designationFilter;
      }

      if (departmentFilter !== "all") {
        params.department = departmentFilter;
      }

      if (employmentTypeFilter !== "all") {
        params.employmentType = employmentTypeFilter;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      return params;
    },
    [
      debouncedSearch,
      designationFilter,
      departmentFilter,
      employmentTypeFilter,
      statusFilter,
      sortField,
      sortDirection,
    ],
  );

  // FETCH ALL MATCHING FACULTY FOR EXPORT

  const fetchAllForExport = useCallback(async () => {
    const currentToken = getCurrentToken();

    if (!currentToken) {
      throw new Error("Authentication token not found.");
    }

    const allFaculty = [];

    let page = 1;

    let pages = 1;

    do {
      const params = getExportParams(page);

      const response = await api.get("/faculty/get-all-faculties", {
        params,
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = response?.data;

      const batch = Array.isArray(data?.faculty) ? data.faculty : [];

      allFaculty.push(...batch);

      pages = Math.max(1, Number(data?.totalPages || 1));

      page += 1;

      /*
          Safety protection.

          If the backend unexpectedly returns an
          incorrect totalPages value, this prevents
          an infinite request loop.
        */
      if (page > 100000) {
        break;
      }
    } while (page <= pages);

    return allFaculty;
  }, [api, getCurrentToken, getExportParams]);

  // EXPORT CSV

  const exportCSV = async () => {
    try {
      setExporting(true);

      setExportType("csv");

      setShowExportMenu(false);

      const allFaculty = await fetchAllForExport();

      if (!allFaculty.length) {
        alert("There are no faculty records to export.");

        return;
      }

      const rows = allFaculty.map(formatExportFaculty);

      const headers = Object.keys(rows[0]);

      const csv = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row) =>
          headers.map((header) => escapeCsvValue(row[header])).join(","),
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      downloadBlob(blob, "faculty-list.csv");
    } catch (error) {
      console.error("CSV EXPORT ERROR:", error);

      alert(error?.message || "Unable to export CSV.");
    } finally {
      setExporting(false);

      setExportType("");
    }
  };

  // EXPORT EXCEL

  const exportExcel = async () => {
    try {
      setExporting(true);

      setExportType("excel");

      setShowExportMenu(false);

      const allFaculty = await fetchAllForExport();

      if (!allFaculty.length) {
        alert("There are no faculty records to export.");

        return;
      }

      const rows = allFaculty.map(formatExportFaculty);

      const worksheet = XLSX.utils.json_to_sheet(rows);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty");

      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 30 },
        { wch: 18 },
        { wch: 25 },
        { wch: 35 },
        { wch: 18 },
        { wch: 30 },
        { wch: 12 },
        { wch: 15 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
      ];

      XLSX.writeFile(workbook, "faculty-list.xlsx");
    } catch (error) {
      console.error("EXCEL EXPORT ERROR:", error);

      alert(error?.message || "Unable to export Excel file.");
    } finally {
      setExporting(false);

      setExportType("");
    }
  };

  // EXPORT WORD

  const exportWord = async () => {
    try {
      setExporting(true);

      setExportType("word");

      setShowExportMenu(false);

      const allFaculty = await fetchAllForExport();

      if (!allFaculty.length) {
        alert("There are no faculty records to export.");

        return;
      }

      const rows = allFaculty.map(formatExportFaculty);

      const headers = Object.keys(rows[0]);

      const headerRow = new TableRow({
        children: headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      bold: true,
                    }),
                  ],
                }),
              ],
            }),
        ),
      });

      const dataRows = rows.map(
        (row) =>
          new TableRow({
            children: headers.map(
              (header) =>
                new TableCell({
                  children: [new Paragraph(String(row[header] ?? ""))],
                }),
            ),
          }),
      );

      const document = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "Faculty List",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `Total Faculty: ${rows.length}`,
                    bold: true,
                  }),
                ],
              }),

              new Paragraph({
                text: "",
              }),

              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                rows: [headerRow, ...dataRows],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(document);

      downloadBlob(blob, "faculty-list.docx");
    } catch (error) {
      console.error("WORD EXPORT ERROR:", error);

      alert(error?.message || "Unable to export Word file.");
    } finally {
      setExporting(false);

      setExportType("");
    }
  };

  // EXPORT PDF

  const exportPDF = async () => {
    try {
      setExporting(true);

      setExportType("pdf");

      setShowExportMenu(false);

      const allFaculty = await fetchAllForExport();

      if (!allFaculty.length) {
        alert("There are no faculty records to export.");

        return;
      }

      const rows = allFaculty.map(formatExportFaculty);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.setFontSize(16);

      pdf.text("Faculty List", 14, 15);

      pdf.setFontSize(9);

      pdf.text(`Total Faculty: ${rows.length}`, 14, 22);

      const headers = [
        "Employee ID",
        "Name",
        "Email",
        "Phone",
        "Designation",
        "Department",
        "Qualification",
        "Experience",
        "Joining Date",
        "Employment Type",
        "Status",
        "Subjects",
        "Classes",
      ];

      const body = rows.map((row) => [
        row["Employee ID"],
        row.Name,
        row.Email,
        row.Phone,
        row.Designation,
        row.Department,
        row.Qualification,
        row.Experience,
        row["Joining Date"],
        row["Employment Type"],
        row.Status,
        row.Subjects,
        row.Classes,
      ]);

      autoTable(pdf, {
        head: [headers],

        body,

        startY: 27,

        styles: {
          fontSize: 6,
          cellPadding: 2,
        },

        headStyles: {
          fontSize: 6,
        },

        margin: {
          left: 8,
          right: 8,
        },

        theme: "grid",

        didDrawPage: () => {
          const pageNumber = pdf.internal.getNumberOfPages();

          pdf.setFontSize(7);

          pdf.text(
            `Page ${pageNumber}`,
            pdf.internal.pageSize.getWidth() - 20,
            pdf.internal.pageSize.getHeight() - 5,
          );
        },
      });

      pdf.save("faculty-list.pdf");
    } catch (error) {
      console.error("PDF EXPORT ERROR:", error);

      alert(error?.message || "Unable to export PDF.");
    } finally {
      setExporting(false);

      setExportType("");
    }
  };

  // PRINT

  const printFacultyList = () => {
    window.print();
  };

  // DOWNLOAD BLOB

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // RECORD RANGE

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  // LOADING SCREEN

  if (loading || authLoading) {
    return (
      <div className="min-h-[500px] bg-white px-4 py-8">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-64 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-96 rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>

          <div className="mt-8 h-96 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  // ERROR SCREEN

  if (error) {
    return (
      <div className="min-h-[500px] bg-white px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <FaTimesCircle className="mx-auto mb-4 text-4xl text-red-500" />

          <h2 className="text-xl font-bold text-gray-900">
            Unable to load faculties
          </h2>

          <p className="mt-2 text-sm text-gray-600">{error}</p>

          <button
            type="button"
            onClick={() => {
              setError("");

              fetchFaculties(true);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700"
          >
            <FaRedo />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // UI

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-6 print:bg-white sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gray-900 p-3 text-white">
              <FaChalkboardTeacher />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                All Faculties
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage, search, filter and view all faculty members.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* REFRESH */}

            <button
              type="button"
              onClick={() => fetchFaculties(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            {/* EXPORT */}

            <div ref={exportMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((previous) => !previous)}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 disabled:opacity-50"
              >
                {exporting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaDownload />
                )}

                {exporting ? "Exporting..." : "Export"}
              </button>

              {showExportMenu && !exporting && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={exportExcel}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <FaFileExcel className="text-lg" />
                    Excel (.xlsx)
                  </button>

                  <button
                    type="button"
                    onClick={exportWord}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <FaFileWord className="text-lg" />
                    Word (.docx)
                  </button>

                  <button
                    type="button"
                    onClick={exportPDF}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <FaFilePdf className="text-lg" />
                    PDF (.pdf)
                  </button>

                  <button
                    type="button"
                    onClick={exportCSV}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <FaFileCsv className="text-lg" />
                    CSV (.csv)
                  </button>

                  <div className="my-2 border-t border-gray-100" />

                  <p className="px-3 py-2 text-xs text-gray-400">
                    Export includes all faculty matching your current filters.
                  </p>
                </div>
              )}
            </div>

            {/* PRINT */}

            <button
              type="button"
              onClick={printFacultyList}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <FaPrint />
              Print
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<FaUsers />}
            title="Total Faculty"
            value={totalRecords}
          />

          <StatCard
            icon={<FaCheckCircle />}
            title="Active"
            value={statusFilter === "active" ? totalRecords : "—"}
          />

          <StatCard
            icon={<FaTimesCircle />}
            title="Inactive"
            value={statusFilter === "inactive" ? totalRecords : "—"}
          />

          <StatCard
            icon={<FaGraduationCap />}
            title="Current Page Subjects"
            value={faculties.reduce(
              (total, faculty) => total + getSubjects(faculty).length,
              0,
            )}
          />

          <StatCard
            icon={<FaBuilding />}
            title="Current Page Classes"
            value={faculties.reduce(
              (total, faculty) => total + getClasses(faculty).length,
              0,
            )}
          />
        </div>

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm print:hidden">
          <div className="flex flex-col gap-3 xl:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search name, employee ID, email, phone, department..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* FILTER */}

            <button
              type="button"
              onClick={() => setShowFilters((previous) => !previous)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold ${
                showFilters
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaFilter />
              Filters
            </button>

            {/* COLUMNS */}

            <div ref={columnsMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowColumns((previous) => !previous)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FaEye />
                Columns
              </button>

              {showColumns && (
                <div className="absolute right-0 z-40 mt-2 max-h-[500px] w-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      Visible Columns
                    </h3>

                    <button
                      type="button"
                      onClick={() => setShowColumns(false)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {Object.keys(columns).map((column) => (
                    <button
                      key={column}
                      type="button"
                      onClick={() => toggleColumn(column)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {columns[column] ? (
                        <FaCheckSquare className="text-gray-900" />
                      ) : (
                        <FaSquare className="text-gray-300" />
                      )}

                      <span className="capitalize text-gray-700">
                        {column.replace(/([A-Z])/g, " $1")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DENSITY */}

            <select
              value={density}
              onChange={(event) => setDensity(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none"
            >
              <option value="compact">Compact</option>

              <option value="comfortable">Comfortable</option>

              <option value="spacious">Spacious</option>
            </select>

            {/* RESET */}

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FaRedo />
              Reset
            </button>
          </div>

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 xl:grid-cols-5">
              <FilterSelect
                label="Designation"
                value={designationFilter}
                onChange={(value) => {
                  setDesignationFilter(value);

                  setCurrentPage(1);
                }}
                options={designations}
              />

              <FilterSelect
                label="Department"
                value={departmentFilter}
                onChange={(value) => {
                  setDepartmentFilter(value);

                  setCurrentPage(1);
                }}
                options={departments}
              />

              <FilterSelect
                label="Employment Type"
                value={employmentTypeFilter}
                onChange={(value) => {
                  setEmploymentTypeFilter(value);

                  setCurrentPage(1);
                }}
                options={employmentTypes}
              />

              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);

                  setCurrentPage(1);
                }}
                options={["active", "inactive"]}
              />

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Sort By
                </label>

                <div className="flex gap-2">
                  <select
                    value={sortField}
                    onChange={(event) => {
                      setSortField(event.target.value);

                      setCurrentPage(1);
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    {Object.entries(SORT_FIELDS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection((previous) =>
                        previous === "asc" ? "desc" : "asc",
                      )
                    }
                    className="rounded-xl border border-gray-200 px-4 hover:bg-gray-50"
                  >
                    {sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE FILTERS */}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>
              Showing <strong className="text-gray-900">{totalRecords}</strong>{" "}
              matching faculty records
            </span>

            {search && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                Search: "{search}"
              </span>
            )}

            {designationFilter !== "all" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {designationFilter}
              </span>
            )}

            {departmentFilter !== "all" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {departmentFilter}
              </span>
            )}

            {employmentTypeFilter !== "all" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {employmentTypeFilter}
              </span>
            )}

            {statusFilter !== "all" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 capitalize text-gray-700">
                {statusFilter}
              </span>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-900 p-4 text-white sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div className="text-sm font-semibold">
              {selectedIds.length} faculty selected
            </div>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Clear Selection
            </button>
          </div>
        )}

        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block print:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1800px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-4 print:hidden">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-gray-500"
                    >
                      {allCurrentPageSelected ? (
                        <FaCheckSquare />
                      ) : (
                        <FaSquare />
                      )}
                    </button>
                  </th>

                  {columns.employeeId && (
                    <SortableHeader
                      label="Employee ID"
                      field="employeeId"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                  )}

                  {columns.faculty && (
                    <SortableHeader
                      label="Faculty"
                      field="name"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                  )}

                  {columns.designation && (
                    <SortableHeader
                      label="Designation"
                      field="designation"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                  )}

                  {columns.department && (
                    <SortableHeader
                      label="Department"
                      field="department"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                  )}

                  {columns.email && (
                    <SortableHeader
                      label="Email"
                      field="email"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                  )}

                  {columns.phone && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>
                  )}

                  {columns.qualification && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Qualification
                    </th>
                  )}

                  {columns.specialization && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Specialization
                    </th>
                  )}

                  {columns.experience && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Experience
                    </th>
                  )}

                  {columns.joiningDate && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Joining Date
                    </th>
                  )}

                  {columns.employmentType && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Employment Type
                    </th>
                  )}

                  {columns.subjects && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Subjects
                    </th>
                  )}

                  {columns.classes && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Classes
                    </th>
                  )}

                  {columns.status && (
                    <SortableHeader
                      label="Status"
                      field="status"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                  )}

                  {columns.actions && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500 print:hidden">
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {faculties.map((faculty) => {
                  const id = getFacultyId(faculty);

                  const selected = selectedIds.includes(id);

                  const rowPadding =
                    density === "compact"
                      ? "py-2"
                      : density === "spacious"
                        ? "py-6"
                        : "py-4";

                  return (
                    <tr
                      key={id}
                      className={`transition hover:bg-gray-50 ${
                        selected ? "bg-gray-50" : ""
                      }`}
                    >
                      {/* SELECT */}

                      <td className={`px-4 ${rowPadding} print:hidden`}>
                        <button
                          type="button"
                          onClick={() => toggleSelect(id)}
                          className="text-gray-500"
                        >
                          {selected ? <FaCheckSquare /> : <FaSquare />}
                        </button>
                      </td>

                      {/* EMPLOYEE ID */}

                      {columns.employeeId && (
                        <td
                          className={`px-4 ${rowPadding} font-semibold text-gray-700`}
                        >
                          {getEmployeeId(faculty)}
                        </td>
                      )}

                      {/* FACULTY */}

                      {columns.faculty && (
                        <td className={`px-4 ${rowPadding}`}>
                          <FacultyIdentity faculty={faculty} />
                        </td>
                      )}

                      {/* DESIGNATION */}

                      {columns.designation && (
                        <td className={`px-4 ${rowPadding} text-gray-700`}>
                          {getDesignation(faculty)}
                        </td>
                      )}

                      {/* DEPARTMENT */}

                      {columns.department && (
                        <td className={`px-4 ${rowPadding}`}>
                          <div className="flex items-center gap-2 text-gray-700">
                            <FaBuilding className="shrink-0 text-gray-400" />

                            {getDepartment(faculty)}
                          </div>
                        </td>
                      )}

                      {/* EMAIL */}

                      {columns.email && (
                        <td className={`px-4 ${rowPadding}`}>
                          {getEmail(faculty) ? (
                            <a
                              href={`mailto:${getEmail(faculty)}`}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                              <FaEnvelope className="shrink-0 text-gray-400" />

                              <span className="max-w-[220px] truncate">
                                {getEmail(faculty)}
                              </span>
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}

                      {/* PHONE */}

                      {columns.phone && (
                        <td className={`px-4 ${rowPadding}`}>
                          {getPhone(faculty) ? (
                            <a
                              href={`tel:${getPhone(faculty)}`}
                              className="flex items-center gap-2 text-gray-600"
                            >
                              <FaPhone className="text-gray-400" />

                              {getPhone(faculty)}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}

                      {/* QUALIFICATION */}

                      {columns.qualification && (
                        <td className={`px-4 ${rowPadding} text-gray-700`}>
                          {getQualification(faculty)}
                        </td>
                      )}

                      {/* SPECIALIZATION */}

                      {columns.specialization && (
                        <td
                          className={`max-w-[250px] px-4 ${rowPadding} text-gray-700`}
                        >
                          <span className="block max-w-[240px] truncate">
                            {getSpecialization(faculty)}
                          </span>
                        </td>
                      )}

                      {/* EXPERIENCE */}

                      {columns.experience && (
                        <td className={`px-4 ${rowPadding} text-gray-700`}>
                          {getExperience(faculty) === "—"
                            ? "—"
                            : `${getExperience(faculty)} years`}
                        </td>
                      )}

                      {/* JOINING DATE */}

                      {columns.joiningDate && (
                        <td className={`px-4 ${rowPadding} text-gray-700`}>
                          {getJoiningDate(faculty)}
                        </td>
                      )}

                      {/* EMPLOYMENT TYPE */}

                      {columns.employmentType && (
                        <td className={`px-4 ${rowPadding} text-gray-700`}>
                          {getEmploymentType(faculty)}
                        </td>
                      )}

                      {/* SUBJECTS */}

                      {columns.subjects && (
                        <td className={`px-4 ${rowPadding}`}>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                            {getSubjects(faculty).length}
                          </span>
                        </td>
                      )}

                      {/* CLASSES */}

                      {columns.classes && (
                        <td className={`px-4 ${rowPadding}`}>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                            {getClasses(faculty).length}
                          </span>
                        </td>
                      )}

                      {/* STATUS */}

                      {columns.status && (
                        <td className={`px-4 ${rowPadding}`}>
                          <StatusBadge status={getStatus(faculty)} />
                        </td>
                      )}

                      {/* ACTION */}

                      {columns.actions && (
                        <td className={`px-4 ${rowPadding} print:hidden`}>
                          <Link
                            to={`/faculty/${id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700"
                          >
                            <FaEye />
                            View
                          </Link>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {faculties.length === 0 && <EmptyState />}
        </div>

        <div className="space-y-4 lg:hidden print:hidden">
          {faculties.map((faculty) => {
            const id = getFacultyId(faculty);

            const selected = selectedIds.includes(id);

            return (
              <div
                key={id}
                className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
                  selected ? "border-gray-900" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(id)}
                      className="mt-1 text-gray-500"
                    >
                      {selected ? <FaCheckSquare /> : <FaSquare />}
                    </button>

                    <FacultyIdentity faculty={faculty} />
                  </div>

                  <StatusBadge status={getStatus(faculty)} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={<FaUserTie />}
                    label="Employee ID"
                    value={getEmployeeId(faculty)}
                  />

                  <InfoItem
                    icon={<FaBuilding />}
                    label="Department"
                    value={getDepartment(faculty)}
                  />

                  <InfoItem
                    icon={<FaGraduationCap />}
                    label="Designation"
                    value={getDesignation(faculty)}
                  />

                  <InfoItem
                    icon={<FaEnvelope />}
                    label="Email"
                    value={getEmail(faculty) || "—"}
                  />

                  <InfoItem
                    icon={<FaPhone />}
                    label="Phone"
                    value={getPhone(faculty) || "—"}
                  />

                  <InfoItem
                    icon={<FaGraduationCap />}
                    label="Qualification"
                    value={getQualification(faculty)}
                  />

                  <InfoItem
                    icon={<FaBriefcase />}
                    label="Employment"
                    value={getEmploymentType(faculty)}
                  />

                  <InfoItem
                    icon={<FaCalendarAlt />}
                    label="Joining Date"
                    value={getJoiningDate(faculty)}
                  />

                  <InfoItem
                    icon={<FaGraduationCap />}
                    label="Subjects"
                    value={getSubjects(faculty).length}
                  />

                  <InfoItem
                    icon={<FaChalkboardTeacher />}
                    label="Classes"
                    value={getClasses(faculty).length}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs font-semibold text-gray-500">
                    {getSpecialization(faculty)}
                  </span>

                  <Link
                    to={`/faculty/${id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700"
                  >
                    <FaEye />
                    View Faculty
                  </Link>
                </div>
              </div>
            );
          })}

          {faculties.length === 0 && <EmptyState />}
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between print:hidden">
          <div className="text-sm text-gray-500">
            Showing <strong className="text-gray-900">{startRecord}</strong> to{" "}
            <strong className="text-gray-900">{endRecord}</strong> of{" "}
            <strong className="text-gray-900">{totalRecords}</strong>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* PAGE SIZE */}

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));

                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
            >
              <option value={5}>5 / page</option>

              <option value={10}>10 / page</option>

              <option value={25}>25 / page</option>

              <option value={50}>50 / page</option>

              <option value={100}>100 / page</option>
            </select>

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={!hasPreviousPage || currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous page"
            >
              <FaChevronLeft />
            </button>

            {/* PAGE NUMBERS */}

            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-gray-400"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`min-w-10 rounded-xl px-3 py-2.5 text-sm font-bold ${
                      currentPage === page
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* NEXT */}

            <button
              type="button"
              disabled={!hasNextPage || currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next page"
            >
              <FaChevronRight />
            </button>

            <span className="ml-1 rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700">
              Page {currentPage} / {totalPages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// STAT CARD

const StatCard = ({ icon, title, value }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3 text-gray-700">{icon}</div>
      </div>
    </div>
  );
};

// FILTER SELECT

const FilterSelect = ({ label, value, onChange, options }) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
      >
        <option value="all">All {label}s</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// SORTABLE HEADER

const SortableHeader = ({ label, field, currentField, direction, onSort }) => {
  const active = currentField === field;

  return (
    <th className="px-4 py-4">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-gray-900"
      >
        {label}

        {!active && <FaSort className="text-gray-300" />}

        {active && direction === "asc" && (
          <FaSortUp className="text-gray-900" />
        )}

        {active && direction === "desc" && (
          <FaSortDown className="text-gray-900" />
        )}
      </button>
    </th>
  );
};

// FACULTY IDENTITY

const FacultyIdentity = ({ faculty }) => {
  const image = getProfileImage(faculty);

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      {image ? (
        <img
          src={image}
          alt={getFacultyName(faculty)}
          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
          {getFacultyName(faculty).charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate font-bold text-gray-900">
          {getFacultyName(faculty)}
        </p>

        <p className="truncate text-xs text-gray-500">
          {getDesignation(faculty)}
        </p>
      </div>
    </div>
  );
};

// STATUS BADGE

const StatusBadge = ({ status }) => {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${
        active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {active ? <FaCheckCircle /> : <FaTimesCircle />}

      {status}
    </span>
  );
};

// INFO ITEM

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        {icon}

        {label}
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
};

// EMPTY STATE

const EmptyState = () => {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
        <FaUsers />
      </div>

      <h3 className="mt-4 text-lg font-bold text-gray-900">No faculty found</h3>

      <p className="mt-2 text-sm text-gray-500">
        Try changing your search or filter criteria.
      </p>
    </div>
  );
};

export default AllFaculties;

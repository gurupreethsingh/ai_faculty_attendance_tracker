import React, {
  useCallback,
  useEffect,
  useMemo,
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
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// CONSTANTS
// ============================================================

const TOKEN_KEY = "travel_token";

// ============================================================
// HELPERS
// ============================================================

const getFacultyId = (faculty) => {
  return faculty?._id || faculty?.id || "";
};

// ============================================================
// GET USER
// ============================================================

const getUser = (faculty) => {
  if (!faculty) {
    return {};
  }

  // userId may be populated object
  if (
    faculty.userId &&
    typeof faculty.userId === "object" &&
    !Array.isArray(faculty.userId)
  ) {
    return faculty.userId;
  }

  // fallback if backend uses user
  if (
    faculty.user &&
    typeof faculty.user === "object" &&
    !Array.isArray(faculty.user)
  ) {
    return faculty.user;
  }

  return {};
};

// ============================================================
// FACULTY NAME
// ============================================================

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

// ============================================================
// EMAIL
// ============================================================

const getEmail = (faculty) => {
  const user = getUser(faculty);

  return faculty?.email || user?.email || "";
};

// ============================================================
// PHONE
// ============================================================

const getPhone = (faculty) => {
  const user = getUser(faculty);

  return faculty?.phone || user?.phone || "";
};

// ============================================================
// DESIGNATION
// ============================================================

const getDesignation = (faculty) => {
  return (
    faculty?.designation ||
    faculty?.designationName ||
    faculty?.position ||
    "Not specified"
  );
};

// ============================================================
// DEPARTMENT
// ============================================================

const getDepartment = (faculty) => {
  if (faculty?.department && typeof faculty.department === "object") {
    return (
      faculty.department.name ||
      faculty.department.departmentName ||
      "Not specified"
    );
  }

  if (
    faculty?.departmentId &&
    typeof faculty.departmentId === "object"
  ) {
    return (
      faculty.departmentId.name ||
      faculty.departmentId.departmentName ||
      "Not specified"
    );
  }

  return (
    faculty?.departmentName ||
    faculty?.department ||
    "Not specified"
  );
};

// ============================================================
// EMPLOYEE ID
// ============================================================

const getEmployeeId = (faculty) => {
  return faculty?.employeeId || faculty?.employeeID || "—";
};

// ============================================================
// STATUS
// ============================================================

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

// ============================================================
// SUBJECTS
// ============================================================

const getSubjects = (faculty) => {
  return Array.isArray(faculty?.subjects)
    ? faculty.subjects
    : [];
};

// ============================================================
// CLASSES
// ============================================================

const getClasses = (faculty) => {
  return Array.isArray(faculty?.classes)
    ? faculty.classes
    : [];
};

// ============================================================
// SORTABLE FIELDS
// ============================================================

const SORT_FIELDS = {
  name: "Name",
  employeeId: "Employee ID",
  designation: "Designation",
  department: "Department",
  email: "Email",
  status: "Status",
  createdAt: "Created Date",
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AllFaculties = () => {
  const {
    api,
    token,
    loading: authLoading,
  } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [faculties, setFaculties] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [designationFilter, setDesignationFilter] =
    useState("all");

  const [departmentFilter, setDepartmentFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortField, setSortField] =
    useState("name");

  const [sortDirection, setSortDirection] =
    useState("asc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [showFilters, setShowFilters] =
    useState(false);

  const [showColumns, setShowColumns] =
    useState(false);

  const [density, setDensity] =
    useState("comfortable");

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [columns, setColumns] = useState({
    employeeId: true,
    faculty: true,
    designation: true,
    department: true,
    email: true,
    phone: true,
    subjects: true,
    classes: true,
    status: true,
    actions: true,
  });

  // ==========================================================
  // GET CURRENT TOKEN
  // ==========================================================

  const getCurrentToken = useCallback(() => {
    const storedToken =
      localStorage.getItem(TOKEN_KEY) || "";

    return token || storedToken || "";
  }, [token]);

  // ==========================================================
  // FETCH FACULTIES
  // ==========================================================

  const fetchFaculties = useCallback(
    async (showRefresh = false) => {
      if (!api) {
        console.warn(
          "FACULTY API: Axios instance not ready."
        );

        return;
      }

      // --------------------------------------------------------
      // GET THE LATEST TOKEN
      // --------------------------------------------------------

      const currentToken = getCurrentToken();

      if (!currentToken) {
        console.warn(
          "FACULTY API: No authentication token available."
        );

        setLoading(false);
        setRefreshing(false);

        setError(
          "Authentication token not found. Please login again."
        );

        return;
      }

      // --------------------------------------------------------
      // SET AXIOS AUTHORIZATION HEADER
      // --------------------------------------------------------

      api.defaults.headers.common.Authorization =
        `Bearer ${currentToken}`;

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        console.log(
          "========================================"
        );

        console.log(
          "FACULTY API: Fetching all faculties"
        );

        console.log(
          "FACULTY API: Auth loading:",
          authLoading
        );

        console.log(
          "FACULTY API: Token available:",
          Boolean(currentToken)
        );

        console.log(
          "========================================"
        );

        // ------------------------------------------------------
        // API REQUEST
        // ------------------------------------------------------

        const response = await api.get(
          "/faculty/get-all-faculties",
          {
            headers: {
              Authorization:
                `Bearer ${currentToken}`,
            },
          }
        );

        console.log(
          "GET ALL FACULTIES STATUS:",
          response?.status
        );

        console.log(
          "GET ALL FACULTIES RESPONSE:",
          response?.data
        );

        const data = response?.data;

        // ------------------------------------------------------
        // SUPPORT ALL POSSIBLE RESPONSE FORMATS
        // ------------------------------------------------------

        let facultyData = [];

        /*
          Backend currently returns:

          {
            success: true,
            count: 10,
            data: [...]
          }
        */

        if (Array.isArray(data?.data)) {
          facultyData = data.data;
        }

        // {
        //   faculties: [...]
        // }

        else if (Array.isArray(data?.faculties)) {
          facultyData = data.faculties;
        }

        // {
        //   data: {
        //      faculties: [...]
        //   }
        // }

        else if (
          Array.isArray(data?.data?.faculties)
        ) {
          facultyData =
            data.data.faculties;
        }

        // Direct array

        else if (Array.isArray(data)) {
          facultyData = data;
        }

        // ------------------------------------------------------
        // SAVE DATA
        // ------------------------------------------------------

        setFaculties(facultyData);

        console.log(
          "FACULTY API: Faculty records loaded:",
          facultyData.length
        );

        // Reset pagination if the newly loaded data
        // no longer contains the current page.
        setCurrentPage((previousPage) => {
          const calculatedTotalPages = Math.max(
            1,
            Math.ceil(
              facultyData.length / pageSize
            )
          );

          return Math.min(
            previousPage,
            calculatedTotalPages
          );
        });

        // Remove selections that no longer exist
        // in the freshly loaded dataset.

        setSelectedIds((previousSelectedIds) => {
          const validIds = new Set(
            facultyData
              .map(getFacultyId)
              .filter(Boolean)
          );

          return previousSelectedIds.filter(
            (id) => validIds.has(id)
          );
        });
      } catch (err) {
        console.error(
          "GET ALL FACULTIES ERROR:",
          err?.response?.data || err
        );

        const status =
          err?.response?.status;

        if (status === 401) {
          setError(
            "Authentication failed. Your session may have expired. Please login again."
          );
        } else if (status === 403) {
          setError(
            "You are not authorized to view all faculty members."
          );
        } else if (status === 404) {
          setError(
            "Faculty API endpoint was not found. Please check FacultyRoutes.js."
          );
        } else if (status >= 500) {
          setError(
            err?.response?.data?.message ||
              "The server encountered an error while loading faculty records."
          );
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load faculty records. Please try again."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      api,
      authLoading,
      getCurrentToken,
      pageSize,
    ]
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadFaculties = async () => {
      // --------------------------------------------------------
      // WAIT FOR AUTH CONTEXT
      // --------------------------------------------------------

      if (authLoading) {
        console.log(
          "AllFaculties: Waiting for AuthContext..."
        );

        return;
      }

      // --------------------------------------------------------
      // GET LATEST TOKEN
      // --------------------------------------------------------

      const currentToken =
        getCurrentToken();

      if (!currentToken) {
        console.warn(
          "AllFaculties: Authentication finished but token is missing."
        );

        if (!cancelled) {
          setLoading(false);

          setError(
            "Authentication token not found. Please login again."
          );
        }

        return;
      }

      // --------------------------------------------------------
      // LOAD FACULTIES
      // --------------------------------------------------------

      console.log(
        "AllFaculties: Authentication ready."
      );

      console.log(
        "AllFaculties: Loading faculty records..."
      );

      if (!cancelled) {
        await fetchFaculties(false);
      }
    };

    loadFaculties();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    getCurrentToken,
    fetchFaculties,
  ]);

  // ==========================================================
  // UNIQUE DESIGNATIONS
  // ==========================================================

  const designations = useMemo(() => {
    return [
      ...new Set(
        faculties
          .map((faculty) =>
            getDesignation(faculty)
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [faculties]);

  // ==========================================================
  // UNIQUE DEPARTMENTS
  // ==========================================================

  const departments = useMemo(() => {
    return [
      ...new Set(
        faculties
          .map((faculty) =>
            getDepartment(faculty)
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [faculties]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredFaculties = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return faculties.filter((faculty) => {
      const name =
        getFacultyName(faculty).toLowerCase();

      const email =
        getEmail(faculty).toLowerCase();

      const phone =
        getPhone(faculty).toLowerCase();

      const employeeId =
        getEmployeeId(faculty).toLowerCase();

      const designation =
        getDesignation(faculty).toLowerCase();

      const department =
        getDepartment(faculty).toLowerCase();

      const searchMatch =
        !searchValue ||
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        designation.includes(searchValue) ||
        department.includes(searchValue);

      const designationMatch =
        designationFilter === "all" ||
        getDesignation(faculty) ===
          designationFilter;

      const departmentMatch =
        departmentFilter === "all" ||
        getDepartment(faculty) ===
          departmentFilter;

      const statusMatch =
        statusFilter === "all" ||
        getStatus(faculty) ===
          statusFilter;

      return (
        searchMatch &&
        designationMatch &&
        departmentMatch &&
        statusMatch
      );
    });
  }, [
    faculties,
    search,
    designationFilter,
    departmentFilter,
    statusFilter,
  ]);

  // ==========================================================
  // SORT
  // ==========================================================

  const sortedFaculties = useMemo(() => {
    const result = [
      ...filteredFaculties,
    ];

    result.sort((a, b) => {
      let valueA = "";
      let valueB = "";

      switch (sortField) {
        case "employeeId":
          valueA = getEmployeeId(a);
          valueB = getEmployeeId(b);
          break;

        case "designation":
          valueA = getDesignation(a);
          valueB = getDesignation(b);
          break;

        case "department":
          valueA = getDepartment(a);
          valueB = getDepartment(b);
          break;

        case "email":
          valueA = getEmail(a);
          valueB = getEmail(b);
          break;

        case "status":
          valueA = getStatus(a);
          valueB = getStatus(b);
          break;

        case "createdAt":
          valueA = new Date(
            a?.createdAt || 0
          ).getTime();

          valueB = new Date(
            b?.createdAt || 0
          ).getTime();

          break;

        case "name":
        default:
          valueA = getFacultyName(a);
          valueB = getFacultyName(b);
          break;
      }

      if (
        typeof valueA === "number" &&
        typeof valueB === "number"
      ) {
        return sortDirection === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }

      return sortDirection === "asc"
        ? String(valueA).localeCompare(
            String(valueB)
          )
        : String(valueB).localeCompare(
            String(valueA)
          );
    });

    return result;
  }, [
    filteredFaculties,
    sortField,
    sortDirection,
  ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalRecords =
    sortedFaculties.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalRecords / pageSize
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedFaculties = useMemo(() => {
    const start =
      (currentPage - 1) * pageSize;

    return sortedFaculties.slice(
      start,
      start + pageSize
    );
  }, [
    sortedFaculties,
    currentPage,
    pageSize,
  ]);

  const startRecord =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const endRecord = Math.min(
    currentPage * pageSize,
    totalRecords
  );

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const active =
      faculties.filter(
        (faculty) =>
          getStatus(faculty) ===
          "active"
      ).length;

    const inactive =
      faculties.filter(
        (faculty) =>
          getStatus(faculty) ===
          "inactive"
      ).length;

    const totalSubjects =
      faculties.reduce(
        (total, faculty) =>
          total +
          getSubjects(faculty).length,
        0
      );

    const totalClasses =
      faculties.reduce(
        (total, faculty) =>
          total +
          getClasses(faculty).length,
        0
      );

    return {
      total: faculties.length,
      active,
      inactive,
      totalSubjects,
      totalClasses,
    };
  }, [faculties]);

  // ==========================================================
  // SORT HANDLER
  // ==========================================================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  // ==========================================================
  // SELECT
  // ==========================================================

  const toggleSelect = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  };

  const currentPageIds =
    paginatedFaculties
      .map(getFacultyId)
      .filter(Boolean);

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedIds.includes(id)
    );

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) =>
            !currentPageIds.includes(id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...currentPageIds,
        ]),
      ]);
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetFilters = () => {
    setSearch("");

    setDesignationFilter("all");

    setDepartmentFilter("all");

    setStatusFilter("all");

    setSortField("name");

    setSortDirection("asc");

    setCurrentPage(1);

    setSelectedIds([]);
  };

  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  const exportCSV = () => {
    const rows =
      sortedFaculties.map(
        (faculty) => ({
          "Employee ID":
            getEmployeeId(faculty),

          Name:
            getFacultyName(faculty),

          Email:
            getEmail(faculty),

          Phone:
            getPhone(faculty),

          Designation:
            getDesignation(faculty),

          Department:
            getDepartment(faculty),

          Status:
            getStatus(faculty),

          Subjects:
            getSubjects(faculty).length,

          Classes:
            getClasses(faculty).length,
        })
      );

    if (!rows.length) {
      return;
    }

    const headers =
      Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value =
              String(
                row[header] ?? ""
              );

            return `"${value.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "faculty-list.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==========================================================
  // PRINT
  // ==========================================================

  const printFacultyList = () => {
    window.print();
  };

  // ==========================================================
  // COLUMN TOGGLE
  // ==========================================================

  const toggleColumn = (column) => {
    setColumns((previous) => ({
      ...previous,
      [column]:
        !previous[column],
    }));
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading || authLoading) {
    return (
      <div className="min-h-[500px] bg-white px-4 py-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-64 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-96 rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-gray-100"
                />
              )
            )}
          </div>

          <div className="mt-8 h-96 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-[500px] bg-white px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <FaTimesCircle className="mx-auto mb-4 text-4xl text-red-500" />

          <h2 className="text-xl font-bold text-gray-900">
            Unable to load faculties
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {error}
          </p>

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

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-6 sm:px-5 lg:px-8 print:bg-white">
      <div className="mx-auto max-w-[1600px]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gray-900 p-3 text-white">
              <FaChalkboardTeacher />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                All Faculties
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage, search and view all faculty members.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                fetchFaculties(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <FaSyncAlt
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <FaDownload />

              Export
            </button>

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

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<FaUsers />}
            title="Total Faculty"
            value={statistics.total}
          />

          <StatCard
            icon={<FaCheckCircle />}
            title="Active"
            value={statistics.active}
          />

          <StatCard
            icon={<FaTimesCircle />}
            title="Inactive"
            value={statistics.inactive}
          />

          <StatCard
            icon={<FaGraduationCap />}
            title="Subjects"
            value={statistics.totalSubjects}
          />

          <StatCard
            icon={<FaBuilding />}
            title="Classes"
            value={statistics.totalClasses}
          />
        </div>

        {/* ======================================================
            SEARCH / TOOLBAR
        ====================================================== */}

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setCurrentPage(1);
                }}
                placeholder="Search name, employee ID, email, phone, department..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (previous) =>
                    !previous
                )
              }
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold ${
                showFilters
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaFilter />

              Filters
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowColumns(
                    (previous) =>
                      !previous
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FaEye />

                Columns
              </button>

              {showColumns && (
                <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      Visible Columns
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setShowColumns(
                          false
                        )
                      }
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {Object.keys(columns).map(
                    (column) => (
                      <button
                        key={column}
                        type="button"
                        onClick={() =>
                          toggleColumn(
                            column
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {columns[column] ? (
                          <FaCheckSquare className="text-gray-900" />
                        ) : (
                          <FaSquare className="text-gray-300" />
                        )}

                        <span className="capitalize text-gray-700">
                          {column.replace(
                            /([A-Z])/g,
                            " $1"
                          )}
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <select
              value={density}
              onChange={(event) =>
                setDensity(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none"
            >
              <option value="compact">
                Compact
              </option>

              <option value="comfortable">
                Comfortable
              </option>

              <option value="spacious">
                Spacious
              </option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FaRedo />

              Reset
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label="Designation"
                value={designationFilter}
                onChange={(value) => {
                  setDesignationFilter(
                    value
                  );

                  setCurrentPage(1);
                }}
                options={designations}
              />

              <FilterSelect
                label="Department"
                value={departmentFilter}
                onChange={(value) => {
                  setDepartmentFilter(
                    value
                  );

                  setCurrentPage(1);
                }}
                options={departments}
              />

              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);

                  setCurrentPage(1);
                }}
                options={[
                  "active",
                  "inactive",
                ]}
              />

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Sort By
                </label>

                <div className="flex gap-2">
                  <select
                    value={sortField}
                    onChange={(event) => {
                      setSortField(
                        event.target.value
                      );

                      setCurrentPage(1);
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    {Object.entries(
                      SORT_FIELDS
                    ).map(
                      ([
                        value,
                        label,
                      ]) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {label}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection(
                        (previous) =>
                          previous ===
                          "asc"
                            ? "desc"
                            : "asc"
                      )
                    }
                    className="rounded-xl border border-gray-200 px-4 hover:bg-gray-50"
                  >
                    {sortDirection ===
                    "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>
              Showing{" "}
              <strong className="text-gray-900">
                {totalRecords}
              </strong>{" "}
              matching faculty records
            </span>

            {search && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                Search: "{search}"
              </span>
            )}

            {designationFilter !==
              "all" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {designationFilter}
              </span>
            )}

            {departmentFilter !==
              "all" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {departmentFilter}
              </span>
            )}

            {statusFilter !==
              "all" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 capitalize text-gray-700">
                {statusFilter}
              </span>
            )}
          </div>
        </div>

        {/* ======================================================
            BULK SELECTION
        ====================================================== */}

        {selectedIds.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-900 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold">
              {selectedIds.length} faculty
              selected
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedIds([])
              }
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* ======================================================
            DESKTOP TABLE
        ====================================================== */}

        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-4">
                    <button
                      type="button"
                      onClick={
                        toggleSelectAll
                      }
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
                      currentField={
                        sortField
                      }
                      direction={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    />
                  )}

                  {columns.faculty && (
                    <SortableHeader
                      label="Faculty"
                      field="name"
                      currentField={
                        sortField
                      }
                      direction={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    />
                  )}

                  {columns.designation && (
                    <SortableHeader
                      label="Designation"
                      field="designation"
                      currentField={
                        sortField
                      }
                      direction={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    />
                  )}

                  {columns.department && (
                    <SortableHeader
                      label="Department"
                      field="department"
                      currentField={
                        sortField
                      }
                      direction={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    />
                  )}

                  {columns.email && (
                    <SortableHeader
                      label="Email"
                      field="email"
                      currentField={
                        sortField
                      }
                      direction={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    />
                  )}

                  {columns.phone && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Phone
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
                      currentField={
                        sortField
                      }
                      direction={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    />
                  )}

                  {columns.actions && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedFaculties.map(
                  (faculty) => {
                    const id =
                      getFacultyId(
                        faculty
                      );

                    const selected =
                      selectedIds.includes(
                        id
                      );

                    return (
                      <tr
                        key={id}
                        className={`transition hover:bg-gray-50 ${
                          selected
                            ? "bg-gray-50"
                            : ""
                        }`}
                      >
                        <td
                          className={
                            density ===
                            "compact"
                              ? "px-4 py-2"
                              : density ===
                                  "spacious"
                                ? "px-4 py-6"
                                : "px-4 py-4"
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleSelect(
                                id
                              )
                            }
                            className="text-gray-500"
                          >
                            {selected ? (
                              <FaCheckSquare />
                            ) : (
                              <FaSquare />
                            )}
                          </button>
                        </td>

                        {columns.employeeId && (
                          <td className="px-4 py-4 font-semibold text-gray-700">
                            {getEmployeeId(
                              faculty
                            )}
                          </td>
                        )}

                        {columns.faculty && (
                          <td className="px-4 py-4">
                            <FacultyIdentity
                              faculty={
                                faculty
                              }
                            />
                          </td>
                        )}

                        {columns.designation && (
                          <td className="px-4 py-4 text-gray-700">
                            {getDesignation(
                              faculty
                            )}
                          </td>
                        )}

                        {columns.department && (
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <FaBuilding className="text-gray-400" />

                              {getDepartment(
                                faculty
                              )}
                            </div>
                          </td>
                        )}

                        {columns.email && (
                          <td className="px-4 py-4">
                            <a
                              href={`mailto:${getEmail(
                                faculty
                              )}`}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                              <FaEnvelope className="text-gray-400" />

                              {getEmail(
                                faculty
                              ) || "—"}
                            </a>
                          </td>
                        )}

                        {columns.phone && (
                          <td className="px-4 py-4">
                            {getPhone(
                              faculty
                            ) ? (
                              <a
                                href={`tel:${getPhone(
                                  faculty
                                )}`}
                                className="flex items-center gap-2 text-gray-600"
                              >
                                <FaPhone className="text-gray-400" />

                                {getPhone(
                                  faculty
                                )}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        )}

                        {columns.subjects && (
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              {
                                getSubjects(
                                  faculty
                                ).length
                              }
                            </span>
                          </td>
                        )}

                        {columns.classes && (
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              {
                                getClasses(
                                  faculty
                                ).length
                              }
                            </span>
                          </td>
                        )}

                        {columns.status && (
                          <td className="px-4 py-4">
                            <StatusBadge
                              status={getStatus(
                                faculty
                              )}
                            />
                          </td>
                        )}

                        {columns.actions && (
                          <td className="px-4 py-4">
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
                  }
                )}
              </tbody>
            </table>
          </div>

          {paginatedFaculties.length ===
            0 && <EmptyState />}
        </div>

        {/* ======================================================
            MOBILE
        ====================================================== */}

        <div className="space-y-4 lg:hidden">
          {paginatedFaculties.map(
            (faculty) => {
              const id =
                getFacultyId(
                  faculty
                );

              return (
                <Link
                  key={id}
                  to={`/faculty/${id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <FacultyIdentity
                      faculty={
                        faculty
                      }
                    />

                    <StatusBadge
                      status={getStatus(
                        faculty
                      )}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoItem
                      icon={
                        <FaUserTie />
                      }
                      label="Employee ID"
                      value={getEmployeeId(
                        faculty
                      )}
                    />

                    <InfoItem
                      icon={
                        <FaBuilding />
                      }
                      label="Department"
                      value={getDepartment(
                        faculty
                      )}
                    />

                    <InfoItem
                      icon={
                        <FaGraduationCap />
                      }
                      label="Designation"
                      value={getDesignation(
                        faculty
                      )}
                    />

                    <InfoItem
                      icon={
                        <FaEnvelope />
                      }
                      label="Email"
                      value={
                        getEmail(
                          faculty
                        ) || "—"
                      }
                    />

                    <InfoItem
                      icon={
                        <FaPhone />
                      }
                      label="Phone"
                      value={
                        getPhone(
                          faculty
                        ) || "—"
                      }
                    />

                    <InfoItem
                      icon={
                        <FaGraduationCap />
                      }
                      label="Subjects"
                      value={
                        getSubjects(
                          faculty
                        ).length
                      }
                    />

                    <InfoItem
                      icon={
                        <FaChalkboardTeacher />
                      }
                      label="Classes"
                      value={
                        getClasses(
                          faculty
                        ).length
                      }
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs font-semibold text-gray-500">
                      Click to view complete profile
                    </span>

                    <span className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white">
                      View Faculty
                    </span>
                  </div>
                </Link>
              );
            }
          )}

          {paginatedFaculties.length ===
            0 && <EmptyState />}
        </div>

        {/* ======================================================
            PAGINATION
        ====================================================== */}

        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <strong className="text-gray-900">
              {startRecord}
            </strong>{" "}
            to{" "}
            <strong className="text-gray-900">
              {endRecord}
            </strong>{" "}
            of{" "}
            <strong className="text-gray-900">
              {totalRecords}
            </strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(
                  Number(
                    event.target.value
                  )
                );

                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
            >
              <option value={5}>
                5 / page
              </option>

              <option value={10}>
                10 / page
              </option>

              <option value={25}>
                25 / page
              </option>

              <option value={50}>
                50 / page
              </option>

              <option value={100}>
                100 / page
              </option>
            </select>

            <button
              type="button"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.max(
                      1,
                      previous - 1
                    )
                )
              }
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>

            <span className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white">
              {currentPage} /{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.min(
                      totalPages,
                      previous + 1
                    )
                )
              }
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 disabled:opacity-40"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// FILTER SELECT
// ============================================================

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none"
      >
        <option value="all">
          All {label}s
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================================
// SORT HEADER
// ============================================================

const SortableHeader = ({
  label,
  field,
  currentField,
  direction,
  onSort,
}) => {
  const active =
    currentField === field;

  return (
    <th className="px-4 py-4">
      <button
        type="button"
        onClick={() =>
          onSort(field)
        }
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-gray-900"
      >
        {label}

        {!active && (
          <FaSort className="text-gray-300" />
        )}

        {active &&
          direction ===
            "asc" && (
            <FaSortUp className="text-gray-900" />
          )}

        {active &&
          direction ===
            "desc" && (
            <FaSortDown className="text-gray-900" />
          )}
      </button>
    </th>
  );
};

// ============================================================
// FACULTY IDENTITY
// ============================================================

const FacultyIdentity = ({
  faculty,
}) => {
  const user =
    getUser(faculty);

  const image =
    faculty?.profileImage ||
    faculty?.profilePicture ||
    user?.profileImage ||
    user?.avatar ||
    "";

  return (
    <div className="flex items-center gap-3">
      {image ? (
        <img
          src={image}
          alt={getFacultyName(
            faculty
          )}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
          {getFacultyName(
            faculty
          )
            .charAt(0)
            .toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate font-bold text-gray-900">
          {getFacultyName(
            faculty
          )}
        </p>

        <p className="truncate text-xs text-gray-500">
          {getDesignation(
            faculty
          )}
        </p>
      </div>
    </div>
  );
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({
  status,
}) => {
  const active =
    status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {active ? (
        <FaCheckCircle />
      ) : (
        <FaTimesCircle />
      )}

      {status}
    </span>
  );
};

// ============================================================
// INFO ITEM
// ============================================================

const InfoItem = ({
  icon,
  label,
  value,
}) => {
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

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = () => {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
        <FaUsers />
      </div>

      <h3 className="mt-4 text-lg font-bold text-gray-900">
        No faculty found
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        Try changing your search or filter criteria.
      </p>
    </div>
  );
};

export default AllFaculties;
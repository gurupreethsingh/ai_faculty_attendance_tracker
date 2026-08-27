import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaIdBadge,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaBook,
  FaClock,
  FaSyncAlt,
  FaRedo,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

// ==========================================================
// CONSTANTS
// ==========================================================

const TOKEN_KEY = "travel_token";

// ==========================================================
// HELPERS
// ==========================================================

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

const value = (...values) =>
  values.find(
    (v) => v !== undefined && v !== null && String(v).trim() !== "",
  ) || "";

const getName = (faculty) => {
  const user = getUser(faculty);

  return (
    value(
      faculty?.fullName,
      faculty?.name,
      user?.fullName,
      user?.name,
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    ) || "Unknown Faculty"
  );
};

const getDepartment = (faculty) => {
  const department = faculty?.department;

  if (department && typeof department === "object") {
    return value(
      department?.name,
      department?.departmentName,
      department?.title,
      "Not specified",
    );
  }

  if (
    faculty?.departmentId &&
    typeof faculty.departmentId === "object" &&
    !Array.isArray(faculty.departmentId)
  ) {
    return value(
      faculty.departmentId?.name,
      faculty.departmentId?.departmentName,
      faculty.departmentId?.title,
      "Not specified",
    );
  }

  return value(
    faculty?.departmentName,
    department,
    faculty?.departmentId,
    "Not specified",
  );
};

const getDesignation = (faculty) =>
  value(
    faculty?.designation,
    faculty?.designationName,
    faculty?.position,
    "Not specified",
  );

const getStatus = (faculty) => {
  if (faculty?.isActive === false) {
    return "inactive";
  }

  return String(faculty?.status || faculty?.employmentStatus || "active")
    .trim()
    .toLowerCase();
};

const getArray = (faculty, ...keys) => {
  for (const key of keys) {
    if (Array.isArray(faculty?.[key])) {
      return faculty[key];
    }
  }

  return [];
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

const SingleFaculty = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { api, token, loading: authLoading } = useAuth();

  // ==========================================================
  // DATA
  // ==========================================================

  const [faculty, setFaculty] = useState(null);

  // ==========================================================
  // LOADING / ERROR
  // ==========================================================

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // GET CURRENT TOKEN
  //
  // Same approach used in AllFaculties.jsx.
  //
  // AuthContext token gets priority.
  // localStorage is used as fallback.
  // ==========================================================

  const getCurrentToken = useCallback(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || "";

    return token || storedToken || "";
  }, [token]);

  // ==========================================================
  // FETCH SINGLE FACULTY
  // ==========================================================

  const fetchFaculty = useCallback(
    async (showRefresh = false) => {
      if (!api) {
        return;
      }

      // ------------------------------------------------------
      // CHECK FACULTY ID
      // ------------------------------------------------------

      if (!id) {
        setFaculty(null);
        setLoading(false);
        setRefreshing(false);
        setError("Faculty ID is missing.");
        return;
      }

      // ------------------------------------------------------
      // GET LATEST TOKEN
      // ------------------------------------------------------

      const currentToken = getCurrentToken();

      // ------------------------------------------------------
      // CHECK TOKEN
      // ------------------------------------------------------

      if (!currentToken) {
        setFaculty(null);
        setLoading(false);
        setRefreshing(false);
        setError("Authentication token not found. Please login again.");
        return;
      }

      // ------------------------------------------------------
      // LOADING STATE
      // ------------------------------------------------------

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        console.log("==========================================");
        console.log("GET SINGLE FACULTY");
        console.log("Faculty ID:", id);
        console.log("Token available:", !!currentToken);
        console.log("==========================================");

        // ----------------------------------------------------
        // IMPORTANT
        //
        // Set Authorization exactly like AllFaculties.jsx.
        // ----------------------------------------------------

        api.defaults.headers.common.Authorization = `Bearer ${currentToken}`;

        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

        const response = await api.get(
          `/faculty/get-faculty-by-id/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          },
        );

        console.log("SINGLE FACULTY RESPONSE:", response?.data);

        const data = response?.data;

        // ----------------------------------------------------
        // SUPPORT DIFFERENT POSSIBLE RESPONSE STRUCTURES
        // ----------------------------------------------------

        const result =
          data?.faculty ||
          data?.data?.faculty ||
          data?.data ||
          data?.result ||
          null;

        // ----------------------------------------------------
        // VALIDATE RESULT
        // ----------------------------------------------------

        if (!result || typeof result !== "object" || Array.isArray(result)) {
          throw new Error("Faculty details were not returned by the server.");
        }

        // ----------------------------------------------------
        // SET FACULTY
        // ----------------------------------------------------

        setFaculty(result);
      } catch (err) {
        console.error("GET SINGLE FACULTY ERROR:", err?.response?.data || err);

        const status = err?.response?.status;

        // ----------------------------------------------------
        // 401 - SESSION EXPIRED
        // ----------------------------------------------------

        if (status === 401) {
          setFaculty(null);

          setError("Your session has expired. Please login again.");

          // Navigate after giving the user a clear indication
          // through the login page state.
          navigate("/login", {
            replace: true,
            state: {
              sessionExpired: true,
            },
          });

          return;
        }

        // ----------------------------------------------------
        // 403 - FORBIDDEN
        // ----------------------------------------------------

        if (status === 403) {
          setError("You are not authorized to view this faculty member.");
        }

        // ----------------------------------------------------
        // 404 - NOT FOUND
        // ----------------------------------------------------
        else if (status === 404) {
          setError("Faculty record was not found.");
        }

        // ----------------------------------------------------
        // NETWORK ERROR
        // ----------------------------------------------------
        else if (err?.code === "ERR_NETWORK") {
          setError(
            "Unable to connect to the backend server. Please make sure the backend is running.",
          );
        }

        // ----------------------------------------------------
        // OTHER ERROR
        // ----------------------------------------------------
        else {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Unable to load faculty information.",
          );
        }

        setFaculty(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api, id, getCurrentToken, navigate],
  );

  // ==========================================================
  // INITIAL / ID / AUTH FETCH
  //
  // IMPORTANT:
  //
  // Wait until AuthContext has restored authentication.
  //
  // Then fetch automatically.
  //
  // This means:
  //
  // All Faculties
  //      ↓
  // View
  //      ↓
  // Single Faculty
  //
  // will automatically fetch without browser reload.
  // ==========================================================

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    const currentToken = getCurrentToken();

    if (!currentToken) {
      setLoading(false);
      setFaculty(null);
      setError("Authentication token not found. Please login again.");
      return;
    }

    if (!id) {
      setLoading(false);
      setFaculty(null);
      setError("Faculty ID is missing.");
      return;
    }

    fetchFaculty(false);
  }, [authLoading, id, getCurrentToken, fetchFaculty]);

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />

          <div className="mt-5 h-48 animate-pulse rounded-2xl bg-white shadow-sm" />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-white" />

            <div className="h-72 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR / NO FACULTY
  // ==========================================================

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <FaTimesCircle className="mx-auto text-4xl text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Unable to load faculty
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "The requested faculty could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              <FaArrowLeft />
              Go Back
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                fetchFaculty(false);
              }}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <FaRedo />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // FACULTY DATA
  // ==========================================================

  const user = getUser(faculty);

  const name = getName(faculty);

  const email = value(faculty?.email, user?.email);

  const phone = value(faculty?.phone, user?.phone);

  const address1 = value(faculty?.addressLine1, user?.addressLine1);

  const address2 = value(faculty?.addressLine2, user?.addressLine2);

  const city = value(faculty?.city, user?.city);

  const state = value(faculty?.state, user?.state);

  const country = value(faculty?.country, user?.country);

  const postalCode = value(
    faculty?.postalCode,
    faculty?.pincode,
    faculty?.zipCode,
    user?.postalCode,
    user?.pincode,
    user?.zipCode,
  );

  const nationality = value(faculty?.nationality, user?.nationality);

  const currency = value(faculty?.preferredCurrency, user?.preferredCurrency);

  const subjects = getArray(faculty, "subjects", "assignedSubjects");

  const classes = getArray(faculty, "classes", "assignedClasses");

  const facultyId = faculty?._id || faculty?.id || faculty?.facultyId || id;

  const image = value(
    faculty?.profileImage,
    faculty?.profilePicture,
    user?.profileImage,
    user?.avatar,
    user?.avatarUrl,
  );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        {/* ==================================================
            TOP ACTIONS
        ================================================== */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft />
            Back to All Faculties
          </button>

          <button
            type="button"
            onClick={() => fetchFaculty(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-24 bg-gray-900" />

          <div className="px-4 pb-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
              <div className="shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="h-24 w-24 rounded-2xl border-4 border-white bg-gray-100 object-cover shadow-md"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gray-700 text-3xl font-bold text-white shadow-md">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words text-2xl font-bold text-gray-900">
                    {name}
                  </h1>

                  <StatusBadge status={getStatus(faculty)} />
                </div>

                <p className="mt-1 text-sm font-semibold text-gray-600 sm:text-base">
                  {getDesignation(faculty)}
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  {getDepartment(faculty)}
                </p>
              </div>

              <Link
                to={`/update-faculty/${facultyId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
              >
                <FaEdit />
                Edit Faculty
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            icon={<FaBook />}
            title="Subjects"
            value={subjects.length}
          />

          <SummaryCard
            icon={<FaChalkboardTeacher />}
            title="Classes"
            value={classes.length}
          />

          <SummaryCard
            icon={<FaIdBadge />}
            title="Employee ID"
            value={faculty?.employeeId || "—"}
          />

          <SummaryCard
            icon={<FaBuilding />}
            title="Department"
            value={getDepartment(faculty)}
          />
        </div>

        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <Section title="Personal Information">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={<FaUserTie />} label="Full Name" value={name} />

            <DetailItem
              icon={<FaIdBadge />}
              label="Employee ID"
              value={faculty?.employeeId || "—"}
            />

            <DetailItem
              icon={<FaGraduationCap />}
              label="Designation"
              value={getDesignation(faculty)}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Department"
              value={getDepartment(faculty)}
            />

            <DetailItem
              icon={<FaEnvelope />}
              label="Email"
              value={email || "—"}
            />

            <DetailItem icon={<FaPhone />} label="Phone" value={phone || "—"} />

            <DetailItem
              icon={<FaCalendarAlt />}
              label="Date of Birth"
              value={formatDate(faculty?.dateOfBirth || user?.dateOfBirth)}
            />

            <DetailItem
              icon={<FaUserTie />}
              label="Gender"
              value={value(faculty?.gender, user?.gender) || "—"}
            />

            <DetailItem
              icon={<FaUserTie />}
              label="Employment Type"
              value={faculty?.employmentType || "—"}
            />

            <DetailItem
              icon={<FaCalendarAlt />}
              label="Joining Date"
              value={formatDate(faculty?.joiningDate)}
            />

            <DetailItem
              icon={<FaCalendarAlt />}
              label="Created At"
              value={formatDate(faculty?.createdAt)}
            />

            <DetailItem
              icon={<FaCheckCircle />}
              label="Status"
              value={getStatus(faculty)}
            />
          </div>
        </Section>

        {/* ==================================================
            CONTACT
        ================================================== */}

        <Section title="Contact & Address">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<FaEnvelope />}
              label="Email"
              value={email || "—"}
            />

            <DetailItem icon={<FaPhone />} label="Phone" value={phone || "—"} />

            <DetailItem
              icon={<FaBuilding />}
              label="Address"
              value={address1 || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Address Line 2"
              value={address2 || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="City"
              value={city || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="State"
              value={state || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Country"
              value={country || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Postal Code"
              value={postalCode || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Nationality"
              value={nationality || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Preferred Currency"
              value={currency || "—"}
            />
          </div>
        </Section>

        {/* ==================================================
            SUBJECTS
        ================================================== */}

        <Section title={`Subjects (${subjects.length})`}>
          {subjects.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject, index) => {
                const subjectName =
                  typeof subject === "string"
                    ? subject
                    : value(
                        subject?.name,
                        subject?.subjectName,
                        subject?.title,
                        subject?.code,
                        `Subject ${index + 1}`,
                      );

                return (
                  <Card
                    key={subject?._id || subject?.id || index}
                    icon={<FaGraduationCap />}
                    title={subjectName}
                    subtitle={typeof subject === "object" ? subject?.code : ""}
                  />
                );
              })}
            </div>
          ) : (
            <Empty text="No subjects assigned." />
          )}
        </Section>

        {/* ==================================================
            CLASSES
        ================================================== */}

        <Section title={`Classes (${classes.length})`}>
          {classes.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((item, index) => {
                const className =
                  typeof item === "string"
                    ? item
                    : value(
                        item?.name,
                        item?.className,
                        item?.section,
                        item?.title,
                        `Class ${index + 1}`,
                      );

                return (
                  <Card
                    key={item?._id || item?.id || index}
                    icon={<FaChalkboardTeacher />}
                    title={className}
                    subtitle={
                      typeof item === "object" && item?.section
                        ? `Section: ${item.section}`
                        : ""
                    }
                  />
                );
              })}
            </div>
          ) : (
            <Empty text="No classes assigned." />
          )}
        </Section>

        {/* ==================================================
            MANAGEMENT
        ================================================== */}

        <Section title="Faculty Management">
          <div className="grid gap-3 md:grid-cols-3">
            <ManagementCard
              icon={<FaClock />}
              title="Timetable"
              description="View complete faculty timetable."
            />

            <ManagementCard
              icon={<FaCheckCircle />}
              title="Attendance"
              description="View faculty attendance records."
            />

            <ManagementCard
              icon={<FaChalkboardTeacher />}
              title="Class Management"
              description="Manage assigned classes."
            />
          </div>
        </Section>
      </main>
    </div>
  );
};

// ==========================================================
// SECTION
// ==========================================================

const Section = ({ title, children }) => (
  <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <h2 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">{title}</h2>

    {children}
  </section>
);

// ==========================================================
// DETAIL ITEM
// ==========================================================

const DetailItem = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-gray-50 p-4">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
      {icon}

      {label}
    </div>

    <p className="mt-2 break-words text-sm font-semibold leading-6 text-gray-800">
      {value}
    </p>
  </div>
);

// ==========================================================
// SUMMARY CARD
// ==========================================================

const SummaryCard = ({ icon, title, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-gray-100 p-3 text-gray-700">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase text-gray-400">{title}</p>

        <p className="mt-1 break-words text-lg font-bold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  </div>
);

// ==========================================================
// STATUS BADGE
// ==========================================================

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

// ==========================================================
// CARD
// ==========================================================

const Card = ({ icon, title, subtitle }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-white p-3 text-gray-700 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="break-words font-bold text-gray-900">{title}</p>

        {subtitle && (
          <p className="mt-1 break-words text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

// ==========================================================
// MANAGEMENT CARD
// ==========================================================

const ManagementCard = ({ icon, title, description }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 opacity-70">
    <div className="flex items-start gap-4">
      <div className="rounded-xl bg-white p-3 text-gray-700 shadow-sm">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>

        <span className="mt-2 inline-block text-xs font-bold text-gray-400">
          Coming soon
        </span>
      </div>
    </div>
  </div>
);

// ==========================================================
// EMPTY
// ==========================================================

const Empty = ({ text }) => (
  <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-500">
    {text}
  </div>
);

export default SingleFaculty;

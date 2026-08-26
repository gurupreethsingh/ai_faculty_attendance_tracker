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
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// HELPERS
// ============================================================

const getFacultyId = (faculty) =>
  faculty?._id || faculty?.id || faculty?.facultyId || "";

const getUser = (faculty) => {
  if (faculty?.userId && typeof faculty.userId === "object") {
    return faculty.userId;
  }

  if (faculty?.user && typeof faculty.user === "object") {
    return faculty.user;
  }

  return {};
};

// ============================================================
// USER / FACULTY VALUE HELPERS
// ============================================================

const getName = (faculty) => {
  const user = getUser(faculty);

  return (
    faculty?.fullName ||
    faculty?.name ||
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

// ============================================================
// ADDRESS HELPERS
// ============================================================

const getAddressLine1 = (faculty) => {
  const user = getUser(faculty);

  return faculty?.addressLine1 || user?.addressLine1 || "";
};

const getAddressLine2 = (faculty) => {
  const user = getUser(faculty);

  return faculty?.addressLine2 || user?.addressLine2 || "";
};

const getCity = (faculty) => {
  const user = getUser(faculty);

  return faculty?.city || user?.city || "";
};

const getState = (faculty) => {
  const user = getUser(faculty);

  return faculty?.state || user?.state || "";
};

const getCountry = (faculty) => {
  const user = getUser(faculty);

  return faculty?.country || user?.country || "";
};

const getPostalCode = (faculty) => {
  const user = getUser(faculty);

  return (
    faculty?.postalCode ||
    faculty?.pincode ||
    faculty?.zipCode ||
    user?.postalCode ||
    user?.pincode ||
    user?.zipCode ||
    ""
  );
};

const getNationality = (faculty) => {
  const user = getUser(faculty);

  return faculty?.nationality || user?.nationality || "";
};

const getPreferredCurrency = (faculty) => {
  const user = getUser(faculty);

  return faculty?.preferredCurrency || user?.preferredCurrency || "";
};

// ============================================================
// FACULTY HELPERS
// ============================================================

const getDesignation = (faculty) =>
  faculty?.designation ||
  faculty?.designationName ||
  faculty?.position ||
  "Not specified";

const getDepartment = (faculty) => {
  if (typeof faculty?.department === "object") {
    return (
      faculty.department?.name ||
      faculty.department?.departmentName ||
      "Not specified"
    );
  }

  if (typeof faculty?.departmentId === "object") {
    return (
      faculty.departmentId?.name ||
      faculty.departmentId?.departmentName ||
      "Not specified"
    );
  }

  return (
    faculty?.departmentName ||
    faculty?.department ||
    faculty?.departmentId ||
    "Not specified"
  );
};

const getSubjects = (faculty) => {
  if (Array.isArray(faculty?.subjects)) {
    return faculty.subjects;
  }

  if (Array.isArray(faculty?.assignedSubjects)) {
    return faculty.assignedSubjects;
  }

  return [];
};

const getClasses = (faculty) => {
  if (Array.isArray(faculty?.classes)) {
    return faculty.classes;
  }

  if (Array.isArray(faculty?.assignedClasses)) {
    return faculty.assignedClasses;
  }

  return [];
};

const getStatus = (faculty) => {
  if (faculty?.isActive === false) {
    return "inactive";
  }

  return (
    faculty?.status?.toString?.().toLowerCase() ||
    faculty?.employmentStatus?.toString?.().toLowerCase() ||
    "active"
  );
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// COMPONENT
// ============================================================

const SingleFaculty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const auth = useAuth();

  const api = auth?.api;
  const token = auth?.token;
  const authLoading = auth?.loading;

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH FACULTY
  // ============================================================

  const fetchFaculty = useCallback(
    async (showRefresh = false) => {
      if (!id) {
        setFaculty(null);
        setLoading(false);
        setRefreshing(false);
        setError("Faculty ID is missing.");
        return;
      }

      if (!api) {
        return;
      }

      if (!token) {
        setFaculty(null);
        setLoading(false);
        setRefreshing(false);
        setError("Authentication token not found. Please login again.");
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        console.log("=================================");
        console.log("FETCHING SINGLE FACULTY");
        console.log("Faculty ID:", id);
        console.log("Token available:", !!token);
        console.log("=================================");

        const response = await api.get(
          `/faculty/get-faculty-by-id/${encodeURIComponent(id)}`,
        );

        console.log("=================================");
        console.log("SINGLE FACULTY RESPONSE");
        console.log("=================================");
        console.log(response?.data);
        console.log("=================================");

        const data = response?.data;

        const facultyData =
          data?.faculty ||
          data?.data?.faculty ||
          data?.data ||
          data?.result ||
          data;

        if (
          !facultyData ||
          typeof facultyData !== "object" ||
          Array.isArray(facultyData)
        ) {
          throw new Error(
            "Faculty details were not returned by the server.",
          );
        }

        setFaculty(facultyData);
        setError("");
      } catch (err) {
        console.error(
          "GET SINGLE FACULTY ERROR:",
          err?.response?.data || err,
        );

        const status = err?.response?.status;

        /*
         * ------------------------------------------------------
         * SESSION EXPIRED
         * ------------------------------------------------------
         *
         * If the backend says 401, send the user back to login.
         * The Login page will show:
         *
         * "Your session has expired. Please login again."
         */
        if (status === 401) {
          setFaculty(null);

          navigate("/login", {
            replace: true,
            state: {
              sessionExpired: true,
            },
          });

          return;
        }

        if (status === 403) {
          setError(
            "You are not authorized to view this faculty member.",
          );
        } else if (status === 404) {
          setError("Faculty record was not found.");
        } else {
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
    [api, id, token, navigate],
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    /*
     * Do absolutely nothing while AuthContext is initializing.
     */
    if (authLoading) {
      return;
    }

    /*
     * If AuthContext has finished initializing but no token
     * exists, do not try the API.
     */
    if (!token) {
      setLoading(false);
      setFaculty(null);
      setError("Authentication token not found. Please login again.");
      return;
    }

    /*
     * Wait until the API instance exists.
     */
    if (!api) {
      return;
    }

    /*
     * Automatically fetch faculty.
     *
     * This is the important part:
     * the page will fetch as soon as auth + api + id
     * are available. No browser reload is required.
     */
    fetchFaculty();
  }, [authLoading, token, api, fetchFaculty]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading || authLoading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-5 sm:px-5 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />

          <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-28 animate-pulse bg-gray-200 sm:h-36" />

            <div className="p-5 sm:p-7">
              <div className="-mt-8 h-24 w-24 animate-pulse rounded-2xl bg-gray-300 sm:-mt-10 sm:h-28 sm:w-28" />

              <div className="mt-5 h-7 w-64 animate-pulse rounded bg-gray-200" />

              <div className="mt-3 h-4 w-40 animate-pulse rounded bg-gray-200" />

              <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !faculty) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gray-50 px-4 py-10">
        <div className="mx-auto mt-10 w-full max-w-lg rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <FaTimesCircle className="mx-auto text-4xl text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Unable to load faculty
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-gray-500">
            {error || "The requested faculty could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <FaArrowLeft />
              Go Back
            </button>

            <button
              type="button"
              onClick={() => fetchFaculty()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-700"
            >
              <FaSyncAlt />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const user = getUser(faculty);

  const image =
    faculty?.profileImage ||
    faculty?.profilePicture ||
    user?.profileImage ||
    user?.avatar ||
    user?.avatarUrl ||
    "";

  const subjects = getSubjects(faculty);
  const classes = getClasses(faculty);

  const facultyId = getFacultyId(faculty);
  const facultyName = getName(faculty);

  // ============================================================
  // ADDRESS DATA
  // ============================================================

  const addressLine1 = getAddressLine1(faculty);
  const addressLine2 = getAddressLine2(faculty);
  const city = getCity(faculty);
  const state = getState(faculty);
  const country = getCountry(faculty);
  const postalCode = getPostalCode(faculty);
  const nationality = getNationality(faculty);
  const preferredCurrency = getPreferredCurrency(faculty);

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

        {/* ====================================================
            TOP ACTIONS
        ==================================================== */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg px-1 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
          >
            <FaArrowLeft />
            <span>Back to All Faculties</span>
          </button>

          <button
            type="button"
            onClick={() => fetchFaculty(true)}
            disabled={refreshing}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <FaSyncAlt
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ====================================================
            PROFILE HEADER
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-20 bg-gray-900 sm:h-24 lg:h-28" />

          <div className="px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8">
            <div className="relative">
              <div className="flex min-w-0 flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:gap-5 sm:pt-5 lg:gap-6">

                {/* IMAGE */}

                <div className="shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt={facultyName}
                      className="h-20 w-20 rounded-2xl border-4 border-white bg-gray-100 object-cover shadow-md sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gray-700 text-2xl font-bold text-white shadow-md sm:h-24 sm:w-24 sm:text-3xl lg:h-28 lg:w-28 lg:text-4xl">
                      {facultyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* FACULTY INFORMATION */}

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h1 className="min-w-0 break-words text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                      {facultyName}
                    </h1>

                    <StatusBadge status={getStatus(faculty)} />
                  </div>

                  <p className="mt-1 break-words text-sm font-semibold text-gray-600 sm:text-base">
                    {getDesignation(faculty)}
                  </p>

                  <p className="mt-1 break-words text-xs text-gray-400 sm:text-sm">
                    {getDepartment(faculty)}
                  </p>
                </div>

                {/* EDIT */}

                {facultyId && (
                  <div className="w-full shrink-0 sm:w-auto">
                    <Link
                      to={`/update-faculty/${facultyId}`}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700 sm:w-auto"
                    >
                      <FaEdit />
                      Edit Faculty
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

        {/* ====================================================
            PERSONAL INFORMATION
        ==================================================== */}

        <Section title="Personal Information">
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              icon={<FaUserTie />}
              label="Full Name"
              value={facultyName}
            />

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
              value={getEmail(faculty) || "—"}
            />

            <DetailItem
              icon={<FaPhone />}
              label="Phone"
              value={getPhone(faculty) || "—"}
            />

            <DetailItem
              icon={<FaCalendarAlt />}
              label="Date of Birth"
              value={formatDate(faculty?.dateOfBirth)}
            />

            <DetailItem
              icon={<FaUserTie />}
              label="Gender"
              value={faculty?.gender || user?.gender || "—"}
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

        {/* ====================================================
            CONTACT & ADDRESS
        ==================================================== */}

        <Section title="Contact & Address">
          <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
            <DetailItem
              icon={<FaEnvelope />}
              label="Email"
              value={getEmail(faculty) || "—"}
            />

            <DetailItem
              icon={<FaPhone />}
              label="Phone"
              value={getPhone(faculty) || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Address"
              value={addressLine1 || "—"}
            />

            <DetailItem
              icon={<FaBuilding />}
              label="Address Line 2"
              value={addressLine2 || "—"}
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
              value={preferredCurrency || "—"}
            />
          </div>
        </Section>

        {/* ====================================================
            SUBJECTS
        ==================================================== */}

        <Section title={`Subjects (${subjects.length})`}>
          {subjects.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject, index) => {
                const subjectName =
                  typeof subject === "string"
                    ? subject
                    : subject?.name ||
                      subject?.subjectName ||
                      subject?.title ||
                      subject?.code ||
                      `Subject ${index + 1}`;

                return (
                  <div
                    key={subject?._id || subject?.id || index}
                    className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="shrink-0 rounded-xl bg-white p-3 text-gray-700 shadow-sm">
                        <FaGraduationCap />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-bold text-gray-900">
                          {subjectName}
                        </p>

                        {typeof subject === "object" &&
                          subject?.code && (
                            <p className="mt-1 break-words text-xs text-gray-500">
                              {subject.code}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptySection text="No subjects assigned." />
          )}
        </Section>

        {/* ====================================================
            CLASSES
        ==================================================== */}

        <Section title={`Classes (${classes.length})`}>
          {classes.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((classItem, index) => {
                const className =
                  typeof classItem === "string"
                    ? classItem
                    : classItem?.name ||
                      classItem?.className ||
                      classItem?.section ||
                      classItem?.title ||
                      `Class ${index + 1}`;

                return (
                  <div
                    key={classItem?._id || classItem?.id || index}
                    className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="shrink-0 rounded-xl bg-white p-3 text-gray-700 shadow-sm">
                        <FaChalkboardTeacher />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-bold text-gray-900">
                          {className}
                        </p>

                        {typeof classItem === "object" &&
                          classItem?.section &&
                          classItem?.name && (
                            <p className="mt-1 break-words text-xs text-gray-500">
                              Section: {classItem.section}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptySection text="No classes assigned." />
          )}
        </Section>

        {/* ====================================================
            FACULTY MANAGEMENT
        ==================================================== */}

        <Section title="Faculty Management">
          <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
            <ManagementCard
              icon={<FaClock />}
              title="Timetable"
              description="View complete faculty timetable."
              disabled
            />

            <ManagementCard
              icon={<FaCheckCircle />}
              title="Attendance"
              description="View faculty attendance records."
              disabled
            />

            <ManagementCard
              icon={<FaChalkboardTeacher />}
              title="Class Management"
              description="Manage assigned classes."
              disabled
            />
          </div>
        </Section>
      </main>
    </div>
  );
};

// ============================================================
// SECTION
// ============================================================

const Section = ({ title, children }) => {
  return (
    <section className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 break-words text-lg font-bold text-gray-900 sm:text-xl">
        {title}
      </h2>

      {children}
    </section>
  );
};

// ============================================================
// DETAIL
// ============================================================

const DetailItem = ({ icon, label, value }) => {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-gray-50 p-4">
      <div className="flex min-w-0 items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold leading-6 text-gray-800">
        {value}
      </p>
    </div>
  );
};

// ============================================================
// SUMMARY
// ============================================================

const SummaryCard = ({ icon, title, value }) => {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 rounded-xl bg-gray-100 p-2.5 text-gray-700 sm:p-3">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-gray-400 sm:text-xs">
            {title}
          </p>

          <p className="mt-1 break-words text-base font-bold leading-5 text-gray-900 sm:text-lg">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STATUS
// ============================================================

const StatusBadge = ({ status }) => {
  const active = status === "active";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize sm:px-3 sm:text-xs ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {active ? <FaCheckCircle /> : <FaTimesCircle />}
      {status}
    </span>
  );
};

// ============================================================
// MANAGEMENT CARD
// ============================================================

const ManagementCard = ({
  icon,
  title,
  description,
  disabled,
}) => {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-gray-200 p-4 sm:p-5 ${
        disabled ? "bg-gray-50 opacity-70" : "bg-white"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <div className="shrink-0 rounded-xl bg-white p-3 text-gray-700 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="break-words font-bold text-gray-900">
            {title}
          </h3>

          <p className="mt-1 break-words text-sm leading-6 text-gray-500">
            {description}
          </p>

          {disabled && (
            <span className="mt-2 inline-block text-xs font-bold text-gray-400">
              Coming soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EMPTY
// ============================================================

const EmptySection = ({ text }) => {
  return (
    <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500 sm:p-8">
      {text}
    </div>
  );
};

export default SingleFaculty;
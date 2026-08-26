import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaSave,
  FaSyncAlt,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaIdBadge,
  FaBuilding,
  FaGraduationCap,
  FaCalendarAlt,
  FaVenusMars,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// HELPERS
// ============================================================

const getUser = (faculty) => {
  if (faculty?.userId && typeof faculty.userId === "object") {
    return faculty.userId;
  }

  if (faculty?.user && typeof faculty.user === "object") {
    return faculty.user;
  }

  return {};
};

const getValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
};

const getDateOnly = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  return stringValue.substring(0, 10);
};

// ============================================================
// EMPLOYMENT TYPE NORMALIZER
//
// IMPORTANT:
// These returned values MUST exactly match FacultyModel.js
//
// FacultyModel enum:
//
// ["", "Permanent", "Contract", "Guest", "Visiting", "Part Time"]
// ============================================================

const normalizeEmploymentType = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

  const mapping = {
    "full time": "Permanent",
    "full-time": "Permanent",
    permanent: "Permanent",
    contract: "Contract",
    "part time": "Part Time",
    "part-time": "Part Time",
    visiting: "Visiting",
    guest: "Guest",
  };

  return mapping[normalized] || "";
};

// ============================================================
// STATUS NORMALIZER
// ============================================================

const normalizeStatus = (faculty) => {
  if (
    faculty?.status !== undefined &&
    faculty?.status !== null &&
    faculty?.status !== ""
  ) {
    const status = String(faculty.status).trim().toLowerCase();

    if (["active", "inactive", "on_leave", "retired"].includes(status)) {
      return status;
    }
  }

  if (faculty?.isActive !== undefined && faculty?.isActive !== null) {
    return faculty.isActive ? "active" : "inactive";
  }

  return "active";
};

// ============================================================
// DEPARTMENT NORMALIZER
// ============================================================

const normalizeDepartment = (department) => {
  if (!department) {
    return "";
  }

  if (typeof department === "string") {
    return department;
  }

  if (typeof department === "object") {
    return department._id || department.id || department.name || "";
  }

  return "";
};

// ============================================================
// INITIAL FORM
// ============================================================

const getInitialForm = (faculty) => {
  const user = getUser(faculty);

  const fullName =
    faculty?.fullName || faculty?.name || user?.fullName || user?.name || "";

  return {
    // ========================================================
    // USER INFORMATION
    // ========================================================

    fullName: getValue(fullName),

    email: getValue(faculty?.email || user?.email),

    phone: getValue(faculty?.phone || user?.phone),

    dateOfBirth: getDateOnly(faculty?.dateOfBirth || user?.dateOfBirth),

    gender: getValue(faculty?.gender || user?.gender),

    // ========================================================
    // FACULTY INFORMATION
    // ========================================================

    employeeId: getValue(faculty?.employeeId),

    designation: getValue(faculty?.designation),

    department: normalizeDepartment(faculty?.department),

    qualification: getValue(faculty?.qualification),

    specialization: getValue(faculty?.specialization),

    experience:
      faculty?.experience === null || faculty?.experience === undefined
        ? ""
        : faculty.experience,

    // IMPORTANT:
    // This now converts database values into the EXACT
    // values used by the select and FacultyModel enum.
    employmentType: normalizeEmploymentType(faculty?.employmentType),

    joiningDate: getDateOnly(faculty?.joiningDate),

    status: normalizeStatus(faculty),

    // ========================================================
    // ADDRESS
    // ========================================================

    addressLine1: getValue(faculty?.addressLine1 || user?.addressLine1),

    addressLine2: getValue(faculty?.addressLine2 || user?.addressLine2),

    city: getValue(faculty?.city || user?.city),

    state: getValue(faculty?.state || user?.state),

    country: getValue(faculty?.country || user?.country),

    postalCode: getValue(
      faculty?.postalCode || faculty?.pincode || user?.postalCode,
    ),

    nationality: getValue(faculty?.nationality || user?.nationality),

    preferredCurrency: getValue(
      faculty?.preferredCurrency || user?.preferredCurrency || "INR",
    ),
  };
};

// ============================================================
// COMPONENT
// ============================================================

const UpdateFaculty = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { api, token, loading: authLoading } = useAuth();

  const [faculty, setFaculty] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",

    employeeId: "",
    designation: "",
    department: "",
    qualification: "",
    specialization: "",
    experience: "",

    employmentType: "",

    joiningDate: "",
    status: "active",

    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    nationality: "",
    preferredCurrency: "INR",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ============================================================
  // FETCH FACULTY
  // ============================================================

  const fetchFaculty = useCallback(
    async (showRefresh = false) => {
      if (!id) {
        setError("Faculty ID is missing.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      try {
        console.log("================================");
        console.log("FETCH FACULTY");
        console.log("Faculty ID:", id);
        console.log("Token available:", !!token);
        console.log("================================");

        const response = await api.get(`/faculty/get-faculty-by-id/${id}`);

        console.log("Faculty GET response:", response?.data);

        const responseData = response?.data;

        const facultyData =
          responseData?.data ||
          responseData?.faculty ||
          responseData?.result ||
          responseData;

        if (
          !facultyData ||
          typeof facultyData !== "object" ||
          Array.isArray(facultyData)
        ) {
          throw new Error("Faculty details were not returned by the server.");
        }

        setFaculty(facultyData);

        setForm(getInitialForm(facultyData));
      } catch (err) {
        console.error("GET FACULTY ERROR:", err?.response?.data || err);

        const status = err?.response?.status;

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message;

        if (status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (status === 403) {
          setError("You are not authorized to view this faculty.");
        } else if (status === 404) {
          setError("Faculty record was not found.");
        } else {
          setError(message || "Unable to load faculty information.");
        }

        setFaculty(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api, id, token],
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      setLoading(false);

      setError("Authentication token not found. Please login again.");

      return;
    }

    fetchFaculty();
  }, [authLoading, token, fetchFaculty]);

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {
    if (!form.fullName.trim()) {
      return "Full name is required.";
    }

    if (!form.email.trim()) {
      return "Email is required.";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!form.employeeId.trim()) {
      return "Employee ID is required.";
    }

    if (!form.designation.trim()) {
      return "Designation is required.";
    }

    if (!form.department.trim()) {
      return "Department is required.";
    }

    if (
      form.experience !== "" &&
      (Number.isNaN(Number(form.experience)) || Number(form.experience) < 0)
    ) {
      return "Experience must be a valid number greater than or equal to 0.";
    }

    // =====================================================
    // EMPLOYMENT TYPE
    // =====================================================

    const allowedEmploymentTypes = [
      "",
      "Permanent",
      "Contract",
      "Guest",
      "Visiting",
      "Part Time",
    ];

    if (!allowedEmploymentTypes.includes(form.employmentType)) {
      return `Invalid employment type: "${form.employmentType}". Allowed values are Permanent, Contract, Guest, Visiting, Part Time.`;
    }

    // =====================================================
    // STATUS
    // =====================================================

    const allowedStatuses = ["active", "inactive", "on_leave", "retired"];

    if (!allowedStatuses.includes(form.status)) {
      return "Invalid faculty status.";
    }

    return null;
  };

  // ============================================================
  // UPDATE FACULTY
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Authentication token is missing. Please login again.");
      return;
    }

    if (!id) {
      setError("Faculty ID is missing.");
      return;
    }

    try {
      setSaving(true);

      // ======================================================
      // NORMALIZE EMPLOYMENT TYPE
      //
      // THIS IS THE IMPORTANT FIX
      // ======================================================

      const employmentType = normalizeEmploymentType(form.employmentType);

      const allowedEmploymentTypes = [
        "",
        "Permanent",
        "Contract",
        "Guest",
        "Visiting",
        "Part Time",
      ];

      if (!allowedEmploymentTypes.includes(employmentType)) {
        setError(
          `Invalid employment type: "${form.employmentType}". Allowed values are Permanent, Contract, Guest, Visiting, Part Time.`,
        );
        return;
      }

      // ======================================================
      // BUILD PAYLOAD
      // ======================================================

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),

        dateOfBirth:
          form.dateOfBirth && form.dateOfBirth.trim() ? form.dateOfBirth : null,

        gender: form.gender.trim(),

        employeeId: form.employeeId.trim(),
        designation: form.designation.trim(),
        department: form.department.trim(),
        qualification: form.qualification.trim(),
        specialization: form.specialization.trim(),

        experience: form.experience === "" ? 0 : Number(form.experience),

        employmentType: employmentType,

        joiningDate:
          form.joiningDate && form.joiningDate.trim() ? form.joiningDate : null,

        status: form.status,

        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        postalCode: form.postalCode.trim(),
        nationality: form.nationality.trim(),
        preferredCurrency: form.preferredCurrency.trim() || "INR",
      };

      // ======================================================
      // DEBUG
      // ======================================================

      console.log("=================================");
      console.log("UPDATING FACULTY");
      console.log("=================================");

      console.log("Faculty ID:", id);

      console.log("Payload:", payload);

      console.log("Employment Type from form:", form.employmentType);

      console.log("Employment Type sent to backend:", employmentType);

      console.log("Status:", form.status);

      console.log("Token available:", Boolean(token));

      console.log("=================================");

      // ======================================================
      // API REQUEST
      // ======================================================

      const response = await api.put(`/faculty/update-faculty/${id}`, payload);

      console.log("=================================");
      console.log("UPDATE SUCCESS");
      console.log("Response:", response?.data);
      console.log("=================================");

      const responseData = response?.data || {};

      const updatedFaculty = responseData.faculty || responseData.data || null;

      setSuccess(responseData.message || "Faculty updated successfully.");

      // ======================================================
      // UPDATE LOCAL STATE
      // ======================================================

      if (updatedFaculty && typeof updatedFaculty === "object") {
        setFaculty(updatedFaculty);

        setForm(getInitialForm(updatedFaculty));
      }

      // ======================================================
      // FETCH FRESH DATA
      // ======================================================

      try {
        const refreshedResponse = await api.get(
          `/faculty/get-faculty-by-id/${id}`,
        );

        const refreshedResponseData = refreshedResponse?.data || {};

        const refreshedFaculty =
          refreshedResponseData.data ||
          refreshedResponseData.faculty ||
          refreshedResponseData.result ||
          null;

        if (
          refreshedFaculty &&
          typeof refreshedFaculty === "object" &&
          !Array.isArray(refreshedFaculty)
        ) {
          setFaculty(refreshedFaculty);

          setForm(getInitialForm(refreshedFaculty));
        }
      } catch (refreshError) {
        console.warn(
          "Faculty updated but refresh failed:",
          refreshError?.response?.data || refreshError?.message || refreshError,
        );
      }

      // ======================================================
      // NAVIGATE
      // ======================================================

      setTimeout(() => {
        navigate(`/faculty/${id}`);
      }, 1200);
    } catch (err) {
      console.error("=================================");
      console.error("UPDATE FACULTY ERROR");
      console.error("=================================");

      console.error("HTTP STATUS:", err?.response?.status);

      console.error("SERVER RESPONSE:", err?.response?.data);

      console.error("ERROR MESSAGE:", err?.message);

      console.error("FULL ERROR:", err);

      console.error("=================================");

      const status = err?.response?.status;

      const serverData = err?.response?.data || {};

      const serverMessage =
        serverData.message || serverData.error || err?.message;

      // ======================================================
      // ERROR HANDLING
      // ======================================================

      if (status === 400) {
        if (serverData.errors && typeof serverData.errors === "object") {
          const validationMessages = Object.entries(serverData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join("\n");

          setError(
            validationMessages ||
              serverMessage ||
              "Invalid faculty information.",
          );
        } else {
          setError(serverMessage || "Invalid faculty information.");
        }
      } else if (status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (status === 403) {
        setError("You are not authorized to update this faculty.");
      } else if (status === 404) {
        setError(serverMessage || "Faculty record was not found.");
      } else if (status === 409) {
        setError(
          serverMessage ||
            "A faculty member with this email or employee ID already exists.",
        );
      } else if (status === 500) {
        setError(
          serverMessage ||
            "Server error while updating faculty. Check the backend console for the exact error.",
        );
      } else {
        setError(serverMessage || "Failed to update faculty.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-5 sm:px-5 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-24 animate-pulse bg-gray-200 sm:h-32" />

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({
                  length: 12,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR WITHOUT FACULTY
  // ============================================================

  if (error && !faculty) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto mt-10 w-full max-w-lg rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <FaTimesCircle className="mx-auto text-4xl text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Unable to load faculty
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-gray-500">
            {error}
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
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
        {/* TOP ACTIONS */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg px-1 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
          >
            <FaArrowLeft />
            <span>Back to Faculty</span>
          </button>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => fetchFaculty(true)}
              disabled={refreshing || saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />

              {refreshing ? "Refreshing..." : "Reset"}
            </button>

            <button
              type="submit"
              form="updateFacultyForm"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* HEADER */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-24 bg-gray-900 sm:h-28 lg:h-32" />

          <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-700">
                    <FaUserTie />
                  </div>

                  <div className="min-w-0">
                    <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                      Update Faculty
                    </h1>

                    <p className="mt-1 break-words text-sm text-gray-500">
                      Update faculty profile and employment information.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to={`/faculty/${id}`}
                className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                <FaUserTie />
                View Profile
              </Link>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-5 flex min-w-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FaTimesCircle className="mt-0.5 shrink-0" />

            <p className="min-w-0 break-words whitespace-pre-line font-medium">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mt-5 flex min-w-0 items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <FaCheckCircle className="mt-0.5 shrink-0" />

            <p className="min-w-0 break-words font-medium">{success}</p>
          </div>
        )}

        {/* FORM */}

        <form
          id="updateFacultyForm"
          onSubmit={handleSubmit}
          className="mt-5 space-y-5"
        >
          {/* PERSONAL INFORMATION */}

          <Section title="Personal Information">
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InputField
                icon={<FaUserTie />}
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              <InputField
                icon={<FaEnvelope />}
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />

              <InputField
                icon={<FaPhone />}
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              <SelectField
                icon={<FaVenusMars />}
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                options={[
                  {
                    value: "",
                    label: "Select Gender",
                  },
                  {
                    value: "Male",
                    label: "Male",
                  },
                  {
                    value: "Female",
                    label: "Female",
                  },
                  {
                    value: "Other",
                    label: "Other",
                  },
                ]}
              />

              <InputField
                icon={<FaCalendarAlt />}
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* EMPLOYMENT */}

          <Section title="Employment Information">
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InputField
                icon={<FaIdBadge />}
                label="Employee ID"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="Enter employee ID"
                required
              />

              <InputField
                icon={<FaGraduationCap />}
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Assistant Professor"
                required
              />

              <InputField
                icon={<FaBuilding />}
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                required
              />

              <InputField
                icon={<FaGraduationCap />}
                label="Qualification"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. M.Tech, Ph.D"
              />

              <InputField
                icon={<FaGraduationCap />}
                label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g. AI & ML"
              />

              <InputField
                icon={<FaBriefcase />}
                label="Experience"
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="Years of experience"
              />

              {/* ==================================================
                  EMPLOYMENT TYPE

                  VALUES EXACTLY MATCH FacultyModel.js
                  ================================================== */}

              <SelectField
                icon={<FaBriefcase />}
                label="Employment Type"
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                options={[
                  {
                    value: "",
                    label: "Select Employment Type",
                  },
                  {
                    value: "Permanent",
                    label: "Permanent",
                  },
                  {
                    value: "Part Time",
                    label: "Part Time",
                  },
                  {
                    value: "Contract",
                    label: "Contract",
                  },
                  {
                    value: "Visiting",
                    label: "Visiting",
                  },
                  {
                    value: "Guest",
                    label: "Guest",
                  },
                ]}
              />

              <InputField
                icon={<FaCalendarAlt />}
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
              />

              <SelectField
                icon={<FaCheckCircle />}
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={[
                  {
                    value: "active",
                    label: "Active",
                  },
                  {
                    value: "inactive",
                    label: "Inactive",
                  },
                  {
                    value: "on_leave",
                    label: "On Leave",
                  },
                  {
                    value: "retired",
                    label: "Retired",
                  },
                ]}
              />
            </div>
          </Section>

          {/* ADDRESS */}

          <Section title="Contact & Address">
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                icon={<FaMapMarkerAlt />}
                label="Address Line 1"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="Enter address"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Address Line 2"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Enter address line 2"
              />

              <InputField
                icon={<FaBuilding />}
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
              />

              <InputField
                icon={<FaBuilding />}
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
              />

              <InputField
                icon={<FaBuilding />}
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Enter country"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Postal Code"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Nationality"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                placeholder="Enter nationality"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Preferred Currency"
                name="preferredCurrency"
                value={form.preferredCurrency}
                onChange={handleChange}
                placeholder="e.g. INR"
              />
            </div>
          </Section>

          {/* BOTTOM ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaArrowLeft />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave />

              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

// ============================================================
// SECTION COMPONENT
// ============================================================

const Section = ({ title, children }) => {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-5 break-words text-lg font-bold text-gray-900 sm:text-xl">
        {title}
      </h2>

      {children}
    </section>
  );
};

// ============================================================
// INPUT COMPONENT
// ============================================================

const InputField = ({
  icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500"
      >
        <span className="shrink-0 text-gray-400">{icon}</span>

        <span className="truncate">{label}</span>

        {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.1" : undefined}
        className="min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
};

// ============================================================
// SELECT COMPONENT
// ============================================================

const SelectField = ({ icon, label, name, value, onChange, options }) => {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500"
      >
        <span className="shrink-0 text-gray-400">{icon}</span>

        <span className="truncate">{label}</span>
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UpdateFaculty;

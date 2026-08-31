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
  FaBook,
  FaChalkboardTeacher,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const getUser = (faculty) => {
  if (
    faculty?.userId &&
    typeof faculty.userId === "object" &&
    !Array.isArray(faculty.userId)
  ) {
    return faculty.userId;
  }

  if (
    faculty?.user &&
    typeof faculty.user === "object" &&
    !Array.isArray(faculty.user)
  ) {
    return faculty.user;
  }

  return {};
};

const getString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const getDateOnly = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (stringValue.length >= 10) {
    return stringValue.substring(0, 10);
  }

  return "";
};

const getDepartmentValue = (department) => {
  if (!department) {
    return "";
  }

  if (typeof department === "string") {
    return department;
  }

  if (typeof department === "object") {
    return getString(
      department._id ||
        department.id ||
        department.name ||
        department.departmentName,
    );
  }

  return "";
};

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

  const user = getUser(faculty);

  if (user?.isActive !== undefined) {
    return user.isActive ? "active" : "inactive";
  }

  return "active";
};

const normalizeEmploymentType = (value) => {
  if (!value) {
    return "";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/-/g, " ");

  const values = {
    permanent: "Permanent",
    "full time": "Permanent",
    contract: "Contract",
    guest: "Guest",
    visiting: "Visiting",
    "part time": "Part Time",
  };

  return values[normalized] || "";
};

const getInitialForm = (faculty) => {
  const user = getUser(faculty);

  return {
    fullName: getString(
      faculty?.fullName ||
        faculty?.name ||
        user?.fullName ||
        user?.name ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    ),

    email: getString(faculty?.email || user?.email),

    phone: getString(faculty?.phone || user?.phone),

    dateOfBirth: getDateOnly(faculty?.dateOfBirth || user?.dateOfBirth),

    gender: getString(faculty?.gender || user?.gender),

    employeeId: getString(faculty?.employeeId),

    designation: getString(faculty?.designation),

    department: getDepartmentValue(faculty?.department),

    qualification: getString(faculty?.qualification),

    specialization: getString(faculty?.specialization),

    experience:
      faculty?.experience === null || faculty?.experience === undefined
        ? ""
        : getString(faculty.experience),

    employmentType: normalizeEmploymentType(faculty?.employmentType),

    joiningDate: getDateOnly(faculty?.joiningDate),

    status: normalizeStatus(faculty),

    addressLine1: getString(faculty?.addressLine1 || user?.addressLine1),

    addressLine2: getString(faculty?.addressLine2 || user?.addressLine2),

    city: getString(faculty?.city || user?.city),

    state: getString(faculty?.state || user?.state),

    country: getString(faculty?.country || user?.country),

    postalCode: getString(
      faculty?.postalCode || faculty?.pincode || user?.postalCode,
    ),

    nationality: getString(faculty?.nationality || user?.nationality),

    preferredCurrency: getString(
      faculty?.preferredCurrency || user?.preferredCurrency || "INR",
    ),
  };
};

const normalizeSubjects = (subjects) => {
  if (!Array.isArray(subjects)) {
    return [];
  }

  return subjects
    .map((subject) => ({
      subjectCode: getString(subject?.subjectCode).trim(),
      subjectName: getString(subject?.subjectName).trim(),
    }))
    .filter((subject) => subject.subjectCode || subject.subjectName);
};

const normalizeClasses = (classes) => {
  if (!Array.isArray(classes)) {
    return [];
  }

  return classes
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return getString(
        item?.name || item?.className || item?.section || item?.title,
      ).trim();
    })
    .filter(Boolean);
};

/* =========================================================
   COMPONENT
========================================================= */

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

  const [subjects, setSubjects] = useState([]);

  const [classes, setClasses] = useState([]);

  const [newSubject, setNewSubject] = useState({
    subjectCode: "",
    subjectName: "",
  });

  const [newClass, setNewClass] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD FACULTY
  ========================================================= */

  const loadFaculty = useCallback(
    async (showRefresh = false) => {
      /*
       IMPORTANT:

       Do NOT treat missing api/token while AuthContext is
       bootstrapping as an error.

       AuthContext may still be restoring the login session.
      */

      if (!id) {
        setError("Faculty ID is missing.");
        setLoading(false);
        return;
      }

      if (authLoading) {
        return;
      }

      if (!api) {
        return;
      }

      if (!token) {
        /*
         Do not immediately show "login again".

         The AuthContext may still be finishing its token
         restoration. Keep the page in loading state.
        */
        setLoading(true);
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
        const response = await api.get(
          `/faculty/get-faculty-by-id/${encodeURIComponent(id)}`,
        );

        const responseData = response?.data;

        const facultyData =
          responseData?.faculty ||
          responseData?.data ||
          responseData?.result ||
          responseData;

        if (
          !facultyData ||
          typeof facultyData !== "object" ||
          Array.isArray(facultyData)
        ) {
          throw new Error("Faculty details were not returned by the server.");
        }

        /*
         IMPORTANT:

         Update all state together after the API response
         succeeds.
        */

        setFaculty(facultyData);

        setForm(getInitialForm(facultyData));

        setSubjects(normalizeSubjects(facultyData.subjects));

        setClasses(normalizeClasses(facultyData.classes));
      } catch (err) {
        const status = err?.response?.status;

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load faculty information.";

        if (status === 401) {
          setError(
            "Authentication failed. Your login session may have expired. Please login again.",
          );
        } else if (status === 403) {
          setError("You are not authorized to view this faculty.");
        } else if (status === 404) {
          setError("Faculty record was not found.");
        } else {
          setError(message);
        }

        setFaculty(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api, authLoading, id, token],
  );

  /* =========================================================
     IMPORTANT AUTH + FACULTY LOADING EFFECT
  ========================================================= */

  useEffect(() => {
    /*
     Wait until AuthContext has completed its bootstrap.
    */

    if (authLoading) {
      return;
    }

    /*
     Wait for API instance.
    */

    if (!api) {
      return;
    }

    /*
     Wait for token.

     This is the important part that prevents the page from
     permanently stopping before the authentication state is
     ready.
    */

    if (!token) {
      setLoading(true);
      return;
    }

    /*
     Once all three are available, load the faculty.
    */

    loadFaculty();
  }, [authLoading, api, token, loadFaculty]);

  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!form.fullName.trim()) {
      return "Full name is required.";
    }

    if (form.fullName.trim().length < 3) {
      return "Full name must be at least 3 characters.";
    }

    if (!form.email.trim()) {
      return "Email is required.";
    }

    /*
     Fixed email regex.
    */

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
      (!Number.isFinite(Number(form.experience)) || Number(form.experience) < 0)
    ) {
      return "Experience must be a valid number greater than or equal to 0.";
    }

    const allowedEmploymentTypes = [
      "",
      "Permanent",
      "Contract",
      "Guest",
      "Visiting",
      "Part Time",
    ];

    if (!allowedEmploymentTypes.includes(form.employmentType)) {
      return "Invalid employment type.";
    }

    const allowedStatuses = ["active", "inactive", "on_leave", "retired"];

    if (!allowedStatuses.includes(form.status)) {
      return "Invalid faculty status.";
    }

    for (const subject of subjects) {
      if (!subject.subjectCode.trim() || !subject.subjectName.trim()) {
        return "Every subject must have both subject code and subject name.";
      }
    }

    const subjectCodes = new Set();

    for (const subject of subjects) {
      const code = subject.subjectCode.trim().toLowerCase();

      if (subjectCodes.has(code)) {
        return `Duplicate subject code "${subject.subjectCode}" found.`;
      }

      subjectCodes.add(code);
    }

    const classNames = new Set();

    for (const className of classes) {
      const key = className.trim().toLowerCase();

      if (classNames.has(key)) {
        return `Duplicate class "${className}" found.`;
      }

      classNames.add(key);
    }

    return null;
  };

  /* =========================================================
     SUBJECT FUNCTIONS
  ========================================================= */

  const addSubject = () => {
    const subjectCode = newSubject.subjectCode.trim();

    const subjectName = newSubject.subjectName.trim();

    if (!subjectCode || !subjectName) {
      setError("Enter both subject code and subject name.");
      return;
    }

    const duplicate = subjects.some(
      (subject) =>
        subject.subjectCode.toLowerCase() === subjectCode.toLowerCase(),
    );

    if (duplicate) {
      setError(`Subject code "${subjectCode}" already exists.`);
      return;
    }

    setSubjects((previous) => [
      ...previous,
      {
        subjectCode,
        subjectName,
      },
    ]);

    setNewSubject({
      subjectCode: "",
      subjectName: "",
    });

    setError("");
    setSuccess("");
  };

  const removeSubject = (index) => {
    setSubjects((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );

    setError("");
    setSuccess("");
  };

  /* =========================================================
     CLASS FUNCTIONS
  ========================================================= */

  const addClass = () => {
    const className = newClass.trim();

    if (!className) {
      setError("Enter a class name.");
      return;
    }

    const duplicate = classes.some(
      (item) => item.toLowerCase() === className.toLowerCase(),
    );

    if (duplicate) {
      setError(`Class "${className}" already exists.`);
      return;
    }

    setClasses((previous) => [...previous, className]);

    setNewClass("");

    setError("");
    setSuccess("");
  };

  const removeClass = (index) => {
    setClasses((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );

    setError("");
    setSuccess("");
  };

  /* =========================================================
     SAVE FACULTY
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!api) {
      setError("Faculty API is not available.");
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

    setSaving(true);

    try {
      const payload = {
        fullName: form.fullName.trim(),

        email: form.email.trim().toLowerCase(),

        phone: form.phone.trim(),

        dateOfBirth: form.dateOfBirth || null,

        gender: form.gender.trim(),

        addressLine1: form.addressLine1.trim(),

        addressLine2: form.addressLine2.trim(),

        city: form.city.trim(),

        state: form.state.trim(),

        country: form.country.trim(),

        postalCode: form.postalCode.trim(),

        nationality: form.nationality.trim(),

        preferredCurrency: form.preferredCurrency.trim().toUpperCase() || "INR",

        employeeId: form.employeeId.trim(),

        designation: form.designation.trim(),

        department: form.department.trim(),

        qualification: form.qualification.trim(),

        specialization: form.specialization.trim(),

        experience: form.experience === "" ? 0 : Number(form.experience),

        employmentType: form.employmentType,

        joiningDate: form.joiningDate || null,

        status: form.status,

        subjects: subjects.map((subject) => ({
          subjectCode: subject.subjectCode.trim(),

          subjectName: subject.subjectName.trim(),
        })),

        classes: classes.map((className) => className.trim()),
      };

      const response = await api.put(
        `/faculty/update-faculty/${encodeURIComponent(id)}`,
        payload,
      );

      const responseData = response?.data;

      const updatedFaculty =
        responseData?.faculty || responseData?.data || responseData?.result;

      if (
        !updatedFaculty ||
        typeof updatedFaculty !== "object" ||
        Array.isArray(updatedFaculty)
      ) {
        throw new Error(
          "The server did not return the updated faculty record.",
        );
      }

      /*
       Update local page state immediately.
      */

      setFaculty(updatedFaculty);

      setForm(getInitialForm(updatedFaculty));

      setSubjects(normalizeSubjects(updatedFaculty.subjects));

      setClasses(normalizeClasses(updatedFaculty.classes));

      setSuccess(
        responseData?.message ||
          "Faculty and user details updated successfully.",
      );

      /*
       IMPORTANT:

       Your old code used "facultyId", which does not exist.

       Use the actual route parameter / updated ID.
      */

      const updatedFacultyId = updatedFaculty?._id || id;

      navigate(`/faculty/${updatedFacultyId}`, {
        replace: true,

        state: {
          facultyUpdated: true,

          updatedFaculty,

          updatedFacultyId,

          updateTimestamp: Date.now(),
        },
      });
    } catch (err) {
      const status = err?.response?.status;

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (status === 401) {
        setError(
          "Authentication failed. Your login session may have expired. Please login again.",
        );
      } else if (status === 403) {
        setError("You are not authorized to update this faculty.");
      } else if (status === 404) {
        setError("Faculty record was not found.");
      } else if (status === 409) {
        setError(
          serverMessage || "A duplicate faculty or user value already exists.",
        );
      } else if (status === 400) {
        setError(
          serverMessage ||
            "Invalid faculty information. Please check the entered values.",
        );
      } else {
        setError(serverMessage || "Failed to update faculty and user.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    if (!faculty || saving) {
      return;
    }

    setForm(getInitialForm(faculty));

    setSubjects(normalizeSubjects(faculty.subjects));

    setClasses(normalizeClasses(faculty.classes));

    setNewSubject({
      subjectCode: "",
      subjectName: "",
    });

    setNewClass("");

    setError("");
    setSuccess("");
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-28 animate-pulse bg-gray-200" />

            <div className="p-6">
              <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({
                  length: 15,
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

  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (error && !faculty) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto mt-10 w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <FaTimesCircle className="mx-auto text-4xl text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Unable to load faculty
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              id="goBackButton"
              name="goBackButton"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <FaArrowLeft />
              Go Back
            </button>

            <button
              type="button"
              id="retryFacultyButton"
              name="retryFacultyButton"
              onClick={() => loadFaculty()}
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

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
        {/* TOP ACTIONS */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            id="backToFacultyButton"
            name="backToFacultyButton"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg px-1 text-sm font-semibold text-gray-600 transition hover:text-gray-900 disabled:opacity-50"
          >
            <FaArrowLeft />
            <span>Back to Faculty</span>
          </button>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              id="resetFacultyButton"
              name="resetFacultyButton"
              onClick={handleReset}
              disabled={saving || refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Reset
            </button>

            <button
              type="submit"
              id="topSaveFacultyButton"
              name="topSaveFacultyButton"
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
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-700">
                  <FaUserTie />
                </div>

                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                    Update Faculty
                  </h1>

                  <p className="mt-1 break-words text-sm text-gray-500">
                    Update faculty profile, employment, subjects and assigned
                    classes.
                  </p>
                </div>
              </div>

              <Link
                to={`/faculty/${id}`}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                <FaUserTie />
                View Profile
              </Link>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FaTimesCircle className="mt-0.5 shrink-0" />

            <p className="break-words font-medium">{error}</p>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <FaCheckCircle className="mt-0.5 shrink-0" />

            <p className="break-words font-medium">{success}</p>
          </div>
        )}

        {/* FORM */}

        <form
          id="updateFacultyForm"
          name="updateFacultyForm"
          onSubmit={handleSubmit}
          className="mt-5 space-y-5"
        >
          {/* PERSONAL INFORMATION */}

          <Section title="Personal Information">
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InputField
                icon={<FaUserTie />}
                label="Full Name"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              <InputField
                icon={<FaEnvelope />}
                label="Email"
                id="email"
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
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              <SelectField
                icon={<FaVenusMars />}
                label="Gender"
                id="gender"
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
                id="dateOfBirth"
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
                id="employeeId"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="Enter employee ID"
                required
              />

              <InputField
                icon={<FaGraduationCap />}
                label="Designation"
                id="designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Assistant Professor"
                required
              />

              <InputField
                icon={<FaBuilding />}
                label="Department"
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                required
              />

              <InputField
                icon={<FaGraduationCap />}
                label="Qualification"
                id="qualification"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. M.Tech, Ph.D"
              />

              <InputField
                icon={<FaGraduationCap />}
                label="Specialization"
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g. AI & ML"
              />

              <InputField
                icon={<FaBriefcase />}
                label="Experience"
                id="experience"
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="Years of experience"
              />

              <SelectField
                icon={<FaBriefcase />}
                label="Employment Type"
                id="employmentType"
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
                    value: "Contract",
                    label: "Contract",
                  },
                  {
                    value: "Guest",
                    label: "Guest",
                  },
                  {
                    value: "Visiting",
                    label: "Visiting",
                  },
                  {
                    value: "Part Time",
                    label: "Part Time",
                  },
                ]}
              />

              <InputField
                icon={<FaCalendarAlt />}
                label="Joining Date"
                id="joiningDate"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
              />

              <SelectField
                icon={<FaCheckCircle />}
                label="Status"
                id="status"
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

          {/* CONTACT */}

          <Section title="Contact & Address">
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                icon={<FaMapMarkerAlt />}
                label="Address Line 1"
                id="addressLine1"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="Enter address"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Address Line 2"
                id="addressLine2"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Enter address line 2"
              />

              <InputField
                icon={<FaBuilding />}
                label="City"
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
              />

              <InputField
                icon={<FaBuilding />}
                label="State"
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
              />

              <InputField
                icon={<FaBuilding />}
                label="Country"
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Enter country"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Postal Code"
                id="postalCode"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Nationality"
                id="nationality"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                placeholder="Enter nationality"
              />

              <InputField
                icon={<FaMapMarkerAlt />}
                label="Preferred Currency"
                id="preferredCurrency"
                name="preferredCurrency"
                value={form.preferredCurrency}
                onChange={handleChange}
                placeholder="e.g. INR"
              />
            </div>
          </Section>

          {/* SUBJECTS */}

          <Section title={`Subjects (${subjects.length})`}>
            <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
              <InputField
                icon={<FaIdBadge />}
                label="Subject Code"
                id="newSubjectCode"
                name="newSubjectCode"
                value={newSubject.subjectCode}
                onChange={(event) =>
                  setNewSubject((previous) => ({
                    ...previous,
                    subjectCode: event.target.value,
                  }))
                }
                placeholder="e.g. 0CS352T"
              />

              <InputField
                icon={<FaBook />}
                label="Subject Name"
                id="newSubjectName"
                name="newSubjectName"
                value={newSubject.subjectName}
                onChange={(event) =>
                  setNewSubject((previous) => ({
                    ...previous,
                    subjectName: event.target.value,
                  }))
                }
                placeholder="e.g. Java Programming"
              />

              <div className="flex items-end">
                <button
                  type="button"
                  id="addSubjectButton"
                  name="addSubjectButton"
                  onClick={addSubject}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-700"
                >
                  <FaPlus />
                  Add Subject
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {subjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-medium text-gray-500">
                  No subjects assigned.
                </div>
              ) : (
                subjects.map((subject, index) => (
                  <div
                    key={`${subject.subjectCode}-${index}`}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                        <FaBook />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-gray-900">
                          {subject.subjectName}
                        </p>

                        <p className="mt-1 break-words text-xs font-semibold text-gray-500">
                          {subject.subjectCode}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`removeSubjectButton-${index}`}
                      name={`removeSubjectButton-${index}`}
                      onClick={() => removeSubject(index)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <FaTrash />
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </Section>

          {/* CLASSES */}

          <Section title={`Assigned Classes (${classes.length})`}>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <InputField
                icon={<FaChalkboardTeacher />}
                label="Class"
                id="newClass"
                name="newClass"
                value={newClass}
                onChange={(event) => setNewClass(event.target.value)}
                placeholder="e.g. B.Tech CSE 5th Semester"
              />

              <div className="flex items-end">
                <button
                  type="button"
                  id="addClassButton"
                  name="addClassButton"
                  onClick={addClass}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-700 md:w-auto"
                >
                  <FaPlus />
                  Add Class
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {classes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-medium text-gray-500">
                  No classes assigned.
                </div>
              ) : (
                classes.map((className, index) => (
                  <div
                    key={`${className}-${index}`}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                        <FaChalkboardTeacher />
                      </div>

                      <p className="break-words text-sm font-bold text-gray-900">
                        {className}
                      </p>
                    </div>

                    <button
                      type="button"
                      id={`removeClassButton-${index}`}
                      name={`removeClassButton-${index}`}
                      onClick={() => removeClass(index)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <FaTrash />
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </Section>

          {/* BOTTOM ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              id="cancelFacultyUpdateButton"
              name="cancelFacultyUpdateButton"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaArrowLeft />
              Cancel
            </button>

            <button
              type="submit"
              id="saveFacultyChangesButton"
              name="saveFacultyChangesButton"
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

/* =========================================================
   SECTION COMPONENT
========================================================= */

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

/* =========================================================
   INPUT COMPONENT
========================================================= */

const InputField = ({
  icon,
  label,
  id,
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
        htmlFor={id}
        className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500"
      >
        <span className="shrink-0 text-gray-400">{icon}</span>

        <span className="truncate">{label}</span>

        {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.1" : undefined}
        autoComplete="off"
        className="min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
};

/* =========================================================
   SELECT COMPONENT
========================================================= */

const SelectField = ({ icon, label, id, name, value, onChange, options }) => {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500"
      >
        <span className="shrink-0 text-gray-400">{icon}</span>

        <span className="truncate">{label}</span>
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
      >
        {options.map((option) => (
          <option key={`${id}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UpdateFaculty;

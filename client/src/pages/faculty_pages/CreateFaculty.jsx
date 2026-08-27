import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaLock,
  FaIdBadge,
  FaBuilding,
  FaGraduationCap,
  FaBriefcase,
  FaPhone,
  FaCalendarAlt,
  FaSave,
  FaSearch,
  FaUserPlus,
  FaUserTie,
  FaTimes,
  FaChevronDown,
  FaSyncAlt,
} from "react-icons/fa";

import { useAuth } from "../../managers/AuthManager";

export const createFacultyHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  dateOfBirth: "",
  gender: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  nationality: "Indian",
  preferredCurrency: "INR",

  employeeId: "",
  designation: "",
  department: "",
  qualification: "",
  specialization: "",
  experience: "",
  joiningDate: "",
  employmentType: "",
  status: "active",

  subjects: [],
  classes: [],
};

const CreateFaculty = () => {
  const navigate = useNavigate();
  const { api } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [creationMode, setCreationMode] = useState("existing");

  const [formData, setFormData] = useState(initialForm);

  // ONLY USERS WITH ROLE = "user"
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [subjectInput, setSubjectInput] = useState({
    subjectCode: "",
    subjectName: "",
  });

  const [classInput, setClassInput] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // LOAD ONLY USERS WITH ROLE = "user"
  // =====================================================

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setErrorMessage("");

      console.log("Loading users with role = user...");

      /*
        IMPORTANT

        Backend route:

        router.get(
          "/by-role/:role",
          requireSignIn,
          isSuperAdmin,
          getUsersByRole
        );

        index.js:

        app.use("/api/users", userRoutes);

        Therefore:

        GET /api/users/by-role/user

        AuthManager api baseURL already contains /api,
        so frontend call is:

        /users/by-role/user
      */

      const response = await api.get("/users/by-role/user");

      console.log("GET USERS BY ROLE RESPONSE:", response?.data);

      /*
        Support different possible response formats from
        UserController.
      */

      let responseUsers =
        response?.data?.users ||
        response?.data?.data ||
        response?.data?.results ||
        response?.data;

      /*
        If backend returns:

        {
          success: true,
          users: [...]
        }

        users is handled above.

        If backend directly returns:

        [...]

        that is also handled.
      */

      if (!Array.isArray(responseUsers)) {
        responseUsers = [];
      }

      /*
        Safety check.

        Backend should already return ONLY role=user.

        We still keep this check so that if the backend response
        changes later, faculty/admin users cannot accidentally
        appear in this dropdown.
      */

      const normalisedUsers = responseUsers.filter((user) => {
        if (!user) return false;

        const role = String(user.role || "")
          .trim()
          .toLowerCase();

        return role === "user";
      });

      console.log(`Found ${normalisedUsers.length} users with role "user".`);

      console.log("USERS AVAILABLE FOR FACULTY CONVERSION:", normalisedUsers);

      setUsers(normalisedUsers);

      if (normalisedUsers.length === 0) {
        setErrorMessage(
          'No users with the role "user" are currently available for conversion.',
        );
      }
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);

      console.error("LOAD USERS STATUS:", error?.response?.status);

      console.error("LOAD USERS RESPONSE:", error?.response?.data);

      setUsers([]);

      const status = error?.response?.status;

      if (status === 401) {
        setErrorMessage("Your session has expired. Please login again.");
      } else if (status === 403) {
        setErrorMessage("You do not have permission to view existing users.");
      } else if (status === 404) {
        setErrorMessage(
          "The user API endpoint was not found. Please verify /api/users/by-role/user.",
        );
      } else {
        setErrorMessage(
          error?.response?.data?.message || "Unable to load existing users.",
        );
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  // =====================================================
  // LOAD USERS WHEN EXISTING MODE IS SELECTED
  // =====================================================

  useEffect(() => {
    if (creationMode === "existing") {
      loadUsers();
    }
  }, [creationMode]);

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const fullName = String(
        user.fullName || user.name || user.username || "",
      ).toLowerCase();

      const email = String(user.email || "").toLowerCase();

      const phone = String(user.phone || user.mobile || "").toLowerCase();

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        phone.includes(search)
      );
    });
  }, [users, userSearch]);

  // =====================================================
  // HANDLE MODE CHANGE
  // =====================================================

  const handleModeChange = (mode) => {
    setCreationMode(mode);

    setSelectedUser(null);
    setUserSearch("");
    setShowUserDropdown(false);

    setSuccessMessage("");
    setErrorMessage("");

    setFormData({
      ...initialForm,
      subjects: [],
      classes: [],
    });

    setSubjectInput({
      subjectCode: "",
      subjectName: "",
    });

    setClassInput("");

    if (mode === "existing") {
      setTimeout(() => {
        loadUsers();
      }, 0);
    }
  };

  // =====================================================
  // SELECT EXISTING USER
  // =====================================================

  const handleSelectUser = (user) => {
    if (!user) return;

    console.log("SELECTED EXISTING USER:", user);

    setSelectedUser(user);

    setFormData((previous) => ({
      ...previous,

      fullName: user.fullName || user.name || user.username || "",

      email: user.email || "",

      phone: user.phone || user.mobile || "",

      dateOfBirth: user.dateOfBirth
        ? String(user.dateOfBirth).substring(0, 10)
        : "",

      gender: user.gender || "",

      addressLine1: user.addressLine1 || user.address || "",

      addressLine2: user.addressLine2 || "",

      city: user.city || "",

      state: user.state || "",

      country: user.country || "India",

      postalCode: user.postalCode || user.pincode || "",

      nationality: user.nationality || "Indian",

      preferredCurrency: user.preferredCurrency || "INR",
    }));

    setUserSearch(
      user.fullName || user.name || user.username || user.email || "",
    );

    setShowUserDropdown(false);
    setErrorMessage("");
  };

  // =====================================================
  // CLEAR SELECTED USER
  // =====================================================

  const handleClearSelectedUser = () => {
    setSelectedUser(null);

    setUserSearch("");
    setShowUserDropdown(false);

    setFormData({
      ...initialForm,
      subjects: [],
      classes: [],
    });

    setErrorMessage("");
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD SUBJECT
  // =====================================================

  const handleAddSubject = () => {
    const subjectCode = subjectInput.subjectCode.trim();

    const subjectName = subjectInput.subjectName.trim();

    if (!subjectCode || !subjectName) {
      setErrorMessage("Subject code and subject name are required.");

      return;
    }

    const alreadyExists = formData.subjects.some(
      (subject) =>
        String(subject.subjectCode || "").toLowerCase() ===
        subjectCode.toLowerCase(),
    );

    if (alreadyExists) {
      setErrorMessage("This subject has already been added.");

      return;
    }

    setFormData((previous) => ({
      ...previous,

      subjects: [
        ...previous.subjects,
        {
          subjectCode,
          subjectName,
        },
      ],
    }));

    setSubjectInput({
      subjectCode: "",
      subjectName: "",
    });

    setErrorMessage("");
  };

  // =====================================================
  // REMOVE SUBJECT
  // =====================================================

  const handleRemoveSubject = (index) => {
    setFormData((previous) => ({
      ...previous,

      subjects: previous.subjects.filter(
        (_, subjectIndex) => subjectIndex !== index,
      ),
    }));
  };

  // =====================================================
  // ADD CLASS
  // =====================================================

  const handleAddClass = () => {
    const className = classInput.trim();

    if (!className) {
      setErrorMessage("Class name is required.");

      return;
    }

    const alreadyExists = formData.classes.some(
      (existingClass) =>
        existingClass.toLowerCase() === className.toLowerCase(),
    );

    if (alreadyExists) {
      setErrorMessage("This class has already been added.");

      return;
    }

    setFormData((previous) => ({
      ...previous,

      classes: [...previous.classes, className],
    }));

    setClassInput("");

    setErrorMessage("");
  };

  // =====================================================
  // REMOVE CLASS
  // =====================================================

  const handleRemoveClass = (index) => {
    setFormData((previous) => ({
      ...previous,

      classes: previous.classes.filter((_, classIndex) => classIndex !== index),
    }));
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (creationMode === "existing" && !selectedUser) {
      return "Please select an existing user.";
    }

    if (!formData.fullName.trim()) {
      return "Full name is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (creationMode === "new" && !formData.password.trim()) {
      return "Password is required when creating a new user.";
    }

    if (creationMode === "new" && formData.password.trim().length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!formData.employeeId.trim()) {
      return "Employee ID is required.";
    }

    if (!formData.designation.trim()) {
      return "Designation is required.";
    }

    if (!formData.department.trim()) {
      return "Department is required.";
    }

    if (
      formData.experience !== "" &&
      (Number.isNaN(Number(formData.experience)) ||
        Number(formData.experience) < 0)
    ) {
      return "Experience must be a valid positive number.";
    }

    return null;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        userId:
          creationMode === "existing"
            ? selectedUser?._id || selectedUser?.id
            : undefined,

        fullName: formData.fullName.trim(),

        email: formData.email.trim().toLowerCase(),

        password: creationMode === "new" ? formData.password.trim() : undefined,

        role: "faculty",

        phone: formData.phone.trim(),

        dateOfBirth: formData.dateOfBirth || null,

        gender: formData.gender,

        addressLine1: formData.addressLine1.trim(),

        addressLine2: formData.addressLine2.trim(),

        city: formData.city.trim(),

        state: formData.state.trim(),

        country: formData.country.trim(),

        postalCode: formData.postalCode.trim(),

        nationality: formData.nationality.trim(),

        preferredCurrency: formData.preferredCurrency.trim(),

        employeeId: formData.employeeId.trim(),

        designation: formData.designation.trim(),

        department: formData.department.trim(),

        qualification: formData.qualification.trim(),

        specialization: formData.specialization.trim(),

        experience:
          formData.experience === "" ? 0 : Number(formData.experience),

        joiningDate: formData.joiningDate || null,

        employmentType: formData.employmentType,

        status: formData.status,

        subjects: formData.subjects,

        classes: formData.classes,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log("CREATE FACULTY PAYLOAD:", payload);

      const response = await api.post("/faculty/create-faculty", payload);

      console.log("CREATE FACULTY RESPONSE:", response?.data);

      setSuccessMessage(
        response?.data?.message || "Faculty created successfully.",
      );

      /*
        Reset form
      */

      setFormData({
        ...initialForm,
        subjects: [],
        classes: [],
      });

      setSelectedUser(null);

      setUserSearch("");

      setShowUserDropdown(false);

      setSubjectInput({
        subjectCode: "",
        subjectName: "",
      });

      setClassInput("");

      /*
        Remove the converted user from the
        local list because the user's role
        should now be faculty.
      */

      if (creationMode === "existing" && selectedUser) {
        const selectedUserId = selectedUser._id || selectedUser.id;

        setUsers((previous) =>
          previous.filter((user) => (user._id || user.id) !== selectedUserId),
        );
      }

      setTimeout(() => {
        navigate("/all-faculties");
      }, 1000);
    } catch (error) {
      console.error("CREATE FACULTY ERROR:", error);

      console.error("CREATE FACULTY RESPONSE:", error?.response?.data);

      const backendMessage =
        error?.response?.data?.message || error?.response?.data?.error;

      setErrorMessage(backendMessage || "Unable to create faculty.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLASSES
  // =====================================================

  const inputClass =
    "mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass = "text-sm font-semibold text-gray-700";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full bg-transparent px-6 py-10 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Faculty
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create a new faculty account or convert an existing user account
            into a faculty account.
          </p>
        </div>

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-6 rounded-xl bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
            {successMessage}
          </div>
        )}

        {/* ERROR */}

        {errorMessage && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="shrink-0 text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* ACCOUNT MODE */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FaUserTie />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Faculty Account
              </h2>

              <p className="text-xs text-gray-500">
                Select an existing user or create a new account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* EXISTING */}

            <button
              type="button"
              onClick={() => handleModeChange("existing")}
              className={`rounded-2xl border p-5 text-left transition ${
                creationMode === "existing"
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <FaUser />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">Existing User</h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Convert an existing user into faculty.
                  </p>
                </div>
              </div>
            </button>

            {/* NEW */}

            <button
              type="button"
              onClick={() => handleModeChange("new")}
              className={`rounded-2xl border p-5 text-left transition ${
                creationMode === "new"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <FaUserPlus />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">Create New User</h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Create a new user account and faculty profile.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* =====================================================
            EXISTING USER SELECTOR
        ===================================================== */}

        {creationMode === "existing" && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Select Existing User
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Only accounts with the role{" "}
                  <span className="font-semibold text-indigo-600">user</span>{" "}
                  are shown here.
                </p>
              </div>

              <button
                type="button"
                onClick={loadUsers}
                disabled={loadingUsers}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSyncAlt className={loadingUsers ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* SEARCH */}

            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={userSearch}
                onChange={(event) => {
                  setUserSearch(event.target.value);

                  setShowUserDropdown(true);
                }}
                onFocus={() => setShowUserDropdown(true)}
                placeholder="Search user by name, email or phone"
                className={`${inputClass} pl-11 pr-11`}
              />

              <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* SELECTED USER */}

            {selectedUser && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-indigo-50 px-5 py-4 ring-1 ring-indigo-200">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <FaUser />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      Selected User
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {selectedUser.fullName ||
                        selectedUser.name ||
                        selectedUser.username ||
                        "Unnamed User"}
                    </p>

                    <p className="text-sm text-gray-600">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelectedUser}
                  className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* USER DROPDOWN */}

            {showUserDropdown && !selectedUser && (
              <div className="relative z-20">
                <div className="absolute mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                  {loadingUsers ? (
                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                      Loading users with role "user"...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <FaUser />
                      </div>

                      <p className="font-semibold text-gray-700">
                        No users found
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {userSearch
                          ? "Try a different name, email or phone number."
                          : 'There are currently no users with role "user".'}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user._id || user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-indigo-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                            <FaUser />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {user.fullName ||
                                user.name ||
                                user.username ||
                                "Unnamed User"}
                            </p>

                            {user.email && (
                              <p className="truncate text-sm text-gray-500">
                                {user.email}
                              </p>
                            )}

                            {(user.phone || user.mobile) && (
                              <p className="text-xs text-gray-400">
                                {user.phone || user.mobile}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="ml-4 shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          user
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* USER COUNT */}

            {!loadingUsers && users.length > 0 && (
              <div className="mt-3 text-xs text-gray-500">
                {filteredUsers.length} of {users.length} user
                {users.length !== 1 ? "s" : ""} available for faculty
                conversion.
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            FORM
        ===================================================== */}

        <form onSubmit={handleSubmit}>
          {/* ACCOUNT INFORMATION */}

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FaUser />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Account Information
                </h2>

                <p className="text-xs text-gray-500">
                  User account information.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* FULL NAME */}

              <div>
                <label className={labelClass}>Full Name *</label>

                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={
                      creationMode === "existing" && Boolean(selectedUser)
                    }
                    placeholder="Enter full name"
                    className={`${inputClass} pl-11 disabled:bg-gray-100`}
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className={labelClass}>Email *</label>

                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={
                      creationMode === "existing" && Boolean(selectedUser)
                    }
                    placeholder="faculty@example.com"
                    className={`${inputClass} pl-11 disabled:bg-gray-100`}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              {creationMode === "new" && (
                <div>
                  <label className={labelClass}>Password *</label>

                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              )}

              {/* PHONE */}

              <div>
                <label className={labelClass}>Phone</label>

                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* DOB */}

              <div>
                <label className={labelClass}>Date of Birth</label>

                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* GENDER */}

              <div>
                <label className={labelClass}>Gender</label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Gender</option>

                  <option value="male">Male</option>

                  <option value="female">Female</option>

                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* FACULTY INFORMATION */}

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FaIdBadge />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Faculty Information
                </h2>

                <p className="text-xs text-gray-500">
                  Professional faculty information.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* EMPLOYEE ID */}

              <div>
                <label className={labelClass}>Employee ID *</label>

                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP001"
                  className={inputClass}
                />
              </div>

              {/* DESIGNATION */}

              <div>
                <label className={labelClass}>Designation *</label>

                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Designation</option>

                  <option value="Assistant Professor">
                    Assistant Professor
                  </option>

                  <option value="Associate Professor">
                    Associate Professor
                  </option>

                  <option value="Professor">Professor</option>

                  <option value="Lecturer">Lecturer</option>

                  <option value="HOD">HOD</option>
                </select>
              </div>

              {/* DEPARTMENT */}

              <div>
                <label className={labelClass}>Department *</label>

                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Computer Science and Engineering"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* QUALIFICATION */}

              <div>
                <label className={labelClass}>Qualification</label>

                <div className="relative">
                  <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="M.Tech / PhD"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* SPECIALIZATION */}

              <div>
                <label className={labelClass}>Specialization</label>

                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="AI / ML / Data Science"
                  className={inputClass}
                />
              </div>

              {/* EXPERIENCE */}

              <div>
                <label className={labelClass}>Experience</label>

                <div className="relative">
                  <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="number"
                    min="0"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Years of experience"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* JOINING DATE */}

              <div>
                <label className={labelClass}>Joining Date</label>

                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* EMPLOYMENT TYPE */}

              <div>
                <label className={labelClass}>Employment Type</label>

                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Employment Type</option>

                  <option value="Permanent">Permanent</option>

                  <option value="Contract">Contract</option>

                  <option value="Guest">Guest</option>

                  <option value="Visiting">Visiting</option>
                </select>
              </div>
            </div>
          </div>

          {/* ADDRESS */}

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              Address Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Address Line 1</label>

                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Address"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Address Line 2</label>

                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, area, landmark..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>State</label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Country</label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Postal Code</label>

                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Nationality</label>

                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Preferred Currency</label>

                <select
                  name="preferredCurrency"
                  value={formData.preferredCurrency}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="INR">INR</option>

                  <option value="USD">USD</option>

                  <option value="EUR">EUR</option>

                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* SUBJECTS */}

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Subjects</h2>

              <p className="mt-1 text-xs text-gray-500">
                Subjects currently assigned to this faculty.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr_auto]">
              <input
                type="text"
                value={subjectInput.subjectCode}
                onChange={(event) =>
                  setSubjectInput((previous) => ({
                    ...previous,
                    subjectCode: event.target.value,
                  }))
                }
                placeholder="Subject Code"
                className={inputClass.replace("mt-2", "")}
              />

              <input
                type="text"
                value={subjectInput.subjectName}
                onChange={(event) =>
                  setSubjectInput((previous) => ({
                    ...previous,
                    subjectName: event.target.value,
                  }))
                }
                placeholder="Subject Name"
                className={inputClass.replace("mt-2", "")}
              />

              <button
                type="button"
                onClick={handleAddSubject}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add Subject
              </button>
            </div>

            {formData.subjects.length > 0 && (
              <div className="mt-5 space-y-2">
                {formData.subjects.map((subject, index) => (
                  <div
                    key={`${subject.subjectCode}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">
                        {subject.subjectCode}
                      </span>

                      <span className="ml-3 text-sm text-gray-600">
                        {subject.subjectName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(index)}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CLASSES */}

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Classes</h2>

              <p className="mt-1 text-xs text-gray-500">
                Classes currently assigned to this faculty.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                value={classInput}
                onChange={(event) => setClassInput(event.target.value)}
                placeholder="BTech CSE 5th Semester"
                className={`${inputClass.replace("mt-2", "")} flex-1`}
              />

              <button
                type="button"
                onClick={handleAddClass}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add Class
              </button>
            </div>

            {formData.classes.length > 0 && (
              <div className="mt-5 space-y-2">
                {formData.classes.map((className, index) => (
                  <div
                    key={`${className}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {className}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveClass(index)}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading || (creationMode === "existing" && !selectedUser)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave />

              {loading
                ? "Creating Faculty..."
                : creationMode === "existing"
                  ? "Convert User to Faculty"
                  : "Create Faculty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFaculty;

import React, { useState } from "react";
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
} from "react-icons/fa";

import { useAuth } from "../../managers/AuthManager";

// =====================================================
// HERO
// =====================================================

export const createFacultyHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm = {
  // USER

  fullName: "",
  email: "",
  password: "",
  phone: "",
  dateOfBirth: "",
  gender: "",

  // ADDRESS

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  nationality: "Indian",
  preferredCurrency: "INR",

  // FACULTY

  employeeId: "",
  designation: "",
  department: "",
  qualification: "",
  specialization: "",
  experience: "",
  joiningDate: "",
  employmentType: "",
  status: "active",

  // SUBJECTS

  subjects: [],

  // CLASSES

  classes: [],
};

// =====================================================
// COMPONENT
// =====================================================

const CreateFaculty = () => {
  const navigate = useNavigate();

  const { api } = useAuth();

  // ===================================================
  // STATE
  // ===================================================

  const [formData, setFormData] = useState(initialForm);

  const [subjectInput, setSubjectInput] = useState({
    subjectCode: "",
    subjectName: "",
  });

  const [classInput, setClassInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  // ===================================================
  // HANDLE CHANGE
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ===================================================
  // ADD SUBJECT
  // ===================================================

  const handleAddSubject = () => {
    const subjectCode = subjectInput.subjectCode.trim();

    const subjectName = subjectInput.subjectName.trim();

    if (!subjectCode || !subjectName) {
      setErrorMessage("Subject code and subject name are required.");

      return;
    }

    const alreadyExists = formData.subjects.some(
      (subject) =>
        subject.subjectCode.toLowerCase() === subjectCode.toLowerCase(),
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

  // ===================================================
  // REMOVE SUBJECT
  // ===================================================

  const handleRemoveSubject = (index) => {
    setFormData((previous) => ({
      ...previous,

      subjects: previous.subjects.filter(
        (_, subjectIndex) => subjectIndex !== index,
      ),
    }));
  };

  // ===================================================
  // ADD CLASS
  // ===================================================

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

  // ===================================================
  // REMOVE CLASS
  // ===================================================

  const handleRemoveClass = (index) => {
    setFormData((previous) => ({
      ...previous,

      classes: previous.classes.filter((_, classIndex) => classIndex !== index),
    }));
  };

  // ===================================================
  // VALIDATE
  // ===================================================

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Full name is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
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

    /*
     * Password is required only when the backend
     * needs to create a NEW User.
     *
     * The backend will determine whether the email
     * already exists.
     *
     * Therefore we don't force password here.
     */

    if (formData.password && formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return null;
  };

  // ===================================================
  // SUBMIT
  // ===================================================

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

      // =================================================
      // PAYLOAD
      // =================================================

      const payload = {
        // USER

        fullName: formData.fullName.trim(),

        email: formData.email.trim().toLowerCase(),

        /*
         * Password is sent only if entered.
         *
         * If email already exists, the backend
         * will NOT create another User.
         */

        password: formData.password.trim(),

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

        // FACULTY

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

        // SUBJECTS

        subjects: formData.subjects,

        // CLASSES

        classes: formData.classes,
      };

      console.log("====================================");

      console.log("CREATE FACULTY PAYLOAD", payload);

      console.log("====================================");

      // =================================================
      // CREATE FACULTY
      // =================================================

      const response = await api.post("/faculty/create-faculty", payload);

      console.log("CREATE FACULTY RESPONSE:", response.data);

      // =================================================
      // SUCCESS
      // =================================================

      setSuccessMessage(
        response?.data?.message || "Faculty created successfully.",
      );

      // =================================================
      // RESET
      // =================================================

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

      // =================================================
      // NAVIGATE
      // =================================================

      setTimeout(() => {
        navigate("/all-faculties");
      }, 1000);
    } catch (error) {
      console.error("CREATE FACULTY ERROR:", error);

      console.error("CREATE FACULTY RESPONSE:", error?.response?.data);

      const backendMessage = error?.response?.data?.message;

      setErrorMessage(backendMessage || "Unable to create faculty.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STYLES
  // =====================================================

  const inputClass =
    "mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass = "text-sm font-semibold text-gray-700";

  // =====================================================
  // PAGE
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
            Create a faculty profile and link it to an application User account.
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
          <div className="mb-6 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {errorMessage}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>
          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

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
                  These details are stored in UserModel.
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
                    placeholder="Enter full name"
                    className={`${inputClass} pl-11`}
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
                    placeholder="faculty@example.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label className={labelClass}>Password</label>

                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Required only for a new User"
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  If this email already belongs to a faculty User, another User
                  will not be created.
                </p>
              </div>

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

          {/* =================================================
              FACULTY INFORMATION
          ================================================= */}

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
                  Professional information stored in FacultyModel.
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

          {/* =================================================
              ADDRESS
          ================================================= */}

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

          {/* =================================================
              SUBJECTS
          ================================================= */}

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

          {/* =================================================
              CLASSES
          ================================================= */}

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

          {/* =================================================
              SUBMIT
          ================================================= */}

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
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave />

              {loading ? "Creating Faculty..." : "Create Faculty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFaculty;

// src/pages/super_admin_pages/UpdateRole.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

export const updateRoleHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const ROLE_OPTIONS = [
  "accountant", // University Accountant
  "admin", // System Administrator
  "alumni_relations", // Alumni Relations Officer
  "assistant_professor",
  "professor",
  "business_analyst", // New role: Business Analyst
  "content_creator", // New role: Content Creator
  "course_coordinator", // Course Coordinator
  "customer_support", // New role: Customer Support Representative
  "data_scientist", // New role: Data Scientist
  "dean", // Dean of Faculty
  "department_head", // Head of Department
  "developer_lead",
  "developer", // Software Developer
  "event_coordinator", // Event Coordinator
  "exam_controller", // Exam Controller
  "faculty",
  "hod",
  "hr_manager", // HR Manager
  "hr",
  "intern", // Intern
  "legal_advisor", // New role: Legal Advisor
  "librarian", // University Librarian
  "maintenance_staff", // Maintenance Staff
  "marketing_manager", // New role: Marketing Manager
  "operations_manager", // New role: Operations Manager
  "product_owner", // Product Owner
  "project_manager", // Project Manager
  "qa_lead", // Quality Assurance Lead
  "recruiter", // Recruiter
  "registrar", // University Registrar
  "researcher", // Researcher
  "sales_executive", // New role: Sales Executive
  "student", // University Student
  "superadmin", // Super Administrator
  "support_engineer", // Support Engineer
  "teacher", // University Teacher
  "tech_lead", // Technical Lead
  "test_engineer", // Software Tester
  "user", // Default role
  "ux_ui_designer", // UX/UI Designer
];

function formatRoleLabel(role) {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const UpdateRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUserRole } = useAuth();

  const [role, setRole] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const formattedRoleOptions = useMemo(
    () =>
      ROLE_OPTIONS.map((roleValue) => ({
        value: roleValue,
        label: formatRoleLabel(roleValue),
      })),
    [],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setMessage("");

      await updateUserRole(id, role);

      setMessage("Role updated successfully.");

      setTimeout(() => {
        navigate("/all-users");
      }, 1000);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to update role.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-20 bg-gradient-to-b from-white via-slate-50 to-white px-6 py-12">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <span className="text-lg font-bold">R</span>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
              Update User Role
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Change the role for this user account.
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Role
              </label>

              <div className="mt-2">
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrorMessage("");
                    setMessage("");
                  }}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {formattedRoleOptions.map((roleItem) => (
                    <option key={roleItem.value} value={roleItem.value}>
                      {roleItem.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-70"
              >
                {loading ? "Updating..." : "Update Role"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/all-users")}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Back to{" "}
            <Link
              to="/all-users"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              All Users
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdateRole;

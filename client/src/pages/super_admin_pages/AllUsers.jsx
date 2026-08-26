import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager";

// =====================================================
// HERO
// =====================================================

export const allUsersHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

// =====================================================
// ALL USERS
// =====================================================

export default function AllUsers() {
  const { api } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ===================================================
  // LOAD USERS
  // ===================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/users/all-users");

      console.log("=================================");
      console.log("ALL USERS RESPONSE");
      console.log(response.data);
      console.log("=================================");

      setUsers(response?.data?.users || []);
    } catch (error) {
      console.error("GET ALL USERS ERROR:", error);

      setErrorMessage(
        error?.response?.data?.message || "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD ON PAGE OPEN
  // ===================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // ===================================================
  // ROLE CLASS
  // ===================================================

  const getRoleClass = (role) => {
    switch (String(role || "").toLowerCase()) {
      case "superadmin":
        return "bg-purple-50 text-purple-700";

      case "admin":
        return "bg-orange-50 text-orange-700";

      case "faculty":
        return "bg-emerald-50 text-emerald-700";

      case "student":
        return "bg-sky-50 text-sky-700";

      case "accountant":
        return "bg-amber-50 text-amber-700";

      case "hr":
        return "bg-pink-50 text-pink-700";

      case "librarian":
        return "bg-indigo-50 text-indigo-700";

      case "exam_controller":
        return "bg-red-50 text-red-700";

      case "registrar":
        return "bg-teal-50 text-teal-700";

      case "alumni_relations":
        return "bg-violet-50 text-violet-700";

      case "event_coordinator":
        return "bg-cyan-50 text-cyan-700";

      case "maintenance_staff":
        return "bg-slate-100 text-slate-700";

      case "user":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ===================================================
  // FORMAT ROLE
  // ===================================================

  const formatRole = (role) => {
    if (!role) {
      return "-";
    }

    return String(role)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-full bg-transparent px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-900/10">
            <p className="text-sm text-gray-500">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="min-h-full bg-transparent px-6 py-12 lg:px-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mx-auto w-full max-w-7xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          All Users
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          Manage application users and their roles.
        </p>
      </div>

      {/* =================================================
          CARD
      ================================================= */}

      <div className="mx-auto mt-10 w-full max-w-7xl">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 sm:p-6">
          {/* =================================================
              CARD HEADER
          ================================================= */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Users Table
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {users.length} user
                {users.length !== 1 ? "s" : ""} found
              </div>
            </div>

            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Super Admin
            </span>
          </div>

          {/* =================================================
              SUCCESS
          ================================================= */}

          {successMessage && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              <FaCheckCircle />

              <span>{successMessage}</span>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              <FaExclamationTriangle />

              <span>{errorMessage}</span>
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {users.length === 0 ? (
            <div className="mt-6 rounded-xl bg-gray-50 px-4 py-10 text-center ring-1 ring-gray-200">
              <p className="text-sm font-medium text-gray-700">
                No users found.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                There are currently no users in the database.
              </p>
            </div>
          ) : (
            /* =================================================
               TABLE
            ================================================= */

            <div className="mt-6 w-full overflow-x-auto rounded-xl ring-1 ring-gray-900/10">
              <table className="w-full min-w-[900px]">
                {/* =================================================
                    HEADER
                ================================================= */}

                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                      Name
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                      Created
                    </th>

                    <th className="w-[120px] px-5 py-3 text-center text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* =================================================
                    BODY
                ================================================= */}

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* =================================================
                          NAME
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {u.fullName || "-"}
                        </div>
                      </td>

                      {/* =================================================
                          EMAIL
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="max-w-[350px] truncate text-sm text-gray-600">
                          {u.email || "-"}
                        </div>
                      </td>

                      {/* =================================================
                          ROLE
                      ================================================= */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleClass(
                            u.role,
                          )}`}
                        >
                          {formatRole(u.role)}
                        </span>
                      </td>

                      {/* =================================================
                          CREATED
                      ================================================= */}

                      <td className="px-5 py-4 text-xs text-gray-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center">
                          <Link
                            to={`/update-role/${u._id}`}
                            title="Update Role"
                            aria-label={`Update role for ${u.fullName}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-300 bg-white text-indigo-600 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            <FaEdit size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <p className="mt-4 text-xs text-gray-500">
            Super Admin can update user roles.
          </p>
        </div>
      </div>
    </div>
  );
}

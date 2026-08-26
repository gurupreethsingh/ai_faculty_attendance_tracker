// src/pages/super_admin_pages/AllUsers.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

export const allUsersHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const AllUsers = () => {
  const { getAllUsers, updateUserRole } = useAuth();

  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to fetch users.",
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      setMessage("");
      setErrorMessage("");
      await updateUserRole(id, role);
      setMessage("User role updated successfully.");
      loadUsers();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to update role.",
      );
    }
  };

  return (
    <div className=" bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10 mb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">All Users</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage users and roles (Super Admin only)
            </p>
          </div>

          <Link
            to="/profile"
            className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Back to Profile
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.fullName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">{item.email}</td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {item.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.phone || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleRoleChange(item._id, "user")}
                          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold hover:bg-gray-100"
                        >
                          Make User
                        </button>

                        <button
                          onClick={() =>
                            handleRoleChange(item._id, "superadmin")
                          }
                          className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                        >
                          Make Admin
                        </button>

                        <Link
                          to={`/update-role/${item._id}`}
                          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold hover:bg-gray-100"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;

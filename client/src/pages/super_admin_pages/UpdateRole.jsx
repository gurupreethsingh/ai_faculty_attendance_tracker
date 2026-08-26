// src/pages/super_admin_pages/UpdateRole.jsx
import React, { useState } from "react";
import { FaUserShield } from "react-icons/fa";

// ✅ HERO PROPS FOR THIS PAGE (used by MainLayout)
export const updateRoleHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true, // keep header background visible
};

export default function UpdateRole() {
  const [form, setForm] = useState({
    email: "john@example.com",
    role: "User",
  });

  function onSubmit(e) {
    e.preventDefault();
    alert(`Dummy: Role updated to ${form.role}`);
  }

  const inputClass =
    "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 " +
    "ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 " +
    "sm:text-sm/6";

  return (
    <>
      <div className="flex flex-col justify-center px-6 py-12 lg:px-8 bg-transparent">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <FaUserShield className="mx-auto h-10 w-10 text-indigo-600" />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Update User Role
          </h2>
          <p className="mt-2 text-center text-sm/6 text-gray-500">
            Dummy page — change user role (backend later).
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                User Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                Select Role
              </label>
              <div className="mt-2">
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option>User</option>
                  <option>Employee</option>
                  <option>Admin</option>
                  <option>SuperAdmin</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Update Role
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

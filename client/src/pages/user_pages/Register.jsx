import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager";

export const registerHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function Register() {
  const navigate = useNavigate();
  const { register, getDashboardPathByRole } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setErrorMessage("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await register({
        fullName: form.name,
        email: form.email,
        password: form.password,
      });

      const role = res?.user?.role;
      navigate(getDashboardPathByRole(role));
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 " +
    "ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm";

  return (
    <div className="flex flex-col justify-center px-6 py-12 lg:px-8 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <FaUserPlus className="mx-auto h-10 w-10 text-indigo-600" />

        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          Name, email and password are required.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {errorMessage && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Full name
            </label>

            <div className="mt-2">
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Email address
            </label>

            <div className="mt-2">
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Password
            </label>

            <div className="mt-2">
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

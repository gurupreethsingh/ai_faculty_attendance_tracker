// src/pages/user_pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager"; // ✅ IMPORTANT

// ✅ HERO PROPS
export const forgotPasswordHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth(); // ✅ from travel logic

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ REAL LOGIC (from travel app)
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setMessage("");

      const data = await forgotPassword(email);

      setMessage(data?.message || "Reset link generated.");

      // ✅ redirect if token exists
      if (data?.resetToken) {
        navigate(`/reset-password/${data.resetToken}`);
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to process request.",
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
        <FaKey className="mx-auto h-10 w-10 text-indigo-600" />

        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Forgot your password?
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          Enter your registered email and we’ll send a reset link.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* ✅ SUCCESS MESSAGE */}
        {message && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ✅ ERROR MESSAGE */}
        {errorMessage && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Email address
            </label>

            <div className="mt-2">
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                  setMessage("");
                }}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-70"
            >
              {loading ? "Checking..." : "Send reset link"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

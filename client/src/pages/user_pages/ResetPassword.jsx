// src/pages/user_pages/ResetPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager";

export const resetPasswordHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setMessage("");

      const res = await resetPassword(token, password);

      setMessage(res?.message || "Password reset successful.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to reset password.",
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-6 py-12 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <FaLock className="mx-auto h-10 w-10 text-indigo-600" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Create a new secure password for your account.
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

          <form onSubmit={onSubmit} className="mt-6 space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-900">
                New Password
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                    setMessage("");
                  }}
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage("");
                    setMessage("");
                  }}
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-70"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
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
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager";

export const loginHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, getDashboardPathByRole } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * ---------------------------------------------------------
   * SESSION EXPIRED MESSAGE
   * ---------------------------------------------------------
   *
   * AuthManager / protected routes can redirect the user to:
   *
   * navigate("/login", {
   *   state: {
   *     sessionExpired: true
   *   }
   * });
   *
   * This allows the user to clearly understand why they
   * have been returned to the login page.
   */
  useEffect(() => {
    if (location.state?.sessionExpired) {
      setErrorMessage(
        "Your session has expired. Please login again."
      );

      /*
       * Remove the navigation state after displaying the
       * message so refreshing the login page does not show
       * the expired-session message again.
       */
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  /*
   * ---------------------------------------------------------
   * HANDLE INPUT CHANGES
   * ---------------------------------------------------------
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setErrorMessage("");
    setSuccessMessage("");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * HANDLE LOGIN
   * ---------------------------------------------------------
   */
  const onSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    /*
     * Basic frontend validation.
     */
    const email = form.email.trim();
    const password = form.password;

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      /*
       * AuthManager handles the actual authentication,
       * token/session storage, etc.
       */
      const res = await login({
        email,
        password,
      });

      /*
       * Login succeeded.
       */
      setSuccessMessage("Login successful.");

      const role = res?.user?.role;

      /*
       * Make sure we received a role before navigating.
       */
      if (!role) {
        setErrorMessage(
          "Login successful, but your user role could not be determined."
        );
        setSuccessMessage("");
        return;
      }

      const dashboardPath = getDashboardPathByRole(role);

      if (!dashboardPath) {
        setErrorMessage(
          "Login successful, but no dashboard is configured for your role."
        );
        setSuccessMessage("");
        return;
      }

      /*
       * Small delay allows the success message to be rendered
       * before navigation.
       */
      navigate(dashboardPath, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      /*
       * Try to use the backend's actual error message.
       */
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      setErrorMessage(
        backendMessage || "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * INPUT STYLING
   * ---------------------------------------------------------
   */
  const inputClass =
    "block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 " +
    "ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-600 " +
    "disabled:cursor-not-allowed disabled:bg-gray-100 " +
    "disabled:text-gray-500 sm:text-sm";

  return (
    <div className="flex flex-col justify-center px-6 py-12 lg:px-8 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">

        {/* Login Icon */}
        <FaUserCircle className="mx-auto h-10 w-10 text-indigo-600" />

        {/* Heading */}
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-center text-sm text-gray-500">
          Use email and password to continue.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

        {/* -------------------------------------------------
            ERROR MESSAGE
        ------------------------------------------------- */}
        {errorMessage && (
          <div
            className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* -------------------------------------------------
            SUCCESS MESSAGE
        ------------------------------------------------- */}
        {successMessage && (
          <div
            className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-600"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {/* -------------------------------------------------
            LOGIN FORM
        ------------------------------------------------- */}
        <form
          onSubmit={onSubmit}
          className="space-y-6"
          noValidate
        >

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email address
            </label>

            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex items-center justify-between">

              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={
                "flex w-full justify-center rounded-md bg-indigo-600 " +
                "px-3 py-2 text-sm font-semibold text-white shadow-sm " +
                "hover:bg-indigo-500 focus-visible:outline " +
                "focus-visible:outline-2 focus-visible:outline-offset-2 " +
                "focus-visible:outline-indigo-600 " +
                "disabled:cursor-not-allowed disabled:opacity-70"
              }
            >
              {loading ? "Logging in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* REGISTER LINK */}
        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
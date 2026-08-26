// src/pages/employee_pages/EmployeeDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

// ✅ HERO PROPS FOR THIS PAGE
export const employeeDashboardHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function EmployeeDashboard() {
  const {
    user,
    fetchProfile,
    logout,
    getEmployeeDashboardStats, // optional: use if you already added it in AuthManager
  } = useAuth();

  const [profile, setProfile] = useState(user || null);
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    pendingReviews: 0,
    projects: 0,
    teamMessages: 0,
    status: "Active",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const profileData = user || (await fetchProfile());
        setProfile(profileData);

        // ✅ If backend dashboard API exists, use it
        if (typeof getEmployeeDashboardStats === "function") {
          const dashboardStats = await getEmployeeDashboardStats();
          setStats({
            assignedTasks: dashboardStats?.assignedTasks ?? 0,
            completedTasks: dashboardStats?.completedTasks ?? 0,
            pendingReviews: dashboardStats?.pendingReviews ?? 0,
            projects: dashboardStats?.projects ?? 0,
            teamMessages: dashboardStats?.teamMessages ?? 0,
            status: dashboardStats?.status || "Active",
          });
        } else {
          // ✅ Graceful fallback using real profile presence
          setStats((prev) => ({
            ...prev,
            status: profileData?.role ? "Active" : "Not Available",
          }));
        }
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Unable to load employee dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = useMemo(
    () => [
      { title: "Assigned Tasks", value: stats.assignedTasks },
      { title: "Completed Tasks", value: stats.completedTasks },
      { title: "Pending Reviews", value: stats.pendingReviews },
      { title: "Projects", value: stats.projects },
      { title: "Team Messages", value: stats.teamMessages },
      { title: "Status", value: stats.status },
    ],
    [stats],
  );

  return (
    <div className=" bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
            Employee Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Overview of your activity, assigned work, and account access.
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {/* Main card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Your Overview
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Logged in as {profile?.fullName || "Employee"}{" "}
                {profile?.role ? `(${profile.role})` : ""}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Employee
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10"
                >
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 transition hover:shadow-md"
                  >
                    <div className="text-xs font-semibold text-gray-500">
                      {item.title}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile snapshot */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard label="Full Name" value={profile?.fullName} />
                <InfoCard label="Email" value={profile?.email} />
                <InfoCard label="Phone" value={profile?.phone} />
                <InfoCard label="Department" value={profile?.department} />
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  View Profile
                </Link>

                <Link
                  to="/update-profile"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Update Profile
                </Link>

                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/10">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-gray-900">
        {value || "Not provided"}
      </div>
    </div>
  );
}

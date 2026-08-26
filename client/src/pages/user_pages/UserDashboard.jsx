// src/pages/user_pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

export const userDashboardHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function UserDashboard() {
  const { user, fetchProfile, logout } = useAuth();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = user || (await fetchProfile());
      setProfile(data);
    };
    load();
  }, []);

  const cards = [
    { title: "Profile", desc: "View your account details.", to: "/profile" },
    {
      title: "Update Profile",
      desc: "Edit your details.",
      to: "/update-profile",
    },
    ...(profile?.role === "superadmin"
      ? [
          {
            title: "Admin Panel",
            desc: "Manage system users.",
            to: "/all-users",
          },
        ]
      : []),
  ];

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10 mb-20">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-semibold text-gray-900">
            Welcome, {profile?.fullName || "User"}
          </h2>
          <p className="text-sm text-gray-500">
            Role: {profile?.role || "user"}
          </p>
        </div>

        {/* CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 hover:shadow-md transition"
            >
              <div className="text-sm font-semibold text-gray-900">
                {c.title}
              </div>
              <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
              <div className="mt-4 text-xs font-semibold text-indigo-600">
                Open →
              </div>
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Home
          </Link>

          <button
            onClick={logout}
            className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

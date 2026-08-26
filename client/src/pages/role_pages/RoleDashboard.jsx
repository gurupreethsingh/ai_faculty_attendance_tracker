import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

export const roleDashboardHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

function prettifyRole(role = "user") {
  return String(role)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function RoleDashboard() {
  const { role } = useParams();
  const { user, fetchProfile, logout } = useAuth();

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = user || (await fetchProfile());
        setProfile(data || null);
      } catch (error) {
        console.error("Failed to load role dashboard profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, fetchProfile]);

  const currentRole = profile?.role || role || "user";
  const title = `${prettifyRole(currentRole)} Dashboard`;

  const cards = useMemo(
    () => [
      {
        title: "Profile",
        desc: "View your account details and personal information.",
        to: "/profile",
      },
      {
        title: "Update Profile",
        desc: "Edit your account details and preferences.",
        to: "/update-profile",
      },
      {
        title: "Home",
        desc: "Go back to the homepage.",
        to: "/",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Welcome, {profile?.fullName || "User"} · Role:{" "}
            {prettifyRole(currentRole)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <Link
                    key={card.title}
                    to={card.to}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 transition hover:shadow-md"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {card.title}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{card.desc}</p>
                    <div className="mt-4 text-xs font-semibold text-indigo-600">
                      Open →
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard label="Full Name" value={profile?.fullName} />
                <InfoCard label="Email" value={profile?.email} />
                <InfoCard label="Phone" value={profile?.phone} />
                <InfoCard label="Role" value={prettifyRole(currentRole)} />
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/profile"
                  className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  View Profile
                </Link>

                <Link
                  to="/update-profile"
                  className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Update Profile
                </Link>

                <button
                  onClick={logout}
                  className="rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
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

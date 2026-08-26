import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager";

// ✅ HERO PROPS
export const profileHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [profile, setProfile] = useState(user || null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data || user || null);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(user || null);
      }
    };

    loadProfile();
  }, [fetchProfile, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FaUser className="text-indigo-600 text-2xl" />
              <h1 className="text-3xl font-semibold text-gray-900">
                My Profile
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Manage your account details
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/update-profile"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Update Profile
            </Link>

            {profile?.role === "superadmin" && (
              <Link
                to="/all-users"
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                All Users
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileCard label="Full Name" value={profile?.fullName} />
          <ProfileCard label="Email" value={profile?.email} />
          <ProfileCard label="Phone" value={profile?.phone} />
          <ProfileCard
            label="Date of Birth"
            value={profile?.dateOfBirth?.slice(0, 10)}
          />
          <ProfileCard label="Gender" value={profile?.gender} />
          <ProfileCard label="Role" value={profile?.role} />
          <ProfileCard label="Country" value={profile?.country} />
          <ProfileCard label="State" value={profile?.state} />
          <ProfileCard label="City" value={profile?.city} />
          <ProfileCard label="Postal Code" value={profile?.postalCode} />
          <ProfileCard label="Address Line 1" value={profile?.addressLine1} />
          <ProfileCard label="Address Line 2" value={profile?.addressLine2} />
          <ProfileCard label="Nationality" value={profile?.nationality} />
          <ProfileCard
            label="Preferred Currency"
            value={profile?.preferredCurrency}
          />
        </div>
      </div>
    </div>
  );
}

const ProfileCard = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-gray-900">
        {value || "Not provided"}
      </p>
    </div>
  );
};

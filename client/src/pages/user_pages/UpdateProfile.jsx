// src/pages/user_pages/UpdateProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager";

export const updateProfileHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function UpdateProfile() {
  const navigate = useNavigate();
  const { user, fetchProfile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    nationality: "",
    preferredCurrency: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ LOAD DATA (copied logic)
  useEffect(() => {
    const loadData = async () => {
      const profile = user || (await fetchProfile());

      setFormData({
        fullName: profile?.fullName || "",
        phone: profile?.phone || "",
        dateOfBirth: profile?.dateOfBirth
          ? profile.dateOfBirth.slice(0, 10)
          : "",
        gender: profile?.gender || "",
        addressLine1: profile?.addressLine1 || "",
        addressLine2: profile?.addressLine2 || "",
        city: profile?.city || "",
        state: profile?.state || "",
        country: profile?.country || "",
        postalCode: profile?.postalCode || "",
        nationality: profile?.nationality || "",
        preferredCurrency: profile?.preferredCurrency || "",
      });
    };

    loadData();
  }, []);

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    setErrorMessage("");
    setSuccessMessage("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ SUBMIT LOGIC
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(formData);
      setSuccessMessage("Profile updated successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to update profile.",
      );
    }
  };

  const inputClass =
    "block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 " +
    "ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none";

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10 mb-20">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <FaUserEdit className="mx-auto h-10 w-10 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-semibold text-gray-900">
            Update Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Update your account details
          </p>
        </div>

        {/* MESSAGES */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />

          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={["Male", "Female", "Other"]}
          />

          <Input
            label="Address Line 1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
          />
          <Input
            label="Address Line 2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
          />
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
          <Input
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
          />
          <Input
            label="Nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
          />
          <Input
            label="Preferred Currency"
            name="preferredCurrency"
            value={formData.preferredCurrency}
            onChange={handleChange}
          />

          {/* BUTTONS */}
          <div className="col-span-full flex flex-wrap gap-3 pt-4">
            <button
              type="submit"
              className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* BACK LINK */}
        <p className="mt-10 text-center text-sm text-gray-500">
          Back to{" "}
          <Link
            to="/profile"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Profile →
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ✅ REUSABLE INPUT */
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-900">{label}</label>
    <div className="mt-1">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
      />
    </div>
  </div>
);

/* ✅ REUSABLE SELECT */
const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-900">{label}</label>
    <div className="mt-1">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>
);

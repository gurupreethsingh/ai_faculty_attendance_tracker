// src/pages/super_admin_pages/AllSubscriptions.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import globalBackendRoute from "../../config/Config";
import { FaBell } from "react-icons/fa";

export const allSubscriptionsHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

export default function AllSubscriptions() {
  const [rows, setRows] = useState([]);
  const [alert, setAlert] = useState("");

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get(
        `${globalBackendRoute}/api/subscription/all-subscriptions`,
      );
      setRows(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function toggleSubscription(email, isActive) {
    try {
      if (isActive) {
        await axios.post(`${globalBackendRoute}/api/subscription/unsubscribe`, {
          email,
        });
        setAlert(`Unsubscribed: ${email}`);
      } else {
        await axios.post(`${globalBackendRoute}/api/subscription/resubscribe`, {
          email,
        });
        setAlert(`Resubscribed: ${email}`);
      }

      fetchSubscriptions();

      setTimeout(() => setAlert(""), 2000);
    } catch (err) {
      console.error("Toggle error:", err);
      setAlert("Action failed");
    }
  }

  const badgeClass = (active) =>
    active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700";

  const buttonClass = (active) =>
    active ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          All Subscriptions
        </h2>

        <div className="mt-10 bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <FaBell className="text-indigo-600" />
              <span className="font-semibold">Subscriptions</span>
            </div>
            <span className="text-xs bg-indigo-50 px-3 py-1 rounded-full text-indigo-700">
              Super Admin
            </span>
          </div>

          {alert && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">{alert}</div>
          )}

          <div className="mt-6">
            <div className="grid grid-cols-4 font-semibold text-sm bg-gray-50 p-2">
              <div>Email</div>
              <div>Type</div>
              <div>Status</div>
              <div className="text-right">Action</div>
            </div>

            {rows.map((sub) => (
              <div
                key={sub._id}
                className="grid grid-cols-4 p-3 border-t text-sm"
              >
                <div>{sub.email}</div>
                <div>{sub.subscriptionType}</div>

                <div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${badgeClass(
                      sub.isActive,
                    )}`}
                  >
                    {sub.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => toggleSubscription(sub.email, sub.isActive)}
                    className={`px-3 py-1 text-xs rounded ${buttonClass(
                      sub.isActive,
                    )}`}
                  >
                    {sub.isActive ? "Unsubscribe" : "Resubscribe"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Connected to backend API. Data is real.
          </p>
        </div>
      </div>
    </div>
  );
}

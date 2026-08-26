// src/components/footer_components/Subscription.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import globalBackendRoute from "../../config/Config";

function isBlank(s) {
  return s == null || String(s).trim() === "";
}

function normalizeTrim(s = "") {
  return String(s).trim();
}

function isValidEmail(email = "") {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email);
}

export default function Subscription({
  title = "Stay in the loop",
  subtitle = "Get product updates, tips, and releases. No spam.",
  placeholder = "you@example.com",
  buttonText = "Subscribe",
}) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState({
    submitting: false,
    ok: false,
    error: "",
  });

  const error = useMemo(() => {
    const e = normalizeTrim(email);
    if (!touched) return "";
    if (isBlank(e)) return "Email is required.";
    if (!isValidEmail(e)) return "Please enter a valid email.";
    return "";
  }, [email, touched]);

  const canSubmit = useMemo(
    () => !error && !status.submitting,
    [error, status.submitting],
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);

    const e1 = normalizeTrim(email);

    if (isBlank(e1) || !isValidEmail(e1)) {
      setStatus({
        submitting: false,
        ok: false,
        error: "Please enter a valid email.",
      });
      return;
    }

    try {
      setStatus({ submitting: true, ok: false, error: "" });

      await axios.post(`${globalBackendRoute}/api/subscription/subscribe`, {
        email: e1,
        subscriptionType: "weekly",
      });

      setStatus({ submitting: false, ok: true, error: "" });
      setEmail("");
      setTouched(false);
    } catch (err) {
      setStatus({
        submitting: false,
        ok: false,
        error:
          err?.response?.data?.message || "Subscription failed. Try again.",
      });
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2" noValidate>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            className="w-full rounded-xl px-4 py-2.5 text-sm border border-gray-300"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-indigo-700 px-4 py-2.5 text-white disabled:opacity-60"
          >
            {status.submitting ? "Subscribing..." : buttonText}
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {status.ok && (
          <p className="text-xs text-green-700">✅ Subscribed successfully</p>
        )}
        {status.error && <p className="text-xs text-red-600">{status.error}</p>}
      </form>
    </div>
  );
}

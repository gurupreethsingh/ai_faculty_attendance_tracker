// src/pages/common_pages/Contact.jsx
import React, { useMemo, useState } from "react";
import { useAuth } from "../../managers/AuthManager";

// ✅ HERO PROPS FOR THIS PAGE (unique)
export const contactHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const SECTIONS = [
  {
    title: "Reach us quickly",
    text: `For new projects, partnerships, or support—share a quick message and we’ll respond with next steps. We focus on clean communication, realistic timelines, and scalable engineering.`,
  },
  {
    title: "What you can expect",
    text: `A clear response with questions (if needed), a suggested approach, and an outline of timelines. If it's urgent, mention it in your message.`,
  },
  {
    title: "Our focus",
    text: `AI-driven products, web & mobile apps, automation-first systems, testing tools, and secure blockchain solutions—crafted to scale with your business.`,
  },
  {
    title: "Office hours",
    text: `Mon–Sat, 10:00 AM – 7:00 PM (IST). You can also email us anytime and we’ll respond on the next business day.`,
  },
];

function normalizeTrim(s = "") {
  return String(s).trim();
}

function isValidEmail(email = "") {
  // Simple + effective email validation for typical web forms
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email);
}

function isValidFullName(name = "") {
  const n = normalizeTrim(name);

  if (!n) return { ok: false, reason: "Full name is required." };

  // Allow whitespace only between words
  // (trim removes leading/trailing spaces already)
  // Also prevent all numbers or all symbols:
  const hasLetter = /[A-Za-z]/.test(n);
  const hasDigit = /\d/.test(n);

  // Disallow if only digits/symbols/spaces (no letters at all)
  if (!hasLetter && hasDigit) {
    return { ok: false, reason: "Full name cannot be only numbers." };
  }
  if (!hasLetter && !hasDigit) {
    return { ok: false, reason: "Full name cannot be only symbols." };
  }

  // Allow alphanumeric + common name punctuation/spaces
  // (letters, digits, spaces, dot, apostrophe, hyphen)
  const allowed = /^[A-Za-z0-9.'\- ]+$/;
  if (!allowed.test(n)) {
    return { ok: false, reason: "Full name contains invalid characters." };
  }

  // Avoid names that are just 1 character
  if (n.length < 2) {
    return { ok: false, reason: "Please enter a valid full name." };
  }

  // Must not be all digits/symbols; alphanumeric is allowed, but should contain at least one letter
  if (!hasLetter) {
    return {
      ok: false,
      reason: "Full name should contain at least one letter.",
    };
  }

  return { ok: true, reason: "" };
}

function isValidPhone(phone = "") {
  const p = normalizeTrim(phone);
  if (!p) return { ok: false, reason: "Phone is required." };

  // Allow digits, spaces, +, -, (, )
  const allowed = /^[0-9+\-() ]+$/;
  if (!allowed.test(p))
    return { ok: false, reason: "Phone contains invalid characters." };

  // Basic digits count check
  const digits = p.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return { ok: false, reason: "Phone number should be 8–15 digits." };
  }

  return { ok: true, reason: "" };
}

export default function Contact() {
  const { api } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    message: false,
  });

  const [status, setStatus] = useState({
    submitting: false,
    ok: false,
    error: "",
  });

  const errors = useMemo(() => {
    const fullNameCheck = isValidFullName(form.fullName);
    const emailTrimmed = normalizeTrim(form.email);
    const phoneCheck = isValidPhone(form.phone);
    const messageTrimmed = normalizeTrim(form.message);

    return {
      fullName: fullNameCheck.ok ? "" : fullNameCheck.reason,
      email: !emailTrimmed
        ? "Email is required."
        : !isValidEmail(emailTrimmed)
          ? "Please enter a valid email address."
          : "",
      phone: phoneCheck.ok ? "" : phoneCheck.reason,
      message: !messageTrimmed ? "Message is required." : "",
    };
  }, [form]);

  const isFormValid = useMemo(() => {
    return (
      !errors.fullName && !errors.email && !errors.phone && !errors.message
    );
  }, [errors]);

  function handleChange(e) {
    const { name, value } = e.target;

    // ✅ Keep input as-is while typing (better UX),
    // we'll TRIM on blur + submit to enforce no leading/trailing spaces.
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;

    // ✅ Enforce trim on blur (your requirement)
    const trimmed = normalizeTrim(value);
    setForm((f) => ({ ...f, [name]: trimmed }));

    setTouched((t) => ({ ...t, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      message: true,
    });

    const next = {
      fullName: normalizeTrim(form.fullName),
      email: normalizeTrim(form.email),
      phone: normalizeTrim(form.phone),
      message: normalizeTrim(form.message),
    };

    setForm(next);

    const fullNameCheck = isValidFullName(next.fullName);
    const emailOk = next.email && isValidEmail(next.email);
    const phoneCheck = isValidPhone(next.phone);
    const messageOk = Boolean(next.message);

    if (!fullNameCheck.ok || !emailOk || !phoneCheck.ok || !messageOk) {
      setStatus({
        submitting: false,
        ok: false,
        error: "Please fix the errors above.",
      });
      return;
    }

    try {
      setStatus({ submitting: true, ok: false, error: "" });

      // 🔥 REAL API CALL (THIS WAS MISSING)
      await api.post("/contact/create-contact-message", {
        fullName: next.fullName,
        email: next.email,
        phone: next.phone,
        message: next.message,
      });

      setStatus({ submitting: false, ok: true, error: "" });

      setForm({
        fullName: "",
        email: "",
        phone: "",
        message: "",
      });

      setTouched({
        fullName: false,
        email: false,
        phone: false,
        message: false,
      });
    } catch (err) {
      console.error("ERROR:", err);

      setStatus({
        submitting: false,
        ok: false,
        error:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  }

  // ✅ Google Maps embed (replace with your real address/embed when ready)
  // You can paste your own iframe src from Google Maps "Share > Embed a map"
  const MAP_IFRAME_SRC =
    "https://www.google.com/maps?q=Bengaluru%20Karnataka&output=embed";

  return (
    <main
      className="
        min-h-screen bg-white
        [font-family:ui-sans-serif,system-ui,-apple-system,Segoe_UI,Roboto,Inter,Helvetica,Arial,'Apple_Color_Emoji','Segoe_UI_Emoji']
      "
    >
      {/* PAGE FRAME: same spacing system across all breakpoints */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ">
        {/* HERO (matches Homepage spacing & typography) */}
        <section className="pt-10 sm:pt-12 lg:pt-14">
          <div className="mx-auto w-full">
            <span className="text-indigo-700 font-light">
              Contact us &rarr;{" "}
            </span>
            <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Contact with our team
            </h1>

            <p className="mt-4 text-pretty text-sm leading-7 text-gray-600 sm:text-base">
              Share your requirements and we’ll respond with a clear plan—scope,
              timeline, and next steps.
            </p>

            {/* small action row (optional) */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#contact-form"
                className="
                  inline-flex items-center justify-center rounded-full
                  bg-indigo-700 px-4 py-2 text-sm font-semibold text-white
                  shadow-sm hover:bg-indigo-600 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-indigo-600/40
                "
              >
                Send Message
              </a>
              <a
                href="#map"
                className="
                  inline-flex items-center justify-center rounded-full
                  bg-white px-4 py-2 text-sm font-semibold text-gray-900
                  ring-1 ring-gray-900/10 hover:bg-gray-50
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40
                "
              >
                View Map
              </a>
            </div>
          </div>
        </section>

        {/* CONTENT CARD (same card system as Homepage) */}
        <section className="py-10 sm:py-12 lg:py-14">
          <div className="mx-auto w-full">
            <div
              className="
                rounded-3xl bg-white/90 backdrop-blur
                ring-1 ring-gray-900/10 shadow-sm
                p-5 sm:p-6 lg:p-8
              "
            >
              {/* meta row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-gray-900">
                    Contact Details
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Map + form + quick info — consistent layout & spacing.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Contact
                </span>
              </div>

              {/* MAP + FORM GRID (new, but same theme) */}
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {/* MAP */}
                <div id="map" className="space-y-3">
                  <h3 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                    Find us on Google Maps
                  </h3>
                  <p className="text-sm leading-7 text-gray-600 sm:text-base">
                    Visit our office or schedule a meeting. Replace the map with
                    your exact embed link when ready.
                  </p>

                  <div
                    className="
                      overflow-hidden rounded-2xl bg-white
                      ring-1 ring-gray-900/10 shadow-sm
                    "
                  >
                    <div className="aspect-[16/10] w-full">
                      <iframe
                        title="ECODERS Location"
                        src={MAP_IFRAME_SRC}
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
                    <div className="text-sm font-semibold text-gray-900">
                      Quick contact
                    </div>
                    <p className="mt-2 text-sm leading-7 text-gray-600">
                      Email:{" "}
                      <span className="font-semibold text-indigo-900 hover:text-indigo-700">
                        gurupreeth@ecoders.co.in
                      </span>
                      <br />
                      Phone:{" "}
                      <span className="font-semibold text-indigo-900 hover:text-indigo-700">
                        +91 9538596766
                      </span>
                    </p>
                  </div>
                </div>

                {/* FORM */}
                <div id="contact-form" className="space-y-3">
                  <h3 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                    Send us a message
                  </h3>
                  <p className="text-sm leading-7 text-gray-600 sm:text-base">
                    All fields are mandatory. We trim extra spaces and validate
                    your email format.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="
                      rounded-2xl bg-white p-5 sm:p-6
                      shadow-sm ring-1 ring-gray-900/10
                    "
                    noValidate
                  >
                    {/* SUCCESS / ERROR */}
                    {status.ok && (
                      <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200">
                        Message sent successfully. We’ll contact you soon.
                      </div>
                    )}
                    {status.error && (
                      <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
                        {status.error}
                      </div>
                    )}

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-900">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="name"
                        placeholder="Enter your full name"
                        className="
                          w-full rounded-xl bg-white px-4 py-2.5 text-sm
                          text-gray-900 placeholder:text-gray-400
                          ring-1 ring-gray-900/10
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40
                        "
                        required
                      />
                      {touched.fullName && errors.fullName && (
                        <p className="text-xs text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                      {!errors.fullName && touched.fullName && (
                        <p className="text-xs text-gray-500">
                          Leading/trailing spaces are removed automatically.
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mt-4 space-y-1.5">
                      <label className="text-sm font-semibold text-gray-900">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="
                          w-full rounded-xl bg-white px-4 py-2.5 text-sm
                          text-gray-900 placeholder:text-gray-400
                          ring-1 ring-gray-900/10
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40
                        "
                        required
                      />
                      {touched.email && errors.email && (
                        <p className="text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="mt-4 space-y-1.5">
                      <label className="text-sm font-semibold text-gray-900">
                        Phone <span className="text-red-600">*</span>
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="tel"
                        placeholder="+91 90000 00000"
                        className="
                          w-full rounded-xl bg-white px-4 py-2.5 text-sm
                          text-gray-900 placeholder:text-gray-400
                          ring-1 ring-gray-900/10
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40
                        "
                        required
                      />
                      {touched.phone && errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="mt-4 space-y-1.5">
                      <label className="text-sm font-semibold text-gray-900">
                        Message <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={5}
                        placeholder="Tell us what you want to build..."
                        className="
                          w-full rounded-xl bg-white px-4 py-2.5 text-sm
                          text-gray-900 placeholder:text-gray-400
                          ring-1 ring-gray-900/10
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40
                        "
                        required
                      />
                      {touched.message && errors.message && (
                        <p className="text-xs text-red-600">{errors.message}</p>
                      )}
                    </div>

                    {/* Submit row */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-gray-500">
                        By submitting, you agree to be contacted by ECODERS.
                      </p>
                      <button
                        type="submit"
                        disabled={status.submitting}
                        className="
                          inline-flex items-center justify-center rounded-full
                          bg-indigo-700 px-4 py-2 text-sm font-semibold text-white
                          shadow-sm hover:bg-indigo-600 disabled:opacity-60
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40
                        "
                      >
                        {status.submitting ? "Sending..." : "Send Message"}
                      </button>
                    </div>

                    {/* small helper */}
                    <div className="mt-4 text-xs text-gray-500">
                      {isFormValid ? (
                        <span className="text-green-700 font-semibold">
                          ✅ Form looks good.
                        </span>
                      ) : (
                        <span>
                          Please fill all mandatory fields with valid details.
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* footer row (same as Homepage) */}
              <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <a
                    href="/privacy-policy"
                    className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-xs text-indigo-700">·</span>
                  <a
                    href="/contact"
                    className="text-xs font-semibold text-gray-900 hover:text-indigo-700"
                  >
                    contact@ecoders.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

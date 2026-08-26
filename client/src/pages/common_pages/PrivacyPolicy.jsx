// src/pages/common_pages/PrivacyPolicy.jsx
import React from "react";

// ✅ HERO PROPS FOR THIS PAGE (unique)
export const privacyPolicyHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const POLICY = [
  {
    title: "Overview",
    text: `This Privacy Policy explains how ECODERS collects, uses, and protects information when you use our website or contact us. We focus on minimal collection, responsible handling, and clear communication.`,
  },
  {
    title: "Information we collect",
    text: `When you submit forms (like Contact), we may collect your name, email, phone number, and message content. We may also collect basic technical data (like browser type and general usage analytics) to improve site performance and user experience.`,
  },
  {
    title: "How we use your information",
    text: `We use your information to respond to inquiries, provide requested services, and improve our offerings. We do not sell your personal information.`,
  },
  {
    title: "Cookies & analytics",
    text: `We may use cookies or analytics tools to understand site usage and improve performance. You can control cookies through your browser settings.`,
  },
  {
    title: "Data security",
    text: `We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.`,
  },
  {
    title: "Retention",
    text: `We retain information only as long as needed to fulfill the purpose for which it was collected, or as required by law.`,
  },
  {
    title: "Third-party links",
    text: `Our site may contain links to third-party websites. We are not responsible for their privacy practices. Please review their policies separately.`,
  },
  {
    title: "Your rights",
    text: `You may request access, correction, or deletion of your personal information by contacting us. We will respond within a reasonable time.`,
  },
  {
    title: "Updates to this policy",
    text: `We may update this policy from time to time. Changes will be posted on this page with an updated effective date.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <main
      className="
        min-h-screen bg-gradient-to-b from-white to-gray-50
        [font-family:ui-sans-serif,system-ui,-apple-system,Segoe_UI,Roboto,Inter,Helvetica,Arial,'Apple_Color_Emoji','Segoe_UI_Emoji']
      "
    >
      {/* PAGE FRAME: same spacing system across all breakpoints */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ">
        {/* HERO (matches Contact/Home spacing & typography) */}
        <section className="pt-10 sm:pt-12 lg:pt-14">
          <div className="mx-auto w-full">
            <span className="text-indigo-700 font-light">
              Privacy Policy &rarr;{" "}
            </span>
            <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Your data, handled responsibly
            </h1>

            <p className="mt-4 text-pretty text-sm leading-7 text-gray-600 sm:text-base">
              We collect only what we need, use it only for clear purposes, and
              protect it with sensible security practices.
            </p>

            {/* small action row (optional) */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#policy"
                className="
                  inline-flex items-center justify-center rounded-full
                  bg-indigo-700 px-4 py-2 text-sm font-semibold text-white
                  shadow-sm hover:bg-indigo-600 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-indigo-600/40
                "
              >
                Read Policy
              </a>
              <a
                href="/contact"
                className="
                  inline-flex items-center justify-center rounded-full
                  bg-white px-4 py-2 text-sm font-semibold text-gray-900
                  ring-1 ring-gray-900/10 hover:bg-gray-50
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40
                "
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {/* CONTENT CARD (same card system as Contact) */}
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
                    Policy Details
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Clear explanation of what we collect and why.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  PrivacyPolicy
                </span>
              </div>

              {/* Policy sections (same typography scale) */}
              <div id="policy" className="mt-6 space-y-7 sm:space-y-8">
                {POLICY.map((p) => (
                  <article key={p.title} className="space-y-2">
                    <h3 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                      {p.title}
                    </h3>
                    <p className="text-sm leading-7 text-gray-600 sm:text-base">
                      {p.text}
                    </p>
                  </article>
                ))}
              </div>

              {/* footer row (same pattern) */}
              <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Effective date:{" "}
                  <span className="font-semibold">Jan 1, 2026</span>
                </p>
                <div className="flex gap-2">
                  <a
                    href="/contact"
                    className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                  >
                    Contact
                  </a>
                  <span className="text-xs text-indigo-300">·</span>
                  <a
                    href="/contact"
                    className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                  >
                    gurupreeth@ecoders.co.in
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

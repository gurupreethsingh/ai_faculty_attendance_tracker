// src/pages/common_pages/PageNotFound.jsx
import React from "react";

/* ✅ HERO CONTENT exported for MainLayout (unique) */
export const pageNotFoundHero = {
  heroTitle: "404 PAGE NOT FOUND",
  heroSubtitle: "",
  showHero: true,
  // heroBg: optional
  // heroBg: "https://images.unsplash.com/photo-1520975958225-3f61d1b1b8a5?auto=format&fit=crop&w=2400&q=70",
};

const SECTIONS = [
  {
    title: "What happened?",
    text: `The page you’re looking for doesn’t exist or may have been moved.
This can happen if the URL is incorrect or the content has been reorganized.`,
  },
  {
    title: "What you can do",
    text: `Use the navigation links above, or jump to a popular section using the quick links below.
If you still need help, contact our team and we’ll guide you.`,
  },
];

export default function PageNotFound() {
  return (
    <main
      className="
        bg-white
        [font-family:ui-sans-serif,system-ui,-apple-system,Segoe_UI,Roboto,Inter,Helvetica,Arial,'Apple_Color_Emoji','Segoe_UI_Emoji']
      "
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="pt-10 sm:pt-12 lg:pt-14 pb-6 sm:pb-8">
          <div className="mx-auto w-full">
            <div
              className="
                rounded-3xl bg-white/90 backdrop-blur
                ring-1 ring-gray-900/10 shadow-sm
                p-5 sm:p-6 lg:p-8
              "
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-gray-900">
                    Quick Help
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Navigate to a working page instantly.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-red-700">
                  404 • Navigation
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/"
                  className="
                    inline-flex items-center justify-center rounded-full
                    bg-indigo-700 px-4 py-2 text-sm font-semibold text-white
                    shadow-sm hover:bg-indigo-600 focus:outline-none
                    focus-visible:ring-2 focus-visible:ring-indigo-600/40
                  "
                >
                  Back to Home <span className="ml-2">&rarr;</span>
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
                  Contact ECODERS
                </a>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  ECODERS • AI • Web • Mobile • Automation
                </p>
                <div className="flex gap-2">
                  <a
                    href="/privacy-policy"
                    className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-xs text-indigo-300">·</span>
                  <a
                    href="/contact"
                    className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>

            {/* tiny spacer */}
            <div className="h-2 sm:h-4" />
          </div>
        </section>
      </div>
    </main>
  );
}

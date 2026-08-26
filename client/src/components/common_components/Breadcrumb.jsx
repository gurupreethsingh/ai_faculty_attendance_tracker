// src/components/common_components/Breadcrumb.jsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

// ✅ Friendly names for routes (you can add more here)
const LABEL_MAP = {
  "/": "Home",
  "/home": "Home",
  "/homepage": "Home",
  "/page-not-found": "Page Not Found",
  "/404": "Page Not Found",
};

// ✅ Optional: If you want some paths to redirect label display
function getLabel(pathname) {
  return LABEL_MAP[pathname] || null;
}

function titleCaseFromSlug(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Breadcrumb() {
  const location = useLocation();

  const crumbs = useMemo(() => {
    const pathname = location.pathname || "/";
    const parts = pathname
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .filter(Boolean);

    // Always start with Home
    const list = [{ to: "/", label: "Home" }];

    // If we're already at home, done
    if (pathname === "/" || pathname === "/home" || pathname === "/homepage") {
      return list;
    }

    // Build accumulated paths: /a, /a/b, /a/b/c
    let acc = "";
    parts.forEach((part) => {
      acc += `/${part}`;
      const directLabel = getLabel(acc);
      const label = directLabel || titleCaseFromSlug(part);
      list.push({ to: acc, label });
    });

    return list;
  }, [location.pathname]);

  return (
    <div className="w-full bg-white/60 backdrop-blur ">
      <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8 py-3">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-indigo-700">
            {crumbs.map((c, idx) => {
              const isLast = idx === crumbs.length - 1;

              return (
                <li key={c.to} className="flex items-center gap-2">
                  {isLast ? (
                    <span className="font-semibold">{c.label}</span>
                  ) : (
                    <Link
                      to={c.to}
                      className="hover:underline underline-offset-4"
                    >
                      {c.label}
                    </Link>
                  )}

                  {!isLast && <span className="text-indigo-400">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}

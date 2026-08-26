// src/components/footer_components/FooterLinks.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function FooterLinks({
  title = "Website",
  links = [
    { label: "Home", to: "/home" },
    { label: "About Us", to: "/about-us" },
    { label: "Contact", to: "/contact" },
    { label: "Privacy Policy", to: "/privacy-policy" },
  ],
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-gray-600 hover:text-indigo-700 transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

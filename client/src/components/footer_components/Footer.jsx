// src/components/footer_components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";

import Subscription from "../subscription_components/Subscription";
import FooterLinks from "../footer_components/FooterLinks";
import AddressBlock from "../footer_components/AddressBlock";

const OTHER_LINKS = [
  { label: "Careers", to: "/careers" },
  { label: "Internships", to: "/internships" },
  { label: "Jobs", to: "/jobs" },
  { label: "Partnerships", to: "/partnerships" },
];

const WEBSITE_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about-us" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

const SOCIAL = [
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: FaLinkedinIn },
  { label: "Instagram", href: "https://www.instagram.com", Icon: FaInstagram },
  { label: "YouTube", href: "https://www.youtube.com", Icon: FaYoutube },
  { label: "GitHub", href: "https://github.com", Icon: FaGithub },
  { label: "X", href: "https://x.com", Icon: FaXTwitter },
];

export default function Footer() {
  return (
    <footer className="mt-10 bg-gray-200">
      {/* Top content */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* 5 columns responsive grid */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* 1) Subscription */}
          <div className="lg:col-span-4">
            <Subscription />
          </div>

          {/* 2) Website links (reusable) */}
          <div className="lg:col-span-2">
            <FooterLinks title="Website" links={WEBSITE_LINKS} />
          </div>

          {/* 3) Social links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Social</h3>
            <ul className="space-y-2">
              {SOCIAL.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-700 transition-colors"
                    aria-label={label}
                  >
                    <span
                      className="
                        inline-flex h-9 w-9 items-center justify-center rounded-xl
                        bg-gray-50 ring-1 ring-gray-900/10
                        group-hover:bg-indigo-50 group-hover:ring-indigo-200
                        transition
                      "
                    >
                      <Icon className="text-lg text-gray-700 group-hover:text-indigo-700" />
                    </span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4) Other links */}
          <div className="lg:col-span-2">
            <FooterLinks title="Opportunities" links={OTHER_LINKS} />
          </div>

          {/* 5) Address (reusable) */}
          <div className="lg:col-span-2">
            <AddressBlock />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-200">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-indigo-500">
              © {new Date().getFullYear()}{" "}
              <span className="font-bold">ECODERS</span>. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                to="/privacy-policy"
                className="font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300">·</span>
              <Link
                to="/contact"
                className="font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
              >
                Contact
              </Link>
              <span className="text-indigo-300">·</span>
              <a
                href="gurupreeth@ecoders.co.in"
                className="font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
              >
                gurupreeth@ecoders.co.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

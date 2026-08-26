// src/components/footer_components/AddressBlock.jsx
import React from "react";

export default function AddressBlock({
  title = "Address",
  company = "ECODERS",
  line1 = "Ecoders, Hesaraghatta Road, Bengaluru, Karnataka",
  line2 = "India 560073",
  email = "gurupreeth@ecoders.co.in",
  phone = "+91 9538596766",
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      <div className="text-sm text-gray-600 leading-6">
        <div className="font-semibold text-gray-900">{company}</div>
        <div>{line1}</div>
        <div>{line2}</div>

        <div className="mt-3">
          <div>
            <span className="text-gray-500">Email:</span>{" "}
            <a
              href={`mailto:${email}`}
              className="font-semibold text-gray-900 hover:text-indigo-700 transition-colors"
            >
              {email}
            </a>
          </div>
          <div className="mt-1">
            <span className="text-gray-500">Phone:</span>{" "}
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="font-semibold text-gray-900 hover:text-indigo-700 transition-colors"
            >
              {phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

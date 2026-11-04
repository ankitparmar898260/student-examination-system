import React from "react";

export default function Badge({ status }) {
  if (!status) return null;

  const normalized = String(status).trim().toLowerCase();

  let style = "bg-gray-100 text-gray-700 border-gray-300";
  let label = status;

  if (normalized === "pass") {
    style = "bg-green-100 text-green-800 border-green-300";
    label = "Pass";
  } else if (normalized === "fail") {
    style = "bg-red-100 text-red-800 border-red-300";
    label = "Fail";
  } else if (normalized === "incomplete") {
    style = "bg-amber-100 text-amber-800 border-amber-300";
    label = "Incomplete";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {label}
    </span>
  );
}

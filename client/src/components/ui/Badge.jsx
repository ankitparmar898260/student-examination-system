import React from "react";

export default function Badge({ status }) {
  if (!status) return null;

  const normalized = String(status).trim().toLowerCase();

  let containerStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let dotStyle = "bg-slate-400";
  let label = status;

  if (normalized === "pass") {
    containerStyle = "bg-emerald-50 text-[#16A34A] border-emerald-200 font-semibold";
    dotStyle = "bg-[#16A34A]";
    label = "Pass";
  } else if (normalized === "fail") {
    containerStyle = "bg-rose-50 text-rose-700 border-rose-200 font-semibold";
    dotStyle = "bg-rose-500";
    label = "Fail";
  } else if (normalized === "incomplete") {
    containerStyle = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
    dotStyle = "bg-amber-500";
    label = "Incomplete";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${containerStyle}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
      <span>{label}</span>
    </span>
  );
}

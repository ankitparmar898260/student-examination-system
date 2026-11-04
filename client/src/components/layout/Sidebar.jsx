import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const dataEntryLinks = [
    { to: "/students", label: "Students", icon: "👤" },
    { to: "/subjects", label: "Subjects", icon: "📚" },
    { to: "/exams", label: "Exams", icon: "📝" },
    { to: "/enrollment", label: "Enrollment", icon: "📋" },
    { to: "/marks-entry", label: "Marks Entry", icon: "✏️" },
  ];

  const reportLinks = [
    { to: "/reports/student-list", label: "Student List", icon: "📄" },
    { to: "/reports/exam-subjects", label: "Exam Subjects", icon: "📄" },
    { to: "/reports/enrollment-list", label: "Enrollment List", icon: "📄" },
    { to: "/reports/marks-sheet", label: "Marks Sheet", icon: "📄" },
    { to: "/reports/exam-result", label: "Exam Results", icon: "📄" },
    { to: "/reports/subject-wise", label: "Subject Analysis", icon: "📄" },
    { to: "/reports/missing-marks", label: "Missing Marks", icon: "📄" },
  ];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shrink-0 no-print">
      {/* Title / Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        <span className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>📊</span>
          <span>Student Exam System</span>
        </span>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* DATA ENTRY Section */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            DATA ENTRY
          </h2>
          <nav className="space-y-1">
            {dataEntryLinks.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* REPORTS Section */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            REPORTS
          </h2>
          <nav className="space-y-1">
            {reportLinks.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}

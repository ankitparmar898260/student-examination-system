import React from "react";
import { NavLink } from "react-router-dom";
import { useEnrollmentDraft } from "../../context/EnrollmentDraftContext";
import {
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  UserCheck,
  Edit3,
  FileSpreadsheet,
  Layers,
  ClipboardList,
  Award,
  Trophy,
  PieChart,
  AlertCircle,
} from "lucide-react";

export default function Sidebar() {
  const { selectedIds } = useEnrollmentDraft();
  const draftCount = selectedIds?.size || 0;

  const dataEntryLinks = [
    { to: "/students", label: "Students", icon: Users },
    { to: "/subjects", label: "Subjects", icon: BookOpen },
    { to: "/exams", label: "Exams", icon: FileText },
    { to: "/enrollment", label: "Enrollment", icon: UserCheck },
    { to: "/marks-entry", label: "Marks Entry", icon: Edit3 },
  ];

  const reportLinks = [
    { to: "/reports/student-list", label: "Student List", icon: FileSpreadsheet },
    { to: "/reports/exam-subjects", label: "Exam Subjects", icon: Layers },
    { to: "/reports/enrollment-list", label: "Enrollment List", icon: ClipboardList },
    { to: "/reports/marks-sheet", label: "Marks Sheet", icon: Award },
    { to: "/reports/exam-result", label: "Exam Results", icon: Trophy },
    { to: "/reports/subject-wise", label: "Subject Analysis", icon: PieChart },
    { to: "/reports/missing-marks", label: "Missing Marks", icon: AlertCircle },
  ];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? "bg-blue-600 text-white font-semibold shadow-xs"
        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
    }`;

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800/80 flex flex-col h-screen sticky top-0 shrink-0 no-print">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 bg-[#0B1120]">
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight truncate">
              ExamSystem
            </h1>
            <p className="text-xs text-slate-400 leading-tight truncate">
              Student Examination
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-3.5 py-5 space-y-6">
        {/* DATA ENTRY Section */}
        <div>
          <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            DATA ENTRY
          </h2>
          <nav className="space-y-1">
            {dataEntryLinks.map((item) => {
              const Icon = item.icon;
              const isEnrollment = item.to === "/enrollment";
              return (
                <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isEnrollment && draftCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white leading-none shadow-xs">
                      {draftCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* REPORTS Section */}
        <div>
          <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            REPORTS
          </h2>
          <nav className="space-y-1">
            {reportLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#0B1120] text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          System Online
        </span>
        <span className="text-slate-500 font-mono text-[10px]">v1.0</span>
      </div>
    </aside>
  );
}

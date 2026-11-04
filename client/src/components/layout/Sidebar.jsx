import React from "react";
import { NavLink } from "react-router-dom";
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
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-indigo-600 text-white shadow-xs"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
    }`;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 no-print">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              ExamSystem
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Academic Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        {/* DATA ENTRY Section */}
        <div>
          <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            DATA ENTRY
          </h2>
          <nav className="space-y-1">
            {dataEntryLinks.map((item) => {
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

      {/* Footer info */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/20 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Online
        </span>
        <span className="text-slate-400 font-mono">v1.0</span>
      </div>
    </aside>
  );
}

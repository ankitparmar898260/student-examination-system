import React from "react";
import { useLocation } from "react-router-dom";
import { Calendar, ShieldCheck, ChevronRight } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const getPageInfo = (pathname) => {
    switch (pathname) {
      case "/":
      case "/students":
        return { title: "Students", section: "Data Entry" };
      case "/subjects":
        return { title: "Subjects", section: "Data Entry" };
      case "/exams":
        return { title: "Exams", section: "Data Entry" };
      case "/enrollment":
        return { title: "Enrollment", section: "Data Entry" };
      case "/marks-entry":
        return { title: "Marks Entry", section: "Data Entry" };
      case "/reports/student-list":
        return { title: "Student List Report", section: "Reports" };
      case "/reports/exam-subjects":
        return { title: "Exam Subjects Report", section: "Reports" };
      case "/reports/enrollment-list":
        return { title: "Enrollment List Report", section: "Reports" };
      case "/reports/marks-sheet":
        return { title: "Student Marks Sheet", section: "Reports" };
      case "/reports/exam-result":
        return { title: "Exam Results", section: "Reports" };
      case "/reports/subject-wise":
        return { title: "Subject Analysis", section: "Reports" };
      case "/reports/missing-marks":
        return { title: "Missing Marks", section: "Reports" };
      default:
        return { title: "Examination System", section: "Portal" };
    }
  };

  const { title, section } = getPageInfo(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0 no-print sticky top-0 z-20 shadow-xs">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500 font-medium text-xs tracking-wider uppercase">{section}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Right Session and System Indicators */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 font-medium border border-slate-200 text-xs shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Academic Session 2025–26</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>System Verified</span>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { useLocation } from "react-router-dom";
import { Calendar, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const getPageInfo = (pathname) => {
    switch (pathname) {
      case "/":
      case "/students":
        return { title: "Students", section: "Data Entry", subtitle: "Manage enrolled student profiles and departments" };
      case "/subjects":
        return { title: "Subjects", section: "Data Entry", subtitle: "Configure course syllabus, maximum and passing criteria" };
      case "/exams":
        return { title: "Exams", section: "Data Entry", subtitle: "Manage examination schedules and assigned subject checklists" };
      case "/enrollment":
        return { title: "Enrollment", section: "Data Entry", subtitle: "Enroll registered students into upcoming examinations" };
      case "/marks-entry":
        return { title: "Marks Entry", section: "Data Entry", subtitle: "Score sheets and marks evaluation grid" };
      case "/reports/student-list":
        return { title: "Student List Report", section: "Reports", subtitle: "Filter and search master student directory" };
      case "/reports/exam-subjects":
        return { title: "Exam Subjects Report", section: "Reports", subtitle: "Review curriculum and mapped subjects per exam" };
      case "/reports/enrollment-list":
        return { title: "Enrollment List Report", section: "Reports", subtitle: "Student candidates registered for examinations" };
      case "/reports/marks-sheet":
        return { title: "Student Marks Sheet", section: "Reports", subtitle: "Official grade card and individual performance report" };
      case "/reports/exam-result":
        return { title: "Exam Results", section: "Reports", subtitle: "Overall performance roster, merit ranks and CSV export" };
      case "/reports/subject-wise":
        return { title: "Subject Analysis", section: "Reports", subtitle: "Statistical distribution, average scores and failure counts" };
      case "/reports/missing-marks":
        return { title: "Missing Marks", section: "Reports", subtitle: "Audit list of unrecorded evaluations" };
      default:
        return { title: "Examination System", section: "Dashboard", subtitle: "Academic management platform" };
    }
  };

  const { title, section } = getPageInfo(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 shadow-xs flex items-center justify-between px-6 shrink-0 no-print sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">{section}</span>
        <span className="text-slate-300">/</span>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Academic Session 2025–26</span>
        </div>
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>DB Verified</span>
        </div>
      </div>
    </header>
  );
}

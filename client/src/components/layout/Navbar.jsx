import React from "react";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/":
      case "/students":
        return "Students";
      case "/subjects":
        return "Subjects";
      case "/exams":
        return "Exams";
      case "/enrollment":
        return "Enrollment";
      case "/marks-entry":
        return "Marks Entry";
      case "/reports/student-list":
        return "Student List Report";
      case "/reports/exam-subjects":
        return "Exam Subjects Report";
      case "/reports/enrollment-list":
        return "Enrollment List Report";
      case "/reports/marks-sheet":
        return "Student Marks Sheet";
      case "/reports/exam-result":
        return "Exam Results";
      case "/reports/subject-wise":
        return "Subject-wise Analysis Report";
      case "/reports/missing-marks":
        return "Missing Marks Report";
      default:
        return "Student Examination System";
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-6 shrink-0 no-print">
      <h1 className="text-lg font-bold text-gray-800">{title}</h1>
    </header>
  );
}

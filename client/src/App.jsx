import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Overview Dashboard
import Dashboard from "./pages/Dashboard";

// Data Entry Screens
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Exams from "./pages/Exams";
import Enrollment from "./pages/Enrollment";
import MarksEntry from "./pages/MarksEntry";

// Report Screens
import StudentListReport from "./pages/reports/StudentListReport";
import ExamSubjectList from "./pages/reports/ExamSubjectList";
import EnrollmentList from "./pages/reports/EnrollmentList";
import MarksSheet from "./pages/reports/MarksSheet";
import ExamResult from "./pages/reports/ExamResult";
import SubjectWiseReport from "./pages/reports/SubjectWiseReport";
import MissingMarksReport from "./pages/reports/MissingMarksReport";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Overview Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Data Entry */}
          <Route path="/students" element={<Students />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/marks-entry" element={<MarksEntry />} />

          {/* Reports */}
          <Route path="/reports/student-list" element={<StudentListReport />} />
          <Route path="/reports/exam-subjects" element={<ExamSubjectList />} />
          <Route path="/reports/enrollment-list" element={<EnrollmentList />} />
          <Route path="/reports/marks-sheet" element={<MarksSheet />} />
          <Route path="/reports/exam-result" element={<ExamResult />} />
          <Route path="/reports/subject-wise" element={<SubjectWiseReport />} />
          <Route path="/reports/missing-marks" element={<MissingMarksReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import API from "./axiosConfig";

export const getStudentListReport = (params) => API.get("/reports/student-list", { params });
export const getExamSubjectsReport = (examId) => API.get(`/reports/exam-subjects?examId=${examId}`);
export const getEnrollmentListReport = (examId) => API.get(`/reports/enrollment-list?examId=${examId}`);
export const getMarksSheet = (examId, studentId) => API.get(`/reports/marks-sheet?examId=${examId}&studentId=${studentId}`);
export const getExamResult = (examId) => API.get(`/reports/exam-result?examId=${examId}`);
export const exportExamResultCSV = (examId) => API.get(`/reports/exam-result/export?examId=${examId}`, { responseType: "blob" });
export const getSubjectWiseReport = (examId) => API.get(`/reports/subject-wise?examId=${examId}`);
export const getMissingMarksReport = (examId) => API.get(`/reports/missing-marks?examId=${examId}`);

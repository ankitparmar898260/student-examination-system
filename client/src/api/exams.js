import API from "./axiosConfig";

export const getExams = () => API.get("/exams");
export const getExamById = (id) => API.get(`/exams/${id}`);
export const addExam = (data) => API.post("/exams", data);
export const updateExam = (id, data) => API.put(`/exams/${id}`, data);
export const getExamSubjects = (id) => API.get(`/exams/${id}/subjects`);

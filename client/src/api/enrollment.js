import API from "./axiosConfig";

export const getEnrolledStudents = (examId) => API.get(`/enrollment?examId=${examId}`);
export const getAvailableStudents = (examId) => API.get(`/enrollment/available?examId=${examId}`);
export const enrollStudents = (data) => API.post("/enrollment", data);

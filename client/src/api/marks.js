import API from "./axiosConfig";

export const getMarks = (examId, subjectId) => API.get(`/marks?examId=${examId}&subjectId=${subjectId}`);
export const saveMarksBulk = (data) => API.post("/marks/bulk", data);

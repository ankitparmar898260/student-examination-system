import API from "./axiosConfig";

export const getSubjects = () => API.get("/subjects");
export const addSubject = (data) => API.post("/subjects", data);
export const updateSubject = (id, data) => API.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

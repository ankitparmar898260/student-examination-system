import API from './axiosConfig';

export interface Subject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
}

export interface SubjectFormData {
  subjectCode: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
}

export const getSubjects = () => API.get<Subject[]>('/subjects');
export const addSubject = (data: SubjectFormData) => API.post<Subject>('/subjects', data);
export const updateSubject = (id: number, data: SubjectFormData) => API.put(`/subjects/${id}`, data);
export const deleteSubject = (id: number) => API.delete(`/subjects/${id}`);

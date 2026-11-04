import API from './axiosConfig';
import { Subject } from './subjects';

export interface ExamListItem {
  examId: number;
  examName: string;
  academicYear: string;
  subjectCount: number;
}

export interface ExamDetail {
  examId: number;
  examName: string;
  academicYear: string;
  subjectIds: number[];
}

export interface ExamFormData {
  examName: string;
  academicYear: string;
  subjectIds: number[];
}

export const getExams = () => API.get<ExamListItem[]>('/exams');
export const getExamById = (id: number) => API.get<ExamDetail>(`/exams/${id}`);
export const addExam = (data: ExamFormData) => API.post<ExamDetail>('/exams', data);
export const updateExam = (id: number, data: ExamFormData) => API.put(`/exams/${id}`, data);
export const getExamSubjects = (id: number) => API.get<Subject[]>(`/exams/${id}/subjects`);

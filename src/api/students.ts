import API from './axiosConfig';

export interface Student {
  studentId: number;
  rollNumber: string;
  fullName: string;
  email: string;
  department: string;
}

export interface StudentFormData {
  rollNumber: string;
  fullName: string;
  email: string;
  department: string;
}

export const getStudents = () => API.get<Student[]>('/students');
export const addStudent = (data: StudentFormData) => API.post<Student>('/students', data);
export const updateStudent = (id: number, data: StudentFormData) => API.put(`/students/${id}`, data);
export const deleteStudent = (id: number) => API.delete(`/students/${id}`);

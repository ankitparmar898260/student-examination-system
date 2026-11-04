import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATA STORE (Faithful reproduction of EF Core DbContext) ---
interface Student {
  studentId: number;
  rollNumber: string;
  fullName: string;
  email: string;
  department: string;
}

interface Subject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
}

interface Exam {
  examId: number;
  examName: string;
  academicYear: string;
}

interface ExamSubject {
  examSubjectId: number;
  examId: number;
  subjectId: number;
}

interface StudentExamEnrollment {
  enrollmentId: number;
  studentId: number;
  examId: number;
}

interface StudentMark {
  markId: number;
  enrollmentId: number;
  subjectId: number;
  marksObtained: number;
}

// In-memory collections
let students: Student[] = [
  { studentId: 1, rollNumber: 'CS001', fullName: 'Rahul Kumar', email: 'rahul.kumar@college.edu', department: 'CS' },
  { studentId: 2, rollNumber: 'CS002', fullName: 'Priya Singh', email: 'priya.singh@college.edu', department: 'IT' },
  { studentId: 3, rollNumber: 'CS003', fullName: 'Amit Verma', email: 'amit.verma@college.edu', department: 'CS' },
  { studentId: 4, rollNumber: 'CS004', fullName: 'Sneha Patel', email: 'sneha.patel@college.edu', department: 'EC' },
  { studentId: 5, rollNumber: 'CS005', fullName: 'Vikash Shah', email: 'vikash.shah@college.edu', department: 'CS' },
];

let subjects: Subject[] = [
  { subjectId: 1, subjectCode: 'MATH101', subjectName: 'Mathematics', maxMarks: 100, passMarks: 40 },
  { subjectId: 2, subjectCode: 'PHY101', subjectName: 'Physics', maxMarks: 100, passMarks: 40 },
  { subjectId: 3, subjectCode: 'CHEM101', subjectName: 'Chemistry', maxMarks: 100, passMarks: 40 },
  { subjectId: 4, subjectCode: 'ENG101', subjectName: 'English', maxMarks: 50, passMarks: 20 },
];

let exams: Exam[] = [
  { examId: 1, examName: 'Mid Term', academicYear: '2024-25' },
  { examId: 2, examName: 'Final Exam', academicYear: '2024-25' },
];

let examSubjects: ExamSubject[] = [
  { examSubjectId: 1, examId: 1, subjectId: 1 },
  { examSubjectId: 2, examId: 1, subjectId: 2 },
  { examSubjectId: 3, examId: 1, subjectId: 4 },
  { examSubjectId: 4, examId: 2, subjectId: 1 },
  { examSubjectId: 5, examId: 2, subjectId: 2 },
  { examSubjectId: 6, examId: 2, subjectId: 3 },
  { examSubjectId: 7, examId: 2, subjectId: 4 },
];

let enrollments: StudentExamEnrollment[] = [
  { enrollmentId: 1, examId: 1, studentId: 1 },
  { enrollmentId: 2, examId: 1, studentId: 2 },
  { enrollmentId: 3, examId: 1, studentId: 3 },
  { enrollmentId: 4, examId: 1, studentId: 4 },
  { enrollmentId: 5, examId: 2, studentId: 1 },
  { enrollmentId: 6, examId: 2, studentId: 2 },
];

let studentMarks: StudentMark[] = [
  // Exam 1 (Mid Term): MATH101 (id 1, max 100), PHY101 (id 2, max 100), ENG101 (id 4, max 50)
  // Enrollment 1 (Rahul Kumar - all passed)
  { markId: 1, enrollmentId: 1, subjectId: 1, marksObtained: 85 },
  { markId: 2, enrollmentId: 1, subjectId: 2, marksObtained: 78 },
  { markId: 3, enrollmentId: 1, subjectId: 4, marksObtained: 45 },
  // Enrollment 2 (Priya Singh - failed physics)
  { markId: 4, enrollmentId: 2, subjectId: 1, marksObtained: 65 },
  { markId: 5, enrollmentId: 2, subjectId: 2, marksObtained: 32 },
  { markId: 6, enrollmentId: 2, subjectId: 4, marksObtained: 40 },
  // Enrollment 4 (Sneha Patel - all passed)
  { markId: 7, enrollmentId: 4, subjectId: 1, marksObtained: 92 },
  { markId: 8, enrollmentId: 4, subjectId: 2, marksObtained: 88 },
  { markId: 9, enrollmentId: 4, subjectId: 4, marksObtained: 42 },
  // Note: Enrollment 3 (Amit Verma) has missing marks for Physics & English to demonstrate Report 7 & Incomplete state!
  { markId: 10, enrollmentId: 3, subjectId: 1, marksObtained: 70 },
];

let nextStudentId = 6;
let nextSubjectId = 5;
let nextExamId = 3;
let nextExamSubjectId = 8;
let nextEnrollmentId = 7;
let nextMarkId = 11;

// --- API ROUTER ---
const api = express.Router();

// ================= STUDENTS CONTROLLER =================
api.get('/students', (req, res) => {
  const result = [...students]
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber))
    .map(s => ({
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      fullName: s.fullName,
      email: s.email,
      department: s.department,
    }));
  res.json(result);
});

api.post('/students', (req, res) => {
  const { rollNumber, fullName, email, department } = req.body || {};
  if (!rollNumber?.trim() || !fullName?.trim() || !email?.trim() || !department?.trim()) {
    return res.status(400).json({ message: 'All student fields are required.' });
  }

  const cleanRoll = rollNumber.trim();
  const cleanEmail = email.trim();

  if (students.some(s => s.rollNumber.toLowerCase() === cleanRoll.toLowerCase())) {
    return res.status(400).json({ message: `Roll Number '${cleanRoll}' is already in use.` });
  }

  if (students.some(s => s.email.toLowerCase() === cleanEmail.toLowerCase())) {
    return res.status(400).json({ message: `Email '${cleanEmail}' is already registered.` });
  }

  const newStudent: Student = {
    studentId: nextStudentId++,
    rollNumber: cleanRoll,
    fullName: fullName.trim(),
    email: cleanEmail,
    department: department.trim(),
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

api.put('/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const student = students.find(s => s.studentId === id);
  if (!student) {
    return res.status(404).json({ message: `Student with ID ${id} not found.` });
  }

  const { rollNumber, fullName, email, department } = req.body || {};
  if (!rollNumber?.trim() || !fullName?.trim() || !email?.trim() || !department?.trim()) {
    return res.status(400).json({ message: 'All student fields are required.' });
  }

  const cleanRoll = rollNumber.trim();
  const cleanEmail = email.trim();

  if (students.some(s => s.studentId !== id && s.rollNumber.toLowerCase() === cleanRoll.toLowerCase())) {
    return res.status(400).json({ message: `Roll Number '${cleanRoll}' is already in use by another student.` });
  }

  if (students.some(s => s.studentId !== id && s.email.toLowerCase() === cleanEmail.toLowerCase())) {
    return res.status(400).json({ message: `Email '${cleanEmail}' is already registered to another student.` });
  }

  student.rollNumber = cleanRoll;
  student.fullName = fullName.trim();
  student.email = cleanEmail;
  student.department = department.trim();

  res.json({ message: 'Student updated successfully.' });
});

api.delete('/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = students.findIndex(s => s.studentId === id);
  if (index === -1) {
    return res.status(404).json({ message: `Student with ID ${id} not found.` });
  }

  // Cascade delete enrollments and marks
  const studentEnrollments = enrollments.filter(e => e.studentId === id);
  const enrollmentIds = studentEnrollments.map(e => e.enrollmentId);
  studentMarks = studentMarks.filter(m => !enrollmentIds.includes(m.enrollmentId));
  enrollments = enrollments.filter(e => e.studentId !== id);
  students.splice(index, 1);

  res.json({ message: 'Student deleted successfully.' });
});

// ================= SUBJECTS CONTROLLER =================
api.get('/subjects', (req, res) => {
  const result = [...subjects]
    .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode))
    .map(s => ({
      subjectId: s.subjectId,
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      maxMarks: s.maxMarks,
      passMarks: s.passMarks,
    }));
  res.json(result);
});

api.post('/subjects', (req, res) => {
  const { subjectCode, subjectName, maxMarks, passMarks } = req.body || {};
  if (!subjectCode?.trim() || !subjectName?.trim() || maxMarks == null || passMarks == null) {
    return res.status(400).json({ message: 'All subject fields are required.' });
  }

  const max = Number(maxMarks);
  const pass = Number(passMarks);

  if (isNaN(max) || max <= 0 || isNaN(pass) || pass <= 0) {
    return res.status(400).json({ message: 'Marks must be positive numbers.' });
  }

  if (pass > max) {
    return res.status(400).json({ message: 'PassMarks cannot exceed MaxMarks.' });
  }

  const newSubject: Subject = {
    subjectId: nextSubjectId++,
    subjectCode: subjectCode.trim(),
    subjectName: subjectName.trim(),
    maxMarks: max,
    passMarks: pass,
  };

  subjects.push(newSubject);
  res.status(201).json(newSubject);
});

api.put('/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const subject = subjects.find(s => s.subjectId === id);
  if (!subject) {
    return res.status(404).json({ message: `Subject with ID ${id} not found.` });
  }

  const { subjectCode, subjectName, maxMarks, passMarks } = req.body || {};
  if (!subjectCode?.trim() || !subjectName?.trim() || maxMarks == null || passMarks == null) {
    return res.status(400).json({ message: 'All subject fields are required.' });
  }

  const max = Number(maxMarks);
  const pass = Number(passMarks);

  if (pass > max) {
    return res.status(400).json({ message: 'PassMarks cannot exceed MaxMarks.' });
  }

  subject.subjectCode = subjectCode.trim();
  subject.subjectName = subjectName.trim();
  subject.maxMarks = max;
  subject.passMarks = pass;

  res.json({ message: 'Subject updated successfully.' });
});

api.delete('/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = subjects.findIndex(s => s.subjectId === id);
  if (index === -1) {
    return res.status(404).json({ message: `Subject with ID ${id} not found.` });
  }

  // Remove examSubject associations and marks
  examSubjects = examSubjects.filter(es => es.subjectId !== id);
  studentMarks = studentMarks.filter(sm => sm.subjectId !== id);
  subjects.splice(index, 1);

  res.json({ message: 'Subject deleted successfully.' });
});

// ================= EXAMS CONTROLLER =================
api.get('/exams', (req, res) => {
  const result = [...exams]
    .sort((a, b) => b.examId - a.examId)
    .map(e => ({
      examId: e.examId,
      examName: e.examName,
      academicYear: e.academicYear,
      subjectCount: examSubjects.filter(es => es.examId === e.examId).length,
    }));
  res.json(result);
});

api.get('/exams/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const exam = exams.find(e => e.examId === id);
  if (!exam) {
    return res.status(404).json({ message: `Exam with ID ${id} not found.` });
  }

  const assignedSubjectIds = examSubjects.filter(es => es.examId === id).map(es => es.subjectId);
  res.json({
    examId: exam.examId,
    examName: exam.examName,
    academicYear: exam.academicYear,
    subjectIds: assignedSubjectIds,
  });
});

api.get('/exams/:id/subjects', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const assigned = examSubjects
    .filter(es => es.examId === id)
    .map(es => subjects.find(s => s.subjectId === es.subjectId))
    .filter((s): s is Subject => !!s)
    .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

  res.json(assigned);
});

api.post('/exams', (req, res) => {
  const { examName, academicYear, subjectIds } = req.body || {};
  if (!examName?.trim() || !academicYear?.trim()) {
    return res.status(400).json({ message: 'Exam Name and Academic Year are required.' });
  }

  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return res.status(400).json({ message: 'At least one subject must be assigned to the exam.' });
  }

  // Check all subjectIds exist
  const uniqueIds = Array.from(new Set(subjectIds.map(Number)));
  const existingCount = subjects.filter(s => uniqueIds.includes(s.subjectId)).length;
  if (existingCount !== uniqueIds.length) {
    return res.status(400).json({ message: 'One or more selected subjects do not exist.' });
  }

  const newExam: Exam = {
    examId: nextExamId++,
    examName: examName.trim(),
    academicYear: academicYear.trim(),
  };
  exams.push(newExam);

  for (const sId of uniqueIds) {
    examSubjects.push({
      examSubjectId: nextExamSubjectId++,
      examId: newExam.examId,
      subjectId: sId,
    });
  }

  res.status(201).json({
    examId: newExam.examId,
    examName: newExam.examName,
    academicYear: newExam.academicYear,
    subjectIds: uniqueIds,
  });
});

api.put('/exams/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const exam = exams.find(e => e.examId === id);
  if (!exam) {
    return res.status(404).json({ message: `Exam with ID ${id} not found.` });
  }

  const { examName, academicYear, subjectIds } = req.body || {};
  if (!examName?.trim() || !academicYear?.trim()) {
    return res.status(400).json({ message: 'Exam Name and Academic Year are required.' });
  }

  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return res.status(400).json({ message: 'At least one subject must be assigned to the exam.' });
  }

  const uniqueIds = Array.from(new Set(subjectIds.map(Number)));
  exam.examName = examName.trim();
  exam.academicYear = academicYear.trim();

  // Replace subject associations
  examSubjects = examSubjects.filter(es => es.examId !== id);
  for (const sId of uniqueIds) {
    examSubjects.push({
      examSubjectId: nextExamSubjectId++,
      examId: id,
      subjectId: sId,
    });
  }

  res.json({ message: 'Exam updated successfully.' });
});

// ================= ENROLLMENT CONTROLLER =================
api.get('/enrollment', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const enrolled = enrollments
    .filter(e => e.examId === examId)
    .map(e => {
      const student = students.find(s => s.studentId === e.studentId);
      return {
        enrollmentId: e.enrollmentId,
        studentId: e.studentId,
        rollNumber: student?.rollNumber || '',
        fullName: student?.fullName || '',
        email: student?.email || '',
        department: student?.department || '',
      };
    })
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

  res.json(enrolled);
});

api.get('/enrollment/available', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const enrolledStudentIds = enrollments.filter(e => e.examId === examId).map(e => e.studentId);
  const available = students
    .filter(s => !enrolledStudentIds.includes(s.studentId))
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber))
    .map(s => ({
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      fullName: s.fullName,
      department: s.department,
    }));

  res.json(available);
});

api.post('/enrollment', (req, res) => {
  const { examId, studentIds } = req.body || {};
  const examIdNum = Number(examId);

  const examExists = exams.some(e => e.examId === examIdNum);
  if (!examExists) {
    return res.status(404).json({ message: `Exam with ID ${examId} not found.` });
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: 'Please select at least one student to enroll.' });
  }

  const alreadyEnrolled = enrollments.filter(e => e.examId === examIdNum).map(e => e.studentId);
  const requestedIds = Array.from(new Set(studentIds.map(Number)));
  const newIds = requestedIds.filter(id => !alreadyEnrolled.includes(id));

  if (newIds.length === 0) {
    return res.status(400).json({ message: 'All selected students are already enrolled in this exam.' });
  }

  for (const sId of newIds) {
    enrollments.push({
      enrollmentId: nextEnrollmentId++,
      examId: examIdNum,
      studentId: sId,
    });
  }

  res.json({
    message: `${newIds.length} student(s) successfully enrolled.`,
    skippedCount: requestedIds.length - newIds.length,
  });
});

// ================= MARKS CONTROLLER =================
api.get('/marks', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  const subjectId = parseInt(req.query.subjectId as string, 10);

  if (isNaN(examId) || isNaN(subjectId) || examId <= 0 || subjectId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId and SubjectId are required.' });
  }

  const isSubjectInExam = examSubjects.some(es => es.examId === examId && es.subjectId === subjectId);
  if (!isSubjectInExam) {
    return res.status(400).json({ message: 'The selected subject does not belong to this exam.' });
  }

  const examEnrollments = enrollments.filter(e => e.examId === examId);
  const grid = examEnrollments.map(e => {
    const student = students.find(s => s.studentId === e.studentId);
    const existing = studentMarks.find(sm => sm.enrollmentId === e.enrollmentId && sm.subjectId === subjectId);
    return {
      enrollmentId: e.enrollmentId,
      studentId: e.studentId,
      rollNumber: student?.rollNumber || '',
      fullName: student?.fullName || '',
      marksObtained: existing ? existing.marksObtained : null,
    };
  }).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

  res.json(grid);
});

api.post('/marks/bulk', (req, res) => {
  const { examId, subjectId, marks } = req.body || {};
  const examIdNum = Number(examId);
  const subjectIdNum = Number(subjectId);

  const isSubjectInExam = examSubjects.some(es => es.examId === examIdNum && es.subjectId === subjectIdNum);
  if (!isSubjectInExam) {
    return res.status(400).json({ message: 'The selected subject does not belong to this exam.' });
  }

  const subject = subjects.find(s => s.subjectId === subjectIdNum);
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found.' });
  }

  if (!Array.isArray(marks)) {
    return res.status(400).json({ message: 'Invalid marks array.' });
  }

  // Validate range 0 to maxMarks
  for (const m of marks) {
    const val = Number(m.marksObtained);
    if (isNaN(val) || val < 0 || val > subject.maxMarks) {
      return res.status(400).json({ message: `Marks must be between 0 and ${subject.maxMarks}.` });
    }
  }

  const validEnrollments = enrollments.filter(e => e.examId === examIdNum).map(e => e.enrollmentId);

  for (const m of marks) {
    const eId = Number(m.enrollmentId);
    if (!validEnrollments.includes(eId)) {
      return res.status(400).json({ message: `Enrollment ID ${eId} is not valid for this exam.` });
    }

    const val = Number(m.marksObtained);
    const existing = studentMarks.find(sm => sm.enrollmentId === eId && sm.subjectId === subjectIdNum);
    if (existing) {
      existing.marksObtained = val;
    } else {
      studentMarks.push({
        markId: nextMarkId++,
        enrollmentId: eId,
        subjectId: subjectIdNum,
        marksObtained: val,
      });
    }
  }

  res.json({ message: 'All marks saved successfully.' });
});

// ================= REPORTS CONTROLLER =================

// Helper: Build Exam Results with Ranks and Business Rules
function buildExamResults(examId: number) {
  const assignedSubjectIds = examSubjects.filter(es => es.examId === examId).map(es => es.subjectId);
  const examSubjs = subjects.filter(s => assignedSubjectIds.includes(s.subjectId));
  const totalMaxMarks = examSubjs.reduce((sum, s) => sum + s.maxMarks, 0);

  const examEnrollments = enrollments.filter(e => e.examId === examId);

  const items = examEnrollments.map(enrollment => {
    const student = students.find(s => s.studentId === enrollment.studentId);
    const marksForStudent = studentMarks.filter(sm => sm.enrollmentId === enrollment.enrollmentId);

    let hasMissing = false;
    let hasFailed = false;
    let totalObtained = 0;

    for (const sub of examSubjs) {
      const mark = marksForStudent.find(m => m.subjectId === sub.subjectId);
      if (!mark || mark.marksObtained == null) {
        hasMissing = true;
      } else {
        totalObtained += mark.marksObtained;
        if (mark.marksObtained < sub.passMarks) {
          hasFailed = true;
        }
      }
    }

    let overallResult: 'Pass' | 'Fail' | 'Incomplete';
    let percentage: number | null = null;
    let finalTotal: number | null = null;

    if (hasMissing) {
      overallResult = 'Incomplete';
    } else if (hasFailed) {
      overallResult = 'Fail';
      finalTotal = totalObtained;
      percentage = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 10000) / 100 : 0;
    } else {
      overallResult = 'Pass';
      finalTotal = totalObtained;
      percentage = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 10000) / 100 : 0;
    }

    return {
      rank: null as number | null,
      rollNumber: student?.rollNumber || '',
      fullName: student?.fullName || '',
      department: student?.department || '',
      totalObtained: finalTotal,
      totalMaxMarks,
      percentage,
      overallResult,
    };
  });

  // Assign ranks only to Pass students based on totalObtained DESC
  const passStudents = items
    .filter(i => i.overallResult === 'Pass' && i.totalObtained != null)
    .sort((a, b) => (b.totalObtained || 0) - (a.totalObtained || 0));

  let currentRank = 1;
  for (const p of passStudents) {
    p.rank = currentRank++;
  }

  // Sort order: Pass first (by rank ASC), then Fail, then Incomplete
  return items.sort((a, b) => {
    const orderScore = (res: string) => (res === 'Pass' ? 0 : res === 'Fail' ? 1 : 2);
    const diff = orderScore(a.overallResult) - orderScore(b.overallResult);
    if (diff !== 0) return diff;
    if (a.rank && b.rank) return a.rank - b.rank;
    return a.rollNumber.localeCompare(b.rollNumber);
  });
}

// 1. Student List Report with Department & Search
api.get('/reports/student-list', (req, res) => {
  const department = (req.query.department as string)?.trim();
  const search = (req.query.search as string)?.trim().toLowerCase();

  let list = [...students];

  if (department && department !== 'All') {
    list = list.filter(s => s.department.toLowerCase() === department.toLowerCase());
  }

  if (search) {
    list = list.filter(s =>
      s.fullName.toLowerCase().includes(search) ||
      s.rollNumber.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search)
    );
  }

  list.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  res.json(list);
});

// Distinct departments
api.get('/reports/departments', (req, res) => {
  const depts = Array.from(new Set(students.map(s => s.department))).sort();
  res.json(depts);
});

// 2. Exam-wise Subject List Report
api.get('/reports/exam-subjects', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const assignedSubjectIds = examSubjects.filter(es => es.examId === examId).map(es => es.subjectId);
  const examSubjs = subjects
    .filter(s => assignedSubjectIds.includes(s.subjectId))
    .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

  res.json(examSubjs);
});

// 3. Exam-wise Enrollment List Report
api.get('/reports/enrollment-list', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const list = enrollments
    .filter(e => e.examId === examId)
    .map(e => {
      const student = students.find(s => s.studentId === e.studentId);
      return {
        enrollmentId: e.enrollmentId,
        rollNumber: student?.rollNumber || '',
        fullName: student?.fullName || '',
        email: student?.email || '',
        department: student?.department || '',
      };
    })
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

  res.json(list);
});

// 4. Student Marks Sheet Report
api.get('/reports/marks-sheet', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  const studentId = parseInt(req.query.studentId as string, 10);

  if (isNaN(examId) || isNaN(studentId) || examId <= 0 || studentId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId and StudentId are required.' });
  }

  const exam = exams.find(e => e.examId === examId);
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found.' });
  }

  const student = students.find(s => s.studentId === studentId);
  const enrollment = enrollments.find(e => e.examId === examId && e.studentId === studentId);
  if (!enrollment || !student) {
    return res.status(404).json({ message: 'Student is not enrolled in this exam.' });
  }

  const assignedSubjectIds = examSubjects.filter(es => es.examId === examId).map(es => es.subjectId);
  const examSubjs = subjects
    .filter(s => assignedSubjectIds.includes(s.subjectId))
    .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

  const marksForStudent = studentMarks.filter(sm => sm.enrollmentId === enrollment.enrollmentId);

  let totalMaxMarks = 0;
  let totalObtained = 0;
  let hasMissingMarks = false;
  let hasFailedSubject = false;

  const subjectsReport = examSubjs.map(sub => {
    totalMaxMarks += sub.maxMarks;
    const markEntry = marksForStudent.find(m => m.subjectId === sub.subjectId);
    const obtained = markEntry ? markEntry.marksObtained : null;

    let status = 'Missing';
    if (obtained == null) {
      hasMissingMarks = true;
    } else {
      totalObtained += obtained;
      if (obtained >= sub.passMarks) {
        status = 'Pass';
      } else {
        status = 'Fail';
        hasFailedSubject = true;
      }
    }

    return {
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      maxMarks: sub.maxMarks,
      passMarks: sub.passMarks,
      marksObtained: obtained,
      status,
    };
  });

  let overallResult = 'Pass';
  let percentage: number | null = null;

  if (hasMissingMarks) {
    overallResult = 'Incomplete';
  } else if (hasFailedSubject) {
    overallResult = 'Fail';
    percentage = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 10000) / 100 : 0;
  } else {
    overallResult = 'Pass';
    percentage = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 10000) / 100 : 0;
  }

  res.json({
    studentName: student.fullName,
    rollNumber: student.rollNumber,
    department: student.department,
    examName: exam.examName,
    academicYear: exam.academicYear,
    subjects: subjectsReport,
    totalMaxMarks,
    totalObtained,
    percentage,
    overallResult,
  });
});

// 5. Exam Result List Report
api.get('/reports/exam-result', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const results = buildExamResults(examId);
  res.json(results);
});

// 5b. CSV Export for Exam Result Report
api.get('/reports/exam-result/export', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const results = buildExamResults(examId);
  const rows: string[] = ['Rank,RollNumber,FullName,Department,TotalObtained,TotalMaxMarks,Percentage,OverallResult'];

  for (const r of results) {
    const rankStr = r.rank != null ? r.rank.toString() : '-';
    const obtainedStr = r.totalObtained != null ? r.totalObtained.toFixed(2) : '-';
    const pctStr = r.percentage != null ? `${r.percentage.toFixed(2)}%` : '-';
    rows.push(`"${rankStr}","${r.rollNumber}","${r.fullName}","${r.department}","${obtainedStr}","${r.totalMaxMarks}","${pctStr}","${r.overallResult}"`);
  }

  const csvContent = rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ExamResult_Exam_${examId}.csv"`);
  res.send(csvContent);
});

// 6. Subject-Wise Analytics Report
api.get('/reports/subject-wise', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const assignedSubjectIds = examSubjects.filter(es => es.examId === examId).map(es => es.subjectId);
  const examSubjs = subjects.filter(s => assignedSubjectIds.includes(s.subjectId));
  const examEnrollmentIds = enrollments.filter(e => e.examId === examId).map(e => e.enrollmentId);

  const report = examSubjs.map(sub => {
    const marks = studentMarks.filter(sm => sm.subjectId === sub.subjectId && examEnrollmentIds.includes(sm.enrollmentId));
    const highestMarks = marks.length > 0 ? Math.max(...marks.map(m => m.marksObtained)) : 0;
    const averageMarks = marks.length > 0 ? Math.round((marks.reduce((a, b) => a + b.marksObtained, 0) / marks.length) * 100) / 100 : 0;
    const failedStudentsCount = marks.filter(m => m.marksObtained < sub.passMarks).length;

    return {
      subjectId: sub.subjectId,
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      highestMarks,
      averageMarks,
      failedStudentsCount,
      totalEvaluatedCount: marks.length,
    };
  }).sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

  res.json(report);
});

// 7. Missing Marks Report
api.get('/reports/missing-marks', (req, res) => {
  const examId = parseInt(req.query.examId as string, 10);
  if (isNaN(examId) || examId <= 0) {
    return res.status(400).json({ message: 'Valid ExamId is required.' });
  }

  const assignedSubjectIds = examSubjects.filter(es => es.examId === examId).map(es => es.subjectId);
  const examSubjs = subjects.filter(s => assignedSubjectIds.includes(s.subjectId));
  const examEnrollments = enrollments.filter(e => e.examId === examId);

  const missingList: Array<{
    enrollmentId: number;
    rollNumber: string;
    fullName: string;
    department: string;
    subjectCode: string;
    subjectName: string;
  }> = [];

  for (const enrollment of examEnrollments) {
    const student = students.find(s => s.studentId === enrollment.studentId);
    for (const sub of examSubjs) {
      const hasMark = studentMarks.some(sm => sm.enrollmentId === enrollment.enrollmentId && sm.subjectId === sub.subjectId);
      if (!hasMark) {
        missingList.push({
          enrollmentId: enrollment.enrollmentId,
          rollNumber: student?.rollNumber || '',
          fullName: student?.fullName || '',
          department: student?.department || '',
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
        });
      }
    }
  }

  missingList.sort((a, b) => {
    const r = a.rollNumber.localeCompare(b.rollNumber);
    if (r !== 0) return r;
    return a.subjectCode.localeCompare(b.subjectCode);
  });

  res.json(missingList);
});

// Mount API router
app.use('/api', api);

// Dev / Prod Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

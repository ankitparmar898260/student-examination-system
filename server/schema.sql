-- =====================================================================
-- Student Examination System - Complete Database Script (MySQL 8.0)
-- Database Name: student_exam_db
-- =====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS student_exam_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_exam_db;

-- ---------------------------------------------------------------------
-- Drop tables if you want a fresh reset (ordered to respect Foreign Keys)
-- (Agar purana data clear karke fresh tables banani ho, to neeche wali lines uncomment karein)
-- ---------------------------------------------------------------------
-- DROP TABLE IF EXISTS StudentMarks;
-- DROP TABLE IF EXISTS StudentExamEnrollments;
-- DROP TABLE IF EXISTS ExamSubjects;
-- DROP TABLE IF EXISTS Exams;
-- DROP TABLE IF EXISTS Subjects;
-- DROP TABLE IF EXISTS Students;

-- ---------------------------------------------------------------------
-- 1. Students Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Students (
  StudentId    INT AUTO_INCREMENT PRIMARY KEY,
  RollNumber   VARCHAR(50)  NOT NULL,
  FullName     VARCHAR(150) NOT NULL,
  Email        VARCHAR(150) NOT NULL,
  Department   VARCHAR(100) NOT NULL,
  CONSTRAINT uq_students_rollnumber UNIQUE (RollNumber),
  CONSTRAINT uq_students_email UNIQUE (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Subjects Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Subjects (
  SubjectId    INT AUTO_INCREMENT PRIMARY KEY,
  SubjectCode  VARCHAR(50)  NOT NULL,
  SubjectName  VARCHAR(150) NOT NULL,
  MaxMarks     INT NOT NULL,
  PassMarks    INT NOT NULL,
  CONSTRAINT chk_passmarks CHECK (PassMarks <= MaxMarks)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Exams Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Exams (
  ExamId        INT AUTO_INCREMENT PRIMARY KEY,
  ExamName      VARCHAR(150) NOT NULL,
  AcademicYear  VARCHAR(20)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. ExamSubjects Table (Exam <-> Subject Mapping)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ExamSubjects (
  ExamSubjectId INT AUTO_INCREMENT PRIMARY KEY,
  ExamId        INT NOT NULL,
  SubjectId     INT NOT NULL,
  CONSTRAINT fk_examsubjects_exam FOREIGN KEY (ExamId)
    REFERENCES Exams(ExamId) ON DELETE CASCADE,
  CONSTRAINT fk_examsubjects_subject FOREIGN KEY (SubjectId)
    REFERENCES Subjects(SubjectId) ON DELETE CASCADE,
  CONSTRAINT uq_examsubjects_exam_subject UNIQUE (ExamId, SubjectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. StudentExamEnrollments Table (Student <-> Exam Enrollment)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS StudentExamEnrollments (
  EnrollmentId INT AUTO_INCREMENT PRIMARY KEY,
  StudentId    INT NOT NULL,
  ExamId       INT NOT NULL,
  CONSTRAINT fk_enrollments_student FOREIGN KEY (StudentId)
    REFERENCES Students(StudentId) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_exam FOREIGN KEY (ExamId)
    REFERENCES Exams(ExamId) ON DELETE CASCADE,
  CONSTRAINT uq_enrollments_student_exam UNIQUE (StudentId, ExamId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. StudentMarks Table (Marks per Subject for an Enrollment)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS StudentMarks (
  MarkId         INT AUTO_INCREMENT PRIMARY KEY,
  EnrollmentId   INT            NOT NULL,
  SubjectId      INT            NOT NULL,
  MarksObtained  DECIMAL(8,2)   NOT NULL,
  CONSTRAINT fk_marks_enrollment FOREIGN KEY (EnrollmentId)
    REFERENCES StudentExamEnrollments(EnrollmentId) ON DELETE CASCADE,
  CONSTRAINT fk_marks_subject FOREIGN KEY (SubjectId)
    REFERENCES Subjects(SubjectId) ON DELETE CASCADE,
  CONSTRAINT uq_marks_enrollment_subject UNIQUE (EnrollmentId, SubjectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- OPTIONAL: Sample Test Data (Testing aur Verification ke liye)
-- =====================================================================

-- 1. Insert Sample Students
INSERT IGNORE INTO Students (StudentId, RollNumber, FullName, Email, Department) VALUES
(1, 'CS2026-001', 'Rahul Sharma', 'rahul.sharma@example.com', 'Computer Science'),
(2, 'CS2026-002', 'Priya Patel', 'priya.patel@example.com', 'Computer Science'),
(3, 'IT2026-001', 'Amit Kumar', 'amit.kumar@example.com', 'Information Technology'),
(4, 'IT2026-002', 'Sneha Verma', 'sneha.verma@example.com', 'Information Technology'),
(5, 'EC2026-001', 'Vikas Singh', 'vikas.singh@example.com', 'Electronics');

-- 2. Insert Sample Subjects
INSERT IGNORE INTO Subjects (SubjectId, SubjectCode, SubjectName, MaxMarks, PassMarks) VALUES
(1, 'CS101', 'Database Management Systems', 100, 40),
(2, 'CS102', 'Data Structures & Algorithms', 100, 40),
(3, 'IT101', 'Web Application Development', 100, 40),
(4, 'EC101', 'Digital Electronics', 50, 20);

-- 3. Insert Sample Exams 
INSERT IGNORE INTO Exams (ExamId, ExamName, AcademicYear) VALUES
(1, 'Mid Term Examination 2026', '2025-2026'),
(2, 'Final Semester Examination 2026', '2025-2026');

-- 4. Assign Subjects to Exam 1 (Mid Term)
INSERT IGNORE INTO ExamSubjects (ExamId, SubjectId) VALUES
(1, 1), -- DBMS
(1, 2), -- DSA
(1, 3); -- Web Dev

-- 5. Enroll Students in Exam 1
INSERT IGNORE INTO StudentExamEnrollments (EnrollmentId, StudentId, ExamId) VALUES
(1, 1, 1), -- Rahul in Mid Term
(2, 2, 1), -- Priya in Mid Term
(3, 3, 1); -- Amit in Mid Term

-- 6. Insert Marks
-- Rahul (Enrollment 1) - All Pass
INSERT IGNORE INTO StudentMarks (EnrollmentId, SubjectId, MarksObtained) VALUES
(1, 1, 85.50),
(1, 2, 78.00),
(1, 3, 91.00);

-- Priya (Enrollment 2) - Failed in 1 subject (DSA: 32 < 40)
INSERT IGNORE INTO StudentMarks (EnrollmentId, SubjectId, MarksObtained) VALUES
(2, 1, 65.00),
(2, 2, 32.00),
(2, 3, 74.50);

-- Amit (Enrollment 3) - Missing Mark for Subject 3 (To test Missing Marks Report)
INSERT IGNORE INTO StudentMarks (EnrollmentId, SubjectId, MarksObtained) VALUES
(3, 1, 72.00),
(3, 2, 68.50);
-- Subject 3 mark intentionally omitted for Amit so Report 7 works!

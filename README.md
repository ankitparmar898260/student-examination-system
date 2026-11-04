# Student Examination System

A comprehensive, full-stack examination management and reporting system built strictly according to technical assessment requirements.

---

## 🛠️ Tech Stack

- **Backend**: .NET 10 (ASP.NET Core Web API, C#)
- **ORM & Database**: Entity Framework Core 9/10 with `Pomelo.EntityFrameworkCore.MySql` on **MySQL Server 8.0**
- **Frontend**: React 18, Vite, Tailwind CSS v3, React Router v6, Axios
- **Reporting & Export**: Server-side CSV streaming (`/api/reports/exam-result/export`) and print-friendly styling (`@media print`)

---

## 📊 Database Schema (6 Relational Tables)

| Table | Primary Key | Key Columns & Constraints | Description |
|---|---|---|---|
| `Students` | `StudentId` | `RollNumber` (Unique), `FullName`, `Email` (Unique), `Department` | Student records |
| `Subjects` | `SubjectId` | `SubjectCode`, `SubjectName`, `MaxMarks`, `PassMarks` (`CHECK (PassMarks <= MaxMarks)`) | Course subjects |
| `Exams` | `ExamId` | `ExamName`, `AcademicYear` | Exam definitions |
| `ExamSubjects` | `ExamSubjectId` | `ExamId` (FK), `SubjectId` (FK), `UNIQUE(ExamId, SubjectId)` | Maps subjects assigned to each exam |
| `StudentExamEnrollments` | `EnrollmentId` | `StudentId` (FK), `ExamId` (FK), `UNIQUE(StudentId, ExamId)` | Enrolled students per exam |
| `StudentMarks` | `MarkId` | `EnrollmentId` (FK), `SubjectId` (FK), `MarksObtained` (Decimal 5,2), `UNIQUE(EnrollmentId, SubjectId)` | Marks scored per subject |

---

## ⚖️ Business Rules Enforced

1. **Subject Pass Rule**: A subject is passed when `MarksObtained >= PassMarks`.
2. **Exam Pass Rule**: An exam is passed **only when every subject of that exam is passed**. If any subject is failed, the overall result is **Fail**.
3. **Missing Marks Rule**: A student with missing marks for any enrolled exam subject **must never show as Pass** (status shows as **Incomplete**).
4. **Percentage Formula**:
   $$\text{Percentage} = \frac{\text{Total Marks Obtained}}{\text{Total Max Marks}} \times 100$$
5. **PassMarks Validity**: `PassMarks` cannot exceed `MaxMarks` (`PassMarks <= MaxMarks`), validated both on client-side and server-side.
6. **Marks Entry Range**: `0 <= MarksObtained <= MaxMarks`, and the selected subject must strictly belong to the exam.
7. **Unique Enrollment**: A student cannot be enrolled in the same exam more than once.

---

## 📁 Project Structure

```
Student Examination System/
├── server/                                ← .NET 10 Web API Backend
│   ├── Controllers/
│   │   ├── StudentsController.cs          ← Student CRUD & uniqueness check
│   │   ├── SubjectsController.cs          ← Subject CRUD & PassMarks validation
│   │   ├── ExamsController.cs             ← Exam CRUD & Subject assignment
│   │   ├── EnrollmentController.cs        ← Enrollment & duplicate prevention
│   │   ├── MarksController.cs             ← Bulk marks grid & range checks
│   │   └── ReportsController.cs           ← 7 Reports & CSV export endpoint
│   ├── Models/                            ← EF Core Entities (6 tables)
│   ├── DTOs/                              ← Request & Response DTOs
│   ├── Data/
│   │   └── AppDbContext.cs                ← EF Core DbContext & constraints
│   ├── Properties/
│   │   └── launchSettings.json            ← Configured for http://localhost:5000
│   ├── appsettings.json                   ← MySQL connection string
│   └── server.csproj                      ← .NET 10 project file
│
├── client/                                ← React 18 + Vite Frontend
│   ├── src/
│   │   ├── api/                           ← Axios API modules
│   │   ├── components/                    ← Reusable UI components
│   │   │   ├── layout/                    ← Layout, Sidebar, Navbar
│   │   │   └── ui/                        ← Modal, DataTable, FormInput, Badge...
│   │   ├── pages/                         ← 5 Data entry screens
│   │   └── pages/reports/                 ← 7 Report screens
│   └── package.json
│
├── FRONTEND_REQUIREMENTS.md               ← Component-based Frontend Blueprint
├── Development Plan - ... .md             ← Architecture & Implementation Plan
└── README.md                              ← Evaluator setup guide
```

---

## 🚀 Quick Start Guide (For Evaluator)

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js v18+](https://nodejs.org/) & npm
- [MySQL Server 8.0](https://dev.mysql.com/downloads/mysql/) running locally on port 3306

---

### Step 1: Database Setup
Open **MySQL Workbench** or your MySQL command line client and create the database:
```sql
CREATE DATABASE student_exam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Step 2: Configure Backend Connection String
Open `server/appsettings.json` and verify your MySQL `root` password:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=student_exam_db;User=root;Password=YOUR_ROOT_PASSWORD;"
  }
}
```

---

### Step 3: Run Backend (.NET 10 Web API)
Open a terminal in the `server` folder:
```bash
cd server
dotnet run
```
> **Note**: On startup, EF Core automatically creates all 6 tables in `student_exam_db` if they don't already exist.
> Backend API will be live at: **`http://localhost:5000`**

---

### Step 4: Run Frontend (React + Vite)
In a separate terminal, open the `client` folder:
```bash
cd client
npm install
npm run dev
```
> Frontend will open at: **`http://localhost:5173`**

---

## 📋 Features Walkthrough

### Step 1: Data Entry Application
1. **Students Screen**: Add, edit, delete, and list students. Full validation for unique `RollNumber` and unique `Email`.
2. **Subjects Screen**: Add, edit, delete, and list subjects. Validates `PassMarks <= MaxMarks`.
3. **Exams Screen**: Add, edit, and list exams. Assign subjects to exams via checkbox list.
4. **Enrollment Screen**: Select exam and enroll students with duplicate enrollment prevention.
5. **Marks Entry Screen**: Select exam and subject; displays editable grid of enrolled students. Validates range `0 <= Marks <= MaxMarks` with bulk save.

### Step 2: Reports on All Data (40 Marks)
1. **Student List Report**: Department-wise filter and real-time search.
2. **Exam-wise Subject List**: Filtered by exam with full subject details.
3. **Exam-wise Enrollment List**: Shows all enrolled students for selected exam.
4. **Student Marks Sheet (Report Card)**: Subject-wise marks with Pass/Fail, Total, Percentage, and **Printable View** (`window.print()`).
5. **Exam Result List**: Complete result with Total, Percentage, Overall Pass/Fail, Rank calculation, and **Instant CSV Export** button.
6. **Subject-wise Report**: Analytics showing Highest Marks, Average Marks, and Number of Failed Students per subject.
7. **Missing Marks Report**: Identifies enrolled students who have no marks recorded for an exam subject.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | List all students |
| `POST` | `/api/students` | Add new student (uniqueness check) |
| `PUT` | `/api/students/{id}` | Update student details |
| `DELETE`| `/api/students/{id}` | Delete student record |
| `GET` | `/api/subjects` | List all subjects |
| `POST` | `/api/subjects` | Add new subject (`PassMarks <= MaxMarks`) |
| `PUT` | `/api/subjects/{id}` | Update subject |
| `DELETE`| `/api/subjects/{id}` | Delete subject |
| `GET` | `/api/exams` | List all exams with subject counts |
| `GET` | `/api/exams/{id}` | Get single exam details |
| `GET` | `/api/exams/{id}/subjects` | Get subjects assigned to an exam |
| `POST` | `/api/exams` | Create exam with assigned subjects |
| `PUT` | `/api/exams/{id}` | Update exam and reassign subjects |
| `GET` | `/api/enrollment?examId={id}` | Get enrolled students for exam |
| `GET` | `/api/enrollment/available?examId={id}` | Get students available to enroll |
| `POST` | `/api/enrollment` | Enroll one or more students |
| `GET` | `/api/marks?examId={id}&subjectId={id}` | Get marks grid for entry |
| `POST` | `/api/marks/bulk` | Bulk upsert student marks |
| `GET` | `/api/reports/student-list` | Report 1: Filtered student list |
| `GET` | `/api/reports/departments` | Distinct departments list |
| `GET` | `/api/reports/exam-subjects?examId={id}` | Report 2: Exam-wise subjects |
| `GET` | `/api/reports/enrollment-list?examId={id}`| Report 3: Exam-wise enrollments |
| `GET` | `/api/reports/marks-sheet?examId={id}&studentId={id}` | Report 4: Student marks sheet |
| `GET` | `/api/reports/exam-result?examId={id}` | Report 5: Exam results & merit ranks |
| `GET` | `/api/reports/exam-result/export?examId={id}` | Report 5: Download results as CSV |
| `GET` | `/api/reports/subject-wise?examId={id}` | Report 6: Subject analytics |
| `GET` | `/api/reports/missing-marks?examId={id}` | Report 7: Missing marks identification |


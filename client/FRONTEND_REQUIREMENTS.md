# Frontend Requirements — Student Examination System

> **Purpose**: This document is a complete, self-contained frontend specification. Use it to generate the entire React frontend in one go.  
> **Rule**: Build ONLY what is described here. Do NOT add any extra features, pages, or components.

---

## 1. Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI library |
| Vite | latest | Build tool / dev server |
| Tailwind CSS | v3 | Styling (utility-first) |
| React Router | v6 (`react-router-dom`) | Client-side routing |
| Axios | latest | HTTP client for API calls |
| `react-to-print` | latest | Print functionality for reports |

### Project Init Commands
```bash
npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom react-to-print
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Tailwind Config (`tailwind.config.js`)
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### Global CSS (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### API Base URL Config (`src/api/axiosConfig.js`)
```js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default API;
```

---

## 2. Folder Structure

```
client/src/
├── api/                          ← Axios calls grouped by module
│   ├── axiosConfig.js            ← Base Axios instance
│   ├── students.js
│   ├── subjects.js
│   ├── exams.js
│   ├── enrollment.js
│   ├── marks.js
│   └── reports.js
│
├── components/                   ← Small reusable UI components
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── Layout.jsx           ← Main layout wrapper (Sidebar + Navbar + Content area)
│   ├── ui/
│   │   ├── FormInput.jsx         ← Text/email/number input with label + error
│   │   ├── SelectInput.jsx       ← Dropdown select with label + error
│   │   ├── Modal.jsx             ← Reusable modal dialog
│   │   ├── DataTable.jsx         ← Reusable table with headers + rows
│   │   ├── AlertMessage.jsx      ← Success / Error toast/alert
│   │   ├── SearchInput.jsx       ← Search bar with icon
│   │   ├── FilterDropdown.jsx    ← Dropdown filter (for reports)
│   │   ├── PrintWrapper.jsx      ← Wrapper that enables window.print()
│   │   ├── ExportButton.jsx      ← CSV export download button
│   │   ├── ConfirmDialog.jsx     ← "Are you sure?" confirmation popup
│   │   ├── Loader.jsx            ← Loading spinner
│   │   └── Badge.jsx             ← Pass/Fail/Incomplete status badge
│
├── pages/                        ← One file per screen
│   ├── Students.jsx
│   ├── Subjects.jsx
│   ├── Exams.jsx
│   ├── Enrollment.jsx
│   ├── MarksEntry.jsx
│   └── reports/
│       ├── StudentListReport.jsx
│       ├── ExamSubjectList.jsx
│       ├── EnrollmentList.jsx
│       ├── MarksSheet.jsx
│       ├── ExamResult.jsx
│       ├── SubjectWiseReport.jsx
│       └── MissingMarksReport.jsx
│
├── App.jsx                       ← All route definitions
├── main.jsx                      ← Entry point
└── index.css                     ← Tailwind imports
```

---

## 3. Reusable Components — Detailed Specs

### 3.1 `Layout.jsx`
**Purpose**: Main layout shell — wraps every page.
```
┌──────────────────────────────────────────────┐
│ Navbar (top, full width)                     │
├────────────┬─────────────────────────────────┤
│            │                                 │
│  Sidebar   │     Page Content (children)     │
│  (left,    │     rendered via <Outlet />      │
│  fixed     │                                 │
│  width)    │                                 │
│            │                                 │
├────────────┴─────────────────────────────────┤
```
- Sidebar width: `w-64` (fixed)
- Content area: remaining width, scrollable, `p-6` padding
- Uses `<Outlet />` from React Router

---

### 3.2 `Sidebar.jsx`
**Purpose**: Left navigation menu.

**Menu Structure** (exact order):
```
📊 Student Exam System    ← App title / logo text

DATA ENTRY                ← Section header (uppercase, gray, small)
  👤 Students
  📚 Subjects
  📝 Exams
  📋 Enrollment
  ✏️ Marks Entry

REPORTS                   ← Section header
  📄 Student List
  📄 Exam Subjects
  📄 Enrollment List
  📄 Marks Sheet
  📄 Exam Results
  📄 Subject Analysis
  📄 Missing Marks
```
- Active link: highlighted background (e.g., `bg-blue-100 text-blue-700`)
- Use `<NavLink>` from React Router for active state
- Fixed left sidebar, full height, `bg-white border-r`

---

### 3.3 `Navbar.jsx`
**Purpose**: Top bar.
- Show current page title (derived from route)
- Simple, clean, `bg-white border-b shadow-sm`, `h-16`
- No login/logout/user buttons (not in requirements)

---

### 3.4 `FormInput.jsx`
**Props**:
```jsx
{
  label: string,        // "Roll Number"
  name: string,         // "rollNumber"
  type: string,         // "text" | "email" | "number"
  value: string|number,
  onChange: function,
  error: string|null,   // Inline error message
  placeholder: string,
  required: boolean,
  disabled: boolean,
  min: number,          // For type="number"
  max: number,          // For type="number"
}
```
**Behavior**:
- Label above input
- Red border + red error text below input when `error` is not null
- Normal border when no error
- `required` shows red asterisk `*` next to label

---

### 3.5 `SelectInput.jsx`
**Props**:
```jsx
{
  label: string,
  name: string,
  value: string|number,
  onChange: function,
  error: string|null,
  options: [{ value: "", label: "Select..." }, { value: 1, label: "Option" }],
  required: boolean,
  disabled: boolean,
}
```
**Behavior**: Same error styling as FormInput.

---

### 3.6 `Modal.jsx`
**Props**:
```jsx
{
  isOpen: boolean,
  onClose: function,
  title: string,        // "Add Student" | "Edit Subject"
  children: ReactNode,  // Form content goes inside
  size: "sm" | "md" | "lg",  // default "md"
}
```
**Behavior**:
- Dark overlay behind modal
- Centered on screen
- Close on clicking overlay or X button
- Smooth fade-in animation (optional)

---

### 3.7 `DataTable.jsx`
**Props**:
```jsx
{
  columns: [
    { key: "rollNumber", label: "Roll No" },
    { key: "fullName", label: "Full Name" },
    { key: "actions", label: "Actions", render: (row) => <buttons> }
  ],
  data: array,           // Array of row objects
  emptyMessage: string,  // "No students found"
  loading: boolean,
}
```
**Behavior**:
- Striped rows (`even:bg-gray-50`)
- Hover effect (`hover:bg-gray-100`)
- Shows `<Loader />` when `loading=true`
- Shows `emptyMessage` when `data` is empty
- Render function in column for custom cell content (e.g., Action buttons, Badge)

---

### 3.8 `AlertMessage.jsx`
**Props**:
```jsx
{
  type: "success" | "error",
  message: string,
  onClose: function,     // Dismiss button
}
```
**Behavior**:
- Success: green background, check icon
- Error: red background, X icon
- Auto-dismiss after 4 seconds (with manual close option)
- Positioned at top-right of content area or inline above forms

---

### 3.9 `SearchInput.jsx`
**Props**: `{ value, onChange, placeholder }`
- Search icon (🔍) inside input
- Debounce: 300ms delay before triggering search (use `setTimeout`)

---

### 3.10 `FilterDropdown.jsx`
**Props**: `{ label, value, onChange, options }`
- Styled dropdown used at top of report pages
- First option: "All" or "Select Exam..."

---

### 3.11 `PrintWrapper.jsx`
**Props**: `{ children, buttonLabel }`
- Wraps report content
- Shows a "🖨️ Print" button
- On click: calls `window.print()`
- CSS: `@media print` hides Sidebar, Navbar, and all buttons

**Add this to `index.css`**:
```css
@media print {
  .no-print { display: none !important; }
  .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; }
}
```

---

### 3.12 `ExportButton.jsx`
**Props**: `{ onClick, label }`
- Button styled with download icon
- `label` defaults to "Export CSV"
- On click: triggers CSV download from API

---

### 3.13 `ConfirmDialog.jsx`
**Props**: `{ isOpen, onConfirm, onCancel, message }`
- Small modal: "Are you sure you want to delete this student?"
- Two buttons: "Cancel" (gray) and "Delete" (red)

---

### 3.14 `Loader.jsx`
- Simple spinning circle animation
- Centered in parent container

---

### 3.15 `Badge.jsx`
**Props**: `{ status }`
- `"Pass"` → green badge
- `"Fail"` → red badge
- `"Incomplete"` → yellow/amber badge

---

## 4. Routing Map (`App.jsx`)

```jsx
<BrowserRouter>
  <Routes>
    <Route element={<Layout />}>
      {/* Data Entry */}
      <Route path="/" element={<Students />} />
      <Route path="/students" element={<Students />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/enrollment" element={<Enrollment />} />
      <Route path="/marks-entry" element={<MarksEntry />} />

      {/* Reports */}
      <Route path="/reports/student-list" element={<StudentListReport />} />
      <Route path="/reports/exam-subjects" element={<ExamSubjectList />} />
      <Route path="/reports/enrollment-list" element={<EnrollmentList />} />
      <Route path="/reports/marks-sheet" element={<MarksSheet />} />
      <Route path="/reports/exam-result" element={<ExamResult />} />
      <Route path="/reports/subject-wise" element={<SubjectWiseReport />} />
      <Route path="/reports/missing-marks" element={<MissingMarksReport />} />
    </Route>
  </Routes>
</BrowserRouter>
```

---

## 5. API Layer — Axios Modules

Every API module imports `API` from `axiosConfig.js` and exports named functions.

### 5.1 `api/students.js`
```js
import API from "./axiosConfig";

export const getStudents = () => API.get("/students");
export const addStudent = (data) => API.post("/students", data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);
```

### 5.2 `api/subjects.js`
```js
export const getSubjects = () => API.get("/subjects");
export const addSubject = (data) => API.post("/subjects", data);
export const updateSubject = (id, data) => API.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);
```

### 5.3 `api/exams.js`
```js
export const getExams = () => API.get("/exams");
export const getExamById = (id) => API.get(`/exams/${id}`);
export const addExam = (data) => API.post("/exams", data);
export const updateExam = (id, data) => API.put(`/exams/${id}`, data);
export const getExamSubjects = (id) => API.get(`/exams/${id}/subjects`);
```

### 5.4 `api/enrollment.js`
```js
export const getEnrolledStudents = (examId) => API.get(`/enrollment?examId=${examId}`);
export const getAvailableStudents = (examId) => API.get(`/enrollment/available?examId=${examId}`);
export const enrollStudents = (data) => API.post("/enrollment", data);
```

### 5.5 `api/marks.js`
```js
export const getMarks = (examId, subjectId) => API.get(`/marks?examId=${examId}&subjectId=${subjectId}`);
export const saveMarksBulk = (data) => API.post("/marks/bulk", data);
```

### 5.6 `api/reports.js`
```js
export const getStudentListReport = (params) => API.get("/reports/student-list", { params });
export const getExamSubjectsReport = (examId) => API.get(`/reports/exam-subjects?examId=${examId}`);
export const getEnrollmentListReport = (examId) => API.get(`/reports/enrollment-list?examId=${examId}`);
export const getMarksSheet = (examId, studentId) => API.get(`/reports/marks-sheet?examId=${examId}&studentId=${studentId}`);
export const getExamResult = (examId) => API.get(`/reports/exam-result?examId=${examId}`);
export const exportExamResultCSV = (examId) => API.get(`/reports/exam-result/export?examId=${examId}`, { responseType: "blob" });
export const getSubjectWiseReport = (examId) => API.get(`/reports/subject-wise?examId=${examId}`);
export const getMissingMarksReport = (examId) => API.get(`/reports/missing-marks?examId=${examId}`);
```

---

## 6. Page Specifications — Data Entry Screens

---

### 6.1 `Students.jsx`

**Operations**: Add, Edit, Delete, List

**State Variables**:
```js
students           // array - all students from API
isModalOpen        // boolean - controls Add/Edit modal
editingStudent     // object|null - null = Add mode, object = Edit mode
form               // { rollNumber, fullName, email, department }
errors             // { rollNumber: "", fullName: "", email: "", department: "" }
alert              // { type: "success"|"error", message: "" } | null
loading            // boolean
```

**Page Layout**:
```
┌─────────────────────────────────────────────┐
│ [AlertMessage]                              │
│                                             │
│ Students                    [+ Add Student] │
│ ─────────────────────────────────────────── │
│ | Roll No | Full Name | Email | Dept | Act | │
│ |---------|-----------|-------|------|-----| │
│ | CS001   | Rahul     | r@..  | CS   | ✏️🗑️| │
│ | CS002   | Priya     | p@..  | IT   | ✏️🗑️| │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Modal: Add/Edit Student Form]              │
│ ┌─────────────────────────────┐             │
│ │ Roll Number*  [__________]  │             │
│ │ Full Name*    [__________]  │             │
│ │ Email*        [__________]  │             │
│ │ Department*   [__________]  │             │
│ │                             │             │
│ │      [Cancel]  [Save]       │             │
│ └─────────────────────────────┘             │
└─────────────────────────────────────────────┘
```

**Form Validation (Client-Side, before API call)**:
| Field | Rules |
|---|---|
| `rollNumber` | Required, cannot be empty |
| `fullName` | Required, cannot be empty |
| `email` | Required, must be valid email format (regex: `/\S+@\S+\.\S+/`) |
| `department` | Required, cannot be empty |

**Backend Error Handling**:
- If API returns 400/409 with message like `"Roll Number already in use"` → set `errors.rollNumber` to that message
- If API returns `"Email already registered"` → set `errors.email` to that message

**Flows**:
1. **Page Load** → call `getStudents()` → populate table
2. **Add** → click "Add Student" → open Modal (editingStudent = null) → fill form → validate → call `addStudent(form)` → on success: close modal, show success alert, refresh list
3. **Edit** → click ✏️ → open Modal (editingStudent = row data, pre-fill form) → edit → validate → call `updateStudent(id, form)` → on success: close modal, show success alert, refresh list
4. **Delete** → click 🗑️ → open ConfirmDialog → on confirm: call `deleteStudent(id)` → show success alert, refresh list

---

### 6.2 `Subjects.jsx`

**Operations**: Add, Edit, Delete, List

**Form Fields**:
| Field | Type | Validations |
|---|---|---|
| `subjectCode` | text | Required |
| `subjectName` | text | Required |
| `maxMarks` | number | Required, must be > 0, integer |
| `passMarks` | number | Required, must be > 0, **must be ≤ maxMarks** |

**Special Validation**:
- When user types `passMarks` > `maxMarks` → immediately show inline error: `"Pass Marks cannot exceed Max Marks"`
- Disable "Save" button while this error exists

**Table Columns**: Subject Code | Subject Name | Max Marks | Pass Marks | Actions (✏️ 🗑️)

**Flows**: Same as Students (Add/Edit/Delete via Modal + ConfirmDialog)

---

### 6.3 `Exams.jsx`

**Operations**: Add, Edit, List  
⚠️ **NO DELETE** — Do not add a delete button for exams.

**Form Fields**:
| Field | Type | Validations |
|---|---|---|
| `examName` | text | Required |
| `academicYear` | text | Required (e.g., "2024-25") |
| `subjectIds` | checkbox list | At least 1 subject must be selected |

**Page Layout**:
```
┌─────────────────────────────────────────────────┐
│ Exams                            [+ Add Exam]   │
│ ────────────────────────────────────────────── │
│ | Exam Name    | Academic Year | Subjects | Act | │
│ |--------------|---------------|----------|-----| │
│ | Mid Term     | 2024-25       | 3        | ✏️  | │
│ | Final Exam   | 2024-25       | 5        | ✏️  | │
│                                                   │
│ [Modal: Add/Edit Exam]                           │
│ ┌───────────────────────────────────┐             │
│ │ Exam Name*      [_______________] │             │
│ │ Academic Year*  [_______________] │             │
│ │                                   │             │
│ │ Select Subjects*                  │             │
│ │ ☑ Mathematics (MATH101)          │             │
│ │ ☑ Physics (PHY101)               │             │
│ │ ☐ Chemistry (CHEM101)            │             │
│ │ ☑ English (ENG101)               │             │
│ │                                   │             │
│ │        [Cancel]  [Save]           │             │
│ └───────────────────────────────────┘             │
└───────────────────────────────────────────────────┘
```

**Flows**:
1. **Page Load** → `getExams()` → list in table; also `getSubjects()` for checkbox list
2. **Add** → Modal opens → fill fields + check subjects → validate → `addExam({ examName, academicYear, subjectIds: [1,3,5] })`
3. **Edit** → `getExamById(id)` → pre-fill form + pre-check assigned subjects → `updateExam(id, data)`

---

### 6.4 `Enrollment.jsx`

**Operations**: Select exam → show available students → enroll selected

**Page Layout**:
```
┌──────────────────────────────────────────────────┐
│ Enrollment                                       │
│ ──────────────────────────────────────────────── │
│ Select Exam*:  [ ▼ Mid Term 2024-25          ]   │
│                                                  │
│ ┌── Available Students ──────────────────────┐   │
│ │ ☐ | Roll No | Full Name   | Department     │   │
│ │ ☑ | CS001   | Rahul Kumar | CS             │   │
│ │ ☑ | CS002   | Priya Singh | IT             │   │
│ │ ☐ | CS003   | Amit Verma  | CS             │   │
│ │                                             │   │
│ │              [Enroll Selected (2)]          │   │
│ └─────────────────────────────────────────────┘   │
│                                                  │
│ ┌── Already Enrolled ────────────────────────┐   │
│ │ | Roll No | Full Name    | Department      │   │
│ │ | CS004   | Sneha Patel  | EC              │   │
│ │ | CS005   | Vikash Shah  | CS              │   │
│ └─────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

**State Variables**:
```js
selectedExamId         // number
availableStudents      // array (not yet enrolled)
enrolledStudents       // array (already enrolled)
selectedStudentIds     // Set or array of checked student IDs
```

**Flows**:
1. **Select Exam** → call `getAvailableStudents(examId)` + `getEnrolledStudents(examId)`
2. **Check students** → toggle `selectedStudentIds`
3. **Click "Enroll Selected"** → call `enrollStudents({ examId, studentIds: [...] })`
4. **On success** → show alert, refresh both lists

**Validation**: At least 1 student must be selected before enrolling.

---

### 6.5 `MarksEntry.jsx`

**Operations**: Select Exam → Select Subject → editable marks grid → bulk save

**Page Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Marks Entry                                             │
│ ─────────────────────────────────────────────────────── │
│ Select Exam*:    [ ▼ Mid Term 2024-25 ]                 │
│ Select Subject*: [ ▼ Mathematics (Max: 100) ]           │
│                                                         │
│ ┌── Marks Grid ───────────────────────────────────────┐ │
│ │ | Roll No | Full Name    | Marks (0-100)  | Status  │ │
│ │ |---------|--------------|----------------|---------|│ │
│ │ | CS001   | Rahul Kumar  | [  85  ]       |         │ │
│ │ | CS002   | Priya Singh  | [ 120  ] ← RED |⚠️ error │ │
│ │ | CS004   | Sneha Patel  | [  42  ]       |         │ │
│ │                                                     │ │
│ │                          [💾 Save All Marks]        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**State Variables**:
```js
selectedExamId
selectedSubjectId
examSubjects           // subjects dropdown (only subjects of selected exam)
maxMarks               // number (from selected subject)
marksData              // [ { enrollmentId, studentId, rollNumber, fullName, marksObtained } ]
rowErrors              // { [enrollmentId]: "error message" }
```

**Flows**:
1. **Select Exam** → call `getExamSubjects(examId)` → populate Subject dropdown
2. **Select Subject** → call `getMarks(examId, subjectId)` → populate grid with existing marks (pre-fill)
3. **Edit marks** → validate each row: `0 ≤ value ≤ maxMarks`; if invalid, show red border on that cell + error message
4. **Save All** → validate all rows → call `saveMarksBulk({ examId, subjectId, marks: [{ enrollmentId, marksObtained }] })`
5. **On success** → show success alert

**Validation Per Row**:
- Field cannot be empty
- Must be a valid number
- Must be ≥ 0
- Must be ≤ MaxMarks of the selected subject
- Show inline error per row: `"Marks must be between 0 and {maxMarks}"`

---

## 7. Page Specifications — Report Screens

---

### 7.1 `StudentListReport.jsx`

**Filters**: Department dropdown + Search text input  
**No exam filter needed**

**Columns**: Roll No | Full Name | Email | Department

**Components Used**: `FilterDropdown` (department), `SearchInput`, `DataTable`

**Flow**:
1. On page load → `getStudentListReport({})` → load all
2. On department change → `getStudentListReport({ department: "CS" })`
3. On search type → debounce 300ms → `getStudentListReport({ search: "rahul" })`
4. Combine both filters: `getStudentListReport({ department: "CS", search: "rahul" })`

---

### 7.2 `ExamSubjectList.jsx`

**Filters**: Exam dropdown (required)

**Columns**: Subject Code | Subject Name | Max Marks | Pass Marks

**Flow**: Select exam → `getExamSubjectsReport(examId)` → show table

---

### 7.3 `EnrollmentList.jsx`

**Filters**: Exam dropdown (required)

**Columns**: Roll No | Full Name | Email | Department

**Flow**: Select exam → `getEnrollmentListReport(examId)` → show table

---

### 7.4 `MarksSheet.jsx` *(Has: Printable View)*

**Filters**: Exam dropdown → Student dropdown (only enrolled students of selected exam)

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Student Marks Sheet                   [🖨️ Print]    │
│ ─────────────────────────────────────────────────── │
│ Exam:    [ ▼ Mid Term ]                             │
│ Student: [ ▼ Rahul Kumar (CS001) ]                  │
│                                                     │
│ ┌── printable area ──────────────────────────────┐  │
│ │ Student: Rahul Kumar    Roll No: CS001          │  │
│ │ Exam: Mid Term 2024-25                          │  │
│ │                                                 │  │
│ │ | Subject     | Max | Pass | Obtained | Status | │  │
│ │ |-------------|-----|------|----------|--------| │  │
│ │ | Mathematics | 100 |  40  |    85    | Pass ✅| │  │
│ │ | Physics     | 100 |  40  |    32    | Fail ❌| │  │
│ │ | English     |  50 |  20  |    45    | Pass ✅| │  │
│ │ |-------------|-----|------|----------|--------| │  │
│ │ | TOTAL       | 250 |      |   162    |        | │  │
│ │                                                 │  │
│ │ Percentage: 64.80%                              │  │
│ │ Overall Result: Fail ❌                         │  │
│ │ (Reason: Not all subjects passed)               │  │
│ └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Business Rules Displayed Here**:
- Subject Status: `MarksObtained >= PassMarks` → "Pass", else → "Fail"
- Overall Result: ALL subjects must be "Pass" → "Pass"; otherwise → "Fail"
- If ANY subject has missing marks (null) → Overall = "Incomplete" (use yellow Badge)
- Percentage = `(TotalObtained / TotalMaxMarks) × 100` (2 decimal places)

**Print**: Wrap the report table in `<PrintWrapper>`. On print, only the report content shows.

**Flow**:
1. Select Exam → load enrolled students into Student dropdown
2. Select Student → `getMarksSheet(examId, studentId)` → render report
3. Print button → `window.print()`

---

### 7.5 `ExamResult.jsx` *(Has: CSV Export)*

**Filters**: Exam dropdown (required)

**Columns**: Rank | Roll No | Full Name | Department | Total Obtained | Total Max Marks | Percentage | Overall Result (Badge)

**Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│ Exam Results                    [📥 Export CSV]              │
│ ──────────────────────────────────────────────────────────── │
│ Exam: [ ▼ Mid Term 2024-25 ]                                │
│                                                              │
│ | Rank | Roll | Name    | Dept | Obtained | Max | %     | R  │
│ |------|------|---------|------|----------|-----|-------|----|│
│ | 1    | CS01 | Rahul   | CS   | 240      | 250 | 96.00 | ✅│ │
│ | 2    | CS04 | Sneha   | EC   | 210      | 250 | 84.00 | ✅│ │
│ | -    | CS02 | Priya   | IT   | 150      | 250 | 60.00 | ❌│ │
│ | -    | CS03 | Amit    | CS   | -        | -   | -     | ⚠️│ │
└──────────────────────────────────────────────────────────────┘
```

**CSV Export Flow**:
1. Click "Export CSV" → call `exportExamResultCSV(examId)`
2. Response is a blob → create download link:
```js
const blob = new Blob([response.data], { type: "text/csv" });
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `exam-result-${examId}.csv`;
a.click();
```

**Business Rules**:
- Students with ALL subjects passed → rank assigned (1, 2, 3... by total marks DESC)
- Students who failed or have incomplete marks → no rank (show "-")
- Overall Result uses `<Badge>` component

---

### 7.6 `SubjectWiseReport.jsx`

**Filters**: Exam dropdown (required)

**Columns**: Subject Name | Highest Marks | Average Marks | No. of Failed Students

**Flow**: Select exam → `getSubjectWiseReport(examId)` → show table

---

### 7.7 `MissingMarksReport.jsx`

**Filters**: Exam dropdown (required)

**Columns**: Roll No | Full Name | Missing Subject Name

Shows enrolled students who have **no marks entry** for at least one exam subject.

**Flow**: Select exam → `getMissingMarksReport(examId)` → show table

---

## 8. API Response Shapes (Expected from Backend)

### Students
```json
// GET /api/students → array
[
  { "studentId": 1, "rollNumber": "CS001", "fullName": "Rahul Kumar", "email": "rahul@email.com", "department": "CS" }
]

// POST /api/students → request body
{ "rollNumber": "CS001", "fullName": "Rahul Kumar", "email": "rahul@email.com", "department": "CS" }

// Error response (400/409)
{ "message": "Roll Number already in use" }
```

### Subjects
```json
[
  { "subjectId": 1, "subjectCode": "MATH101", "subjectName": "Mathematics", "maxMarks": 100, "passMarks": 40 }
]
```

### Exams
```json
// GET /api/exams
[
  { "examId": 1, "examName": "Mid Term", "academicYear": "2024-25", "subjectCount": 3 }
]

// GET /api/exams/1 (with subjects)
{
  "examId": 1, "examName": "Mid Term", "academicYear": "2024-25",
  "subjectIds": [1, 3, 5]
}

// POST /api/exams → request body
{ "examName": "Mid Term", "academicYear": "2024-25", "subjectIds": [1, 3, 5] }
```

### Enrollment
```json
// GET /api/enrollment/available?examId=1
[
  { "studentId": 1, "rollNumber": "CS001", "fullName": "Rahul", "department": "CS" }
]

// POST /api/enrollment → request body
{ "examId": 1, "studentIds": [1, 2, 3] }
```

### Marks
```json
// GET /api/marks?examId=1&subjectId=1
[
  { "enrollmentId": 1, "studentId": 1, "rollNumber": "CS001", "fullName": "Rahul", "marksObtained": 85 }
]

// POST /api/marks/bulk → request body
{
  "examId": 1,
  "subjectId": 1,
  "marks": [
    { "enrollmentId": 1, "marksObtained": 85 },
    { "enrollmentId": 2, "marksObtained": 72 }
  ]
}
```

### Reports
```json
// GET /api/reports/marks-sheet?examId=1&studentId=1
{
  "studentName": "Rahul Kumar",
  "rollNumber": "CS001",
  "examName": "Mid Term 2024-25",
  "subjects": [
    { "subjectName": "Mathematics", "maxMarks": 100, "passMarks": 40, "marksObtained": 85, "status": "Pass" }
  ],
  "totalMaxMarks": 250,
  "totalObtained": 162,
  "percentage": 64.80,
  "overallResult": "Fail"
}

// GET /api/reports/exam-result?examId=1
[
  {
    "rank": 1, "rollNumber": "CS001", "fullName": "Rahul", "department": "CS",
    "totalObtained": 240, "totalMaxMarks": 250, "percentage": 96.00, "overallResult": "Pass"
  },
  {
    "rank": null, "rollNumber": "CS003", "fullName": "Amit", "department": "CS",
    "totalObtained": null, "totalMaxMarks": null, "percentage": null, "overallResult": "Incomplete"
  }
]

// GET /api/reports/subject-wise?examId=1
[
  { "subjectName": "Mathematics", "highestMarks": 98, "averageMarks": 72.5, "failedCount": 3 }
]

// GET /api/reports/missing-marks?examId=1
[
  { "rollNumber": "CS003", "fullName": "Amit Verma", "subjectName": "Physics" }
]
```

---

## 9. UI/UX Rules (Apply Everywhere)

1. **All form fields marked with `*` are required**. Show red asterisk next to label.
2. **Inline field errors**: Red border on input + red text below (e.g., `"This field is required"`).
3. **Success alert**: Green banner/toast after every successful Add / Edit / Delete / Save.
4. **Error alert**: Red banner/toast for API errors with the server's message.
5. **Loading state**: Show `<Loader />` while API calls are in progress. Disable "Save" button during loading.
6. **Empty state**: Show friendly message in tables when no data (e.g., `"No students found. Add your first student!"`).
7. **Confirm before delete**: Always show `<ConfirmDialog>` before deleting anything.
8. **Responsive**: The layout should work on screens ≥ 1024px width. Mobile-first is NOT required.
9. **Color Palette (Tailwind)**:
   - Primary buttons: `bg-blue-600 hover:bg-blue-700 text-white`
   - Danger buttons: `bg-red-600 hover:bg-red-700 text-white`
   - Cancel buttons: `bg-gray-200 hover:bg-gray-300 text-gray-800`
   - Success alerts: `bg-green-100 text-green-800 border-green-300`
   - Error alerts: `bg-red-100 text-red-800 border-red-300`
   - Sidebar: `bg-white border-r border-gray-200`
   - Navbar: `bg-white border-b border-gray-200 shadow-sm`
   - Page background: `bg-gray-50`

---

## 10. Important Notes

1. **No authentication / login page** — Not in requirements. Do not add.
2. **No dashboard page** — The default route `/` goes directly to `Students.jsx`.
3. **No dark mode** — Not required.
4. **No extra features** — Build only what is documented above.
5. **Code quality**:
   - Each component in its own file
   - Use `useState`, `useEffect` hooks
   - Keep API calls in the `api/` folder, not inside components
   - Use destructuring for props
   - Use `async/await` with `try/catch` for all API calls
   - No prop drilling beyond 2 levels — if needed, pass as props to direct children only

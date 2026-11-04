import React, { useState, useEffect } from "react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../api/students";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import FormInput from "../components/ui/FormInput";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AlertMessage from "../components/ui/AlertMessage";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    rollNumber: "",
    fullName: "",
    email: "",
    department: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchStudentsList = async () => {
    setLoading(true);
    try {
      const response = await getStudents();
      setStudents(response.data || []);
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to load students. Make sure backend is running on http://localhost:5000.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, []);

  const resetForm = () => {
    setForm({
      rollNumber: "",
      fullName: "",
      email: "",
      department: "",
    });
    setErrors({});
    setEditingStudent(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      rollNumber: student.rollNumber || "",
      fullName: student.fullName || "",
      email: student.email || "",
      department: student.department || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.rollNumber || !form.rollNumber.trim()) {
      newErrors.rollNumber = "Roll Number is required";
    }
    if (!form.fullName || !form.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }
    if (!form.email || !form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.department || !form.department.trim()) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingStudent) {
        const id = editingStudent.studentId || editingStudent.id;
        await updateStudent(id, form);
        setAlert({ type: "success", message: "Student record updated successfully!" });
      } else {
        await addStudent(form);
        setAlert({ type: "success", message: "Student record added successfully!" });
      }
      setIsModalOpen(false);
      resetForm();
      fetchStudentsList();
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || "";
      if (
        serverMsg.toLowerCase().includes("roll number") ||
        serverMsg.toLowerCase().includes("roll")
      ) {
        setErrors((prev) => ({ ...prev, rollNumber: serverMsg }));
      } else if (serverMsg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: serverMsg }));
      } else {
        setAlert({
          type: "error",
          message: serverMsg || "Failed to save student.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteStudent(confirmDeleteId);
      setAlert({ type: "success", message: "Student deleted successfully!" });
      setConfirmDeleteId(null);
      fetchStudentsList();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to delete student.",
      });
      setConfirmDeleteId(null);
    }
  };

  const columns = [
    {
      key: "rollNumber",
      label: "Roll No",
      render: (row) => (
        <span className="font-mono font-medium text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.rollNumber}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (row) => <span className="text-slate-600 text-xs">{row.email}</span>,
    },
    {
      key: "department",
      label: "Dept",
      render: (row) => (
        <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {row.department}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Act",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Student"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteId(row.studentId || row.id)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Student"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Alert */}
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Students Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, departments, and enrollment credentials
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students found. Click '+ Add Student' to register your first record."
        loading={loading}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Edit Student Details" : "Register New Student"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Roll Number"
            name="rollNumber"
            value={form.rollNumber}
            onChange={handleInputChange}
            error={errors.rollNumber}
            placeholder="e.g. CS2026-001"
            required
          />
          <FormInput
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleInputChange}
            error={errors.fullName}
            placeholder="e.g. Rahul Sharma"
            required
          />
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="e.g. rahul.sharma@example.com"
            required
          />
          <FormInput
            label="Department"
            name="department"
            value={form.department}
            onChange={handleInputChange}
            error={errors.department}
            placeholder="e.g. Computer Science"
            required
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : "Save Student"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this student record? All related enrollments and marks records may also be affected."
        confirmLabel="Delete Student"
      />
    </div>
  );
}

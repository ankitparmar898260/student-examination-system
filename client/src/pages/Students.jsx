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
import { Plus, Pencil, Trash2, Users } from "lucide-react";

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
        <span className="font-mono font-semibold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
          {row.rollNumber}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Candidate Full Name",
      render: (row) => <span className="font-semibold text-[#0F172A] text-sm">{row.fullName}</span>,
    },
    {
      key: "email",
      label: "Email Address",
      render: (row) => <span className="text-slate-500 text-xs font-normal">{row.email}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          {row.department}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
            title="Edit Student"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteId(row.studentId || row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Students Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate records, academic departments, and enrollment profiles
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="Click '+ Add Student' above to register your first candidate."
        loading={loading}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Edit Student Record" : "Register New Student"}
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
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
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
        message="Deleting this student will also delete all their enrollments and marks. Do you want to continue?"
        confirmLabel="Delete Student"
      />
    </div>
  );
}

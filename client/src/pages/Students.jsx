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

  // Confirm delete dialog state
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
          "Failed to load students. Make sure backend is running.",
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
        setAlert({ type: "success", message: "Student updated successfully!" });
      } else {
        await addStudent(form);
        setAlert({ type: "success", message: "Student added successfully!" });
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
    { key: "rollNumber", label: "Roll No" },
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "department", label: "Dept" },
    {
      key: "actions",
      label: "Act",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() =>
              setConfirmDeleteId(row.studentId || row.id)
            }
            className="p-1 text-red-600 hover:text-red-800 rounded transition-colors"
            title="Delete"
          >
            🗑️
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

      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Students</h2>
          <p className="text-xs text-gray-500">Manage student records and details</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
        >
          + Add Student
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students found. Click '+ Add Student' to create one!"
        loading={loading}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Edit Student" : "Add Student"}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Roll Number"
            name="rollNumber"
            value={form.rollNumber}
            onChange={handleInputChange}
            error={errors.rollNumber}
            placeholder="e.g. CS001"
            required
          />
          <FormInput
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleInputChange}
            error={errors.fullName}
            placeholder="e.g. Rahul Kumar"
            required
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="e.g. rahul@example.com"
            required
          />
          <FormInput
            label="Department"
            name="department"
            value={form.department}
            onChange={handleInputChange}
            error={errors.department}
            placeholder="e.g. CS, IT, ME"
            required
          />

          <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this student record? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}

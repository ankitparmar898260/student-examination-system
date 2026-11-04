import React, { useState, useEffect } from "react";
import {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} from "../api/subjects";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import FormInput from "../components/ui/FormInput";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AlertMessage from "../components/ui/AlertMessage";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({
    subjectCode: "",
    subjectName: "",
    maxMarks: "",
    passMarks: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchSubjectsList = async () => {
    setLoading(true);
    try {
      const response = await getSubjects();
      setSubjects(response.data || []);
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to load subjects. Make sure backend is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsList();
  }, []);

  const resetForm = () => {
    setForm({
      subjectCode: "",
      subjectName: "",
      maxMarks: "",
      passMarks: "",
    });
    setErrors({});
    setEditingSubject(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setForm({
      subjectCode: subject.subjectCode || "",
      subjectName: subject.subjectName || "",
      maxMarks: subject.maxMarks ?? "",
      passMarks: subject.passMarks ?? "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    const newErrors = { ...errors };

    // Clear field-specific error if typing
    if (newErrors[name]) {
      delete newErrors[name];
    }

    // Special Real-Time Validation: passMarks <= maxMarks
    const maxVal = parseFloat(name === "maxMarks" ? value : newForm.maxMarks);
    const passVal = parseFloat(name === "passMarks" ? value : newForm.passMarks);

    if (!isNaN(maxVal) && !isNaN(passVal) && passVal > maxVal) {
      newErrors.passMarks = "Pass Marks cannot exceed Max Marks";
    } else if (newErrors.passMarks === "Pass Marks cannot exceed Max Marks") {
      delete newErrors.passMarks;
    }

    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};

    if (!form.subjectCode || !form.subjectCode.trim()) {
      newErrors.subjectCode = "Subject Code is required";
    }
    if (!form.subjectName || !form.subjectName.trim()) {
      newErrors.subjectName = "Subject Name is required";
    }

    const max = parseFloat(form.maxMarks);
    if (!form.maxMarks || isNaN(max) || max <= 0) {
      newErrors.maxMarks = "Max Marks must be greater than 0";
    }

    const pass = parseFloat(form.passMarks);
    if (!form.passMarks || isNaN(pass) || pass <= 0) {
      newErrors.passMarks = "Pass Marks must be greater than 0";
    } else if (!isNaN(max) && pass > max) {
      newErrors.passMarks = "Pass Marks cannot exceed Max Marks";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasPassMarksError =
    errors.passMarks === "Pass Marks cannot exceed Max Marks";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        subjectCode: form.subjectCode.trim(),
        subjectName: form.subjectName.trim(),
        maxMarks: Number(form.maxMarks),
        passMarks: Number(form.passMarks),
      };

      if (editingSubject) {
        const id = editingSubject.subjectId || editingSubject.id;
        await updateSubject(id, payload);
        setAlert({ type: "success", message: "Subject updated successfully!" });
      } else {
        await addSubject(payload);
        setAlert({ type: "success", message: "Subject added successfully!" });
      }
      setIsModalOpen(false);
      resetForm();
      fetchSubjectsList();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to save subject.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteSubject(confirmDeleteId);
      setAlert({ type: "success", message: "Subject deleted successfully!" });
      setConfirmDeleteId(null);
      fetchSubjectsList();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to delete subject.",
      });
      setConfirmDeleteId(null);
    }
  };

  const columns = [
    { key: "subjectCode", label: "Subject Code" },
    { key: "subjectName", label: "Subject Name" },
    { key: "maxMarks", label: "Max Marks", align: "center" },
    { key: "passMarks", label: "Pass Marks", align: "center" },
    {
      key: "actions",
      label: "Actions",
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
              setConfirmDeleteId(row.subjectId || row.id)
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subjects</h2>
          <p className="text-xs text-gray-500">Configure courses, maximum and passing marks</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
        >
          + Add Subject
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={subjects}
        emptyMessage="No subjects found. Click '+ Add Subject' to add one!"
        loading={loading}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? "Edit Subject" : "Add Subject"}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Subject Code"
            name="subjectCode"
            value={form.subjectCode}
            onChange={handleInputChange}
            error={errors.subjectCode}
            placeholder="e.g. MATH101"
            required
          />
          <FormInput
            label="Subject Name"
            name="subjectName"
            value={form.subjectName}
            onChange={handleInputChange}
            error={errors.subjectName}
            placeholder="e.g. Mathematics"
            required
          />
          <FormInput
            label="Max Marks"
            name="maxMarks"
            type="number"
            min={1}
            value={form.maxMarks}
            onChange={handleInputChange}
            error={errors.maxMarks}
            placeholder="e.g. 100"
            required
          />
          <FormInput
            label="Pass Marks"
            name="passMarks"
            type="number"
            min={1}
            value={form.passMarks}
            onChange={handleInputChange}
            error={errors.passMarks}
            placeholder="e.g. 40"
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
              disabled={submitting || hasPassMarksError}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        message="Are you sure you want to delete this subject? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}

/**
 * Page: Subjects Management
 * Purpose: Handles CRUD operations for subjects including subject codes, maximum marks, and passing marks.
 */

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
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

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
          "Failed to load subjects. Make sure backend is running on http://localhost:5000.",
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
    if (newErrors[name]) {
      delete newErrors[name];
    }

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
    {
      key: "subjectCode",
      label: "Subject Code",
      render: (row) => (
        <span className="font-mono font-semibold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
          {row.subjectCode}
        </span>
      ),
    },
    {
      key: "subjectName",
      label: "Course Title",
      render: (row) => <span className="font-semibold text-[#0F172A] text-sm">{row.subjectName}</span>,
    },
    {
      key: "maxMarks",
      label: "Max Marks",
      align: "center",
      render: (row) => <span className="font-mono text-slate-800 font-semibold text-sm">{row.maxMarks}</span>,
    },
    {
      key: "passMarks",
      label: "Pass Marks",
      align: "center",
      render: (row) => (
        <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
          {row.passMarks}
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
            title="Edit Subject"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteId(row.subjectId || row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
            title="Delete Subject"
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
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Subjects Master</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Course curriculum, maximum scoring benchmarks and passing cutoffs
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={subjects}
        emptyMessage="Click '+ Add Subject' above to create course syllabus."
        loading={loading}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? "Edit Subject Criteria" : "Add New Subject"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Subject Code"
            name="subjectCode"
            value={form.subjectCode}
            onChange={handleInputChange}
            error={errors.subjectCode}
            placeholder="e.g. CS101"
            required
          />
          <FormInput
            label="Subject Name"
            name="subjectName"
            value={form.subjectName}
            onChange={handleInputChange}
            error={errors.subjectName}
            placeholder="e.g. Database Management Systems"
            required
          />

          <div className="grid grid-cols-2 gap-3">
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
          </div>

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
              disabled={submitting || hasPassMarksError}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Saving..." : "Save Subject"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        message="Deleting this subject will also remove it from all exams and delete all marks entered for it. Do you want to continue?"
        confirmLabel="Delete Subject"
      />
    </div>
  );
}

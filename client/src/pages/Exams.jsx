import React, { useState, useEffect } from "react";
import {
  getExams,
  getExamById,
  addExam,
  updateExam,
} from "../api/exams";
import { getSubjects } from "../api/subjects";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import FormInput from "../components/ui/FormInput";
import AlertMessage from "../components/ui/AlertMessage";

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState({
    examName: "",
    academicYear: "",
    subjectIds: [],
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchExamsAndSubjects = async () => {
    setLoading(true);
    try {
      const [examsRes, subjectsRes] = await Promise.all([
        getExams(),
        getSubjects(),
      ]);
      setExams(examsRes.data || []);
      setAllSubjects(subjectsRes.data || []);
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to load exams or subjects. Make sure backend is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsAndSubjects();
  }, []);

  const resetForm = () => {
    setForm({
      examName: "",
      academicYear: "",
      subjectIds: [],
    });
    setErrors({});
    setEditingExam(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = async (exam) => {
    resetForm();
    setEditingExam(exam);
    setIsModalOpen(true);

    try {
      const examId = exam.examId || exam.id;
      const res = await getExamById(examId);
      const data = res.data;

      setForm({
        examName: data.examName || exam.examName || "",
        academicYear: data.academicYear || exam.academicYear || "",
        subjectIds: data.subjectIds || (data.subjects ? data.subjects.map(s => s.subjectId) : []),
      });
    } catch (err) {
      // Fallback to row object if getExamById fails
      setForm({
        examName: exam.examName || "",
        academicYear: exam.academicYear || "",
        subjectIds: exam.subjectIds || [],
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setForm((prev) => {
      const exists = prev.subjectIds.includes(subjectId);
      const updated = exists
        ? prev.subjectIds.filter((id) => id !== subjectId)
        : [...prev.subjectIds, subjectId];
      return { ...prev, subjectIds: updated };
    });

    if (errors.subjectIds) {
      setErrors((prev) => ({ ...prev, subjectIds: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.examName || !form.examName.trim()) {
      newErrors.examName = "Exam Name is required";
    }
    if (!form.academicYear || !form.academicYear.trim()) {
      newErrors.academicYear = "Academic Year is required (e.g. 2024-25)";
    }
    if (!form.subjectIds || form.subjectIds.length === 0) {
      newErrors.subjectIds = "At least 1 subject must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        examName: form.examName.trim(),
        academicYear: form.academicYear.trim(),
        subjectIds: form.subjectIds,
      };

      if (editingExam) {
        const id = editingExam.examId || editingExam.id;
        await updateExam(id, payload);
        setAlert({ type: "success", message: "Exam updated successfully!" });
      } else {
        await addExam(payload);
        setAlert({ type: "success", message: "Exam created successfully!" });
      }
      setIsModalOpen(false);
      resetForm();
      fetchExamsAndSubjects();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to save exam.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "examName", label: "Exam Name" },
    { key: "academicYear", label: "Academic Year" },
    {
      key: "subjectCount",
      label: "Subjects",
      align: "center",
      render: (row) => row.subjectCount ?? (row.subjectIds ? row.subjectIds.length : "-"),
    },
    {
      key: "actions",
      label: "Act",
      align: "center",
      render: (row) => (
        <button
          type="button"
          onClick={() => openEditModal(row)}
          className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
          title="Edit Exam"
        >
          ✏️
        </button>
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
          <h2 className="text-xl font-bold text-gray-900">Exams</h2>
          <p className="text-xs text-gray-500">
            Define examination sessions and assign relevant subjects
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
        >
          + Add Exam
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={exams}
        emptyMessage="No exams found. Click '+ Add Exam' to define one!"
        loading={loading}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? "Edit Exam" : "Add Exam"}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Exam Name"
            name="examName"
            value={form.examName}
            onChange={handleInputChange}
            error={errors.examName}
            placeholder="e.g. Mid Term"
            required
          />
          <FormInput
            label="Academic Year"
            name="academicYear"
            value={form.academicYear}
            onChange={handleInputChange}
            error={errors.academicYear}
            placeholder="e.g. 2024-25"
            required
          />

          {/* Subjects Checkbox list */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subjects <span className="text-red-500">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-3 space-y-2 bg-gray-50">
              {allSubjects.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No subjects available. Please add subjects first in Subjects master.
                </p>
              ) : (
                allSubjects.map((sub) => {
                  const subId = sub.subjectId || sub.id;
                  const isChecked = form.subjectIds.includes(subId);
                  return (
                    <label
                      key={subId}
                      className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer hover:bg-white p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubjectToggle(subId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        {sub.subjectName}{" "}
                        <span className="text-xs text-gray-500">
                          ({sub.subjectCode})
                        </span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            {errors.subjectIds && (
              <p className="mt-1 text-xs text-red-600">{errors.subjectIds}</p>
            )}
          </div>

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
    </div>
  );
}

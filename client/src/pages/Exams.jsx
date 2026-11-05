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
import { Plus, Pencil, BookOpen, FileText } from "lucide-react";

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
          "Failed to load exams or subjects. Ensure backend is running.",
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
    setAlert(null);
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
      newErrors.academicYear = "Academic Year is required (e.g. 2025-26)";
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
        setAlert({ type: "success", message: "Exam session updated successfully!" });
      } else {
        await addExam(payload);
        setAlert({ type: "success", message: "Exam session created successfully!" });
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
    {
      key: "examName",
      label: "Exam Name",
      render: (row) => <span className="font-semibold text-slate-900 text-sm">{row.examName}</span>,
    },
    {
      key: "academicYear",
      label: "Academic Year",
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {row.academicYear}
        </span>
      ),
    },
    {
      key: "subjectCount",
      label: "Assigned Subjects",
      align: "center",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>{row.subjectCount ?? (row.subjectIds ? row.subjectIds.length : "-")} Subjects</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
            title="Edit Exam"
          >
            <Pencil className="w-3.5 h-3.5" />
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Examinations Master</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Examination schedules and mapped course curricula (No deletion permitted)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={exams}
        emptyMessage="Click '+ Add Exam' above to schedule an examination session."
        loading={loading}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? "Edit Examination Schedule" : "Create New Examination"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {alert && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}
          <FormInput
            label="Exam Name"
            name="examName"
            value={form.examName}
            onChange={handleInputChange}
            error={errors.examName}
            placeholder="e.g. Mid Term Examination 2026"
            required
          />
          <FormInput
            label="Academic Year"
            name="academicYear"
            value={form.academicYear}
            onChange={handleInputChange}
            error={errors.academicYear}
            placeholder="e.g. 2025-2026"
            required
          />

          {/* Subjects Checkbox list */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Assigned Subjects <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-1.5 bg-slate-50/60 divide-y divide-slate-100">
              {allSubjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No subjects available. Please add subjects first in the Subjects master.
                </p>
              ) : (
                allSubjects.map((sub) => {
                  const subId = sub.subjectId || sub.id;
                  const isChecked = form.subjectIds.includes(subId);
                  return (
                    <label
                      key={subId}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-blue-50 text-blue-900 border border-blue-200"
                          : "hover:bg-white text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSubjectToggle(subId)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold">
                          {sub.subjectName}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {sub.subjectCode} (Max: {sub.maxMarks})
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            {errors.subjectIds && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.subjectIds}</p>
            )}
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
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : "Save Exam"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

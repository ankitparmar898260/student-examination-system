import React, { useState, useEffect, useCallback } from "react";
import { getStudentListReport } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import SearchInput from "../../components/ui/SearchInput";
import AlertMessage from "../../components/ui/AlertMessage";

export default function StudentListReport() {
  const [students, setStudents] = useState([]);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchReports = useCallback(async (deptParam, searchParam) => {
    setLoading(true);
    try {
      const params = {};
      if (deptParam) params.department = deptParam;
      if (searchParam) params.search = searchParam;

      const res = await getStudentListReport(params);
      const list = res.data || [];
      setStudents(list);

      const depts = new Set();
      list.forEach((item) => {
        if (item.department) depts.add(item.department);
      });
      setDepartmentsList((prev) => {
        const combined = new Set([...prev, ...depts]);
        return Array.from(combined);
      });
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to load student list report. Ensure backend is running.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(department, search);
  }, [department, search, fetchReports]);

  const departmentOptions = [
    { value: "", label: "All Departments" },
    ...departmentsList.map((d) => ({ value: d, label: d })),
  ];

  const columns = [
    {
      key: "rollNumber",
      label: "Roll No",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
          {row.rollNumber}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Candidate Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
    },
    {
      key: "email",
      label: "Email Address",
      render: (row) => <span className="text-xs text-slate-600">{row.email}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
          {row.department}
        </span>
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory Report</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Filter candidates by academic department or search by name and roll number
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <FilterDropdown
          label="Department"
          value={department}
          onChange={(val) => setDepartment(val)}
          options={departmentOptions}
        />

        <SearchInput
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search by name or roll no..."
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students match the selected filter criteria."
        loading={loading}
      />
    </div>
  );
}

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

      // Collect unique departments
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

  const handleDepartmentChange = (val) => {
    setDepartment(val);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const departmentOptions = [
    { value: "", label: "All Departments" },
    ...departmentsList.map((d) => ({ value: d, label: d })),
  ];

  const columns = [
    { key: "rollNumber", label: "Roll No" },
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "department", label: "Department" },
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
        <h2 className="text-xl font-bold text-gray-900">Student List Report</h2>
        <p className="text-xs text-gray-500">
          Filter students by department or search by name / roll number
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5 bg-white p-4 rounded-lg border border-gray-200">
        <FilterDropdown
          label="Department"
          value={department}
          onChange={handleDepartmentChange}
          options={departmentOptions}
        />

        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search roll no or name..."
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students match the selected filter."
        loading={loading}
      />
    </div>
  );
}

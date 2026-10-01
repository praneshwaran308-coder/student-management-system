import { useEffect, useState } from "react";
import "./App.css";

// API URL
// Local development: http://localhost:3000
// Production: set VITE_API_URL in Render/Vercel environment variables
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

// Convert API date into yyyy-mm-dd for date input
const formatDateForInput = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Convert API date into readable format
const formatDateForDisplay = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [formData, setFormData] = useState({
    registerNumber: "",
    rollNumber: "",
    name: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    department: "",
    section: "",
    academicYear: "",
    semester: "",
    admissionYear: "",
    age: "",
    status: "Active"
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/students`);

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      setStudents(data);
    } catch (error) {
      console.log("Error fetching students:", error);
      setError("Unable to load students. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));

    setError("");
    setSuccess("");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      registerNumber: "",
      rollNumber: "",
      name: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
      department: "",
      section: "",
      academicYear: "",
      semester: "",
      admissionYear: "",
      age: "",
      status: "Active"
    });

    setEditingId(null);
  };

  // Get backend error message
  const getBackendErrorMessage = (data) => {
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.join(" | ");
    }

    if (data?.message) {
      return data.message;
    }

    return "Something went wrong. Please try again.";
  };

  // Add or Update student
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (!formData.registerNumber.trim()) {
      setError("Please enter the register number.");
      return;
    }

    if (!formData.rollNumber.trim()) {
      setError("Please enter the roll number.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter the student's name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter the student's email.");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError("Please enter the student's phone number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) {
      setError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Please select the date of birth.");
      return;
    }

    if (!formData.gender) {
      setError("Please select the gender.");
      return;
    }

    if (!formData.department.trim()) {
      setError("Please enter the student's department.");
      return;
    }

    if (!formData.section.trim()) {
      setError("Please enter the student's section.");
      return;
    }

    if (
      !formData.academicYear ||
      Number(formData.academicYear) < 1 ||
      Number(formData.academicYear) > 6
    ) {
      setError("Please enter a valid academic year between 1 and 6.");
      return;
    }

    if (
      !formData.semester ||
      Number(formData.semester) < 1 ||
      Number(formData.semester) > 12
    ) {
      setError("Please enter a valid semester between 1 and 12.");
      return;
    }

    if (
      !formData.admissionYear ||
      Number(formData.admissionYear) < 2000 ||
      Number(formData.admissionYear) > 2100
    ) {
      setError("Please enter a valid admission year.");
      return;
    }

    if (
      !formData.age ||
      Number(formData.age) < 1 ||
      Number(formData.age) > 100
    ) {
      setError("Please enter a valid age between 1 and 100.");
      return;
    }

    if (!formData.status) {
      setError("Please select the student status.");
      return;
    }

    try {
      setSaving(true);

      const studentData = {
        registerNumber: formData.registerNumber.trim(),
        rollNumber: formData.rollNumber.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        department: formData.department.trim(),
        section: formData.section.trim().toUpperCase(),
        academicYear: Number(formData.academicYear),
        semester: Number(formData.semester),
        admissionYear: Number(formData.admissionYear),
        age: Number(formData.age),
        status: formData.status
      };

      if (editingId) {
        // Update student
        const response = await fetch(
          `${API_URL}/students/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(getBackendErrorMessage(data));
        }

        setStudents((currentStudents) =>
          currentStudents.map((student) =>
            student._id === editingId ? data : student
          )
        );

        setSuccess("Student updated successfully.");

        resetForm();
      } else {
        // Add student
        const response = await fetch(`${API_URL}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(getBackendErrorMessage(data));
        }

        setStudents((currentStudents) => [
          ...currentStudents,
          data
        ]);

        setSuccess("Student added successfully.");

        resetForm();
      }
    } catch (error) {
      console.log("Error saving student:", error);

      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Start editing
  const handleEdit = (student) => {
    setEditingId(student._id);

    setFormData({
      registerNumber: student.registerNumber || "",
      rollNumber: student.rollNumber || "",
      name: student.name || "",
      email: student.email || "",
      phoneNumber: student.phoneNumber || "",
      dateOfBirth: formatDateForInput(student.dateOfBirth),
      gender: student.gender || "",
      department: student.department || "",
      section: student.section || "",
      academicYear: student.academicYear ?? "",
      semester: student.semester ?? "",
      admissionYear: student.admissionYear ?? "",
      age: student.age ?? "",
      status: student.status || "Active"
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete student
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/students/${id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getBackendErrorMessage(data));
      }

      setStudents((currentStudents) =>
        currentStudents.filter((student) => student._id !== id)
      );

      setSuccess("Student deleted successfully.");

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.log("Error deleting student:", error);

      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    resetForm();

    setError("");
    setSuccess("");
  };

  // Get unique departments
  const departments = [
    "All",
    ...new Set(
      students
        .map((student) => student.department)
        .filter((department) => department)
    )
  ];

  // Filter students
  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase().trim();

    const searchableFields = [
      student.registerNumber,
      student.rollNumber,
      student.name,
      student.email,
      student.phoneNumber,
      student.department,
      student.section,
      student.gender,
      student.academicYear,
      student.semester,
      student.admissionYear,
      student.age,
      student.status
    ];

    const matchesSearch = searchableFields.some((field) =>
      String(field ?? "").toLowerCase().includes(searchText)
    );

    const matchesDepartment =
      departmentFilter === "All" ||
      student.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Clear filters
  const handleClearFilters = () => {
    setSearch("");
    setDepartmentFilter("All");
  };

  const hasActiveFilters =
    search.trim() !== "" || departmentFilter !== "All";

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Student Management System</h1>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Error Message */}
        {error && (
          <div className="message error-message">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="message success-message">
            <span>✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* Add / Edit Student */}
        <section className="card">
          <div className="card-title">
            <h2>
              {editingId ? "Edit Student" : "Add Student"}
            </h2>

            {editingId && (
              <span className="editing-badge">
                Editing
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="student-form"
            autoComplete="off"
            spellCheck="false"
          >
            {/* Register Number */}
            <div className="form-group">
              <label htmlFor="registerNumber">
                Register Number
              </label>

              <input
                id="registerNumber"
                type="text"
                name="registerNumber"
                value={formData.registerNumber}
                onChange={handleChange}
                placeholder="Enter register number"
                spellCheck="false"
                autoComplete="off"
                required
              />
            </div>

            {/* Roll Number */}
            <div className="form-group">
              <label htmlFor="rollNumber">
                Roll Number
              </label>

              <input
                id="rollNumber"
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter roll number"
                spellCheck="false"
                autoComplete="off"
                required
              />
            </div>

            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student name"
                spellCheck="false"
                autoComplete="off"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                spellCheck="false"
                autoComplete="off"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phoneNumber">
                Phone Number
              </label>

              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                inputMode="numeric"
                maxLength="10"
                autoComplete="off"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="dateOfBirth">
                Date of Birth
              </label>

              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="department">
                Department
              </label>

              <input
                id="department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
                spellCheck="false"
                autoComplete="off"
                required
              />
            </div>

            {/* Section */}
            <div className="form-group">
              <label htmlFor="section">
                Section
              </label>

              <input
                id="section"
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="Example: A"
                spellCheck="false"
                autoComplete="off"
                required
              />
            </div>

            {/* Academic Year */}
            <div className="form-group">
              <label htmlFor="academicYear">
                Academic Year
              </label>

              <input
                id="academicYear"
                type="number"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="Example: 4"
                min="1"
                max="6"
                autoComplete="off"
                required
              />
            </div>

            {/* Semester */}
            <div className="form-group">
              <label htmlFor="semester">
                Semester
              </label>

              <input
                id="semester"
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="Example: 7"
                min="1"
                max="12"
                autoComplete="off"
                required
              />
            </div>

            {/* Admission Year */}
            <div className="form-group">
              <label htmlFor="admissionYear">
                Admission Year
              </label>

              <input
                id="admissionYear"
                type="number"
                name="admissionYear"
                value={formData.admissionYear}
                onChange={handleChange}
                placeholder="Example: 2022"
                min="2000"
                max="2100"
                autoComplete="off"
                required
              />
            </div>

            {/* Age */}
            <div className="form-group">
              <label htmlFor="age">
                Age
              </label>

              <input
                id="age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="1"
                max="100"
                autoComplete="off"
                required
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="form-buttons">
              <button
                type="submit"
                className="add-button"
                disabled={saving}
              >
                {saving
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                  ? "Update Student"
                  : "Add Student"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Student List */}
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Students</h2>

              <p className="result-text">
                Showing {filteredStudents.length} of{" "}
                {students.length} students
              </p>
            </div>

            <span className="student-count">
              {filteredStudents.length} Students
            </span>
          </div>

          {/* Search and Filter */}
          <div className="filter-section">
            <div className="search-container">
              <label htmlFor="search">
                Search Students
              </label>

              <input
                id="search"
                type="text"
                placeholder="Search by register number, name, email, phone, department..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                spellCheck="false"
                autoComplete="off"
              />
            </div>

            <div className="department-filter">
              <label htmlFor="department-filter">
                Department
              </label>

              <select
                id="department-filter"
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
              >
                {departments.map((department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department === "All"
                      ? "All Departments"
                      : department}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filter-button"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                📚
              </div>

              {students.length === 0 ? (
                <>
                  <h3>No students found</h3>

                  <p>
                    Add your first student using the form above.
                  </p>
                </>
              ) : (
                <>
                  <h3>No matching students</h3>

                  <p>
                    Try changing your search or department filter.
                  </p>

                  <button
                    type="button"
                    className="clear-empty-button"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Register No.</th>
                    <th>Roll No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Date of Birth</th>
                    <th>Gender</th>
                    <th>Department</th>
                    <th>Section</th>
                    <th>Academic Year</th>
                    <th>Semester</th>
                    <th>Admission Year</th>
                    <th>Age</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        {student.registerNumber || "-"}
                      </td>

                      <td>
                        {student.rollNumber || "-"}
                      </td>

                      <td>
                        <span className="student-name">
                          {student.name || "-"}
                        </span>
                      </td>

                      <td>
                        {student.email || "-"}
                      </td>

                      <td>
                        {student.phoneNumber || "-"}
                      </td>

                      <td>
                        {formatDateForDisplay(
                          student.dateOfBirth
                        )}
                      </td>

                      <td>
                        {student.gender || "-"}
                      </td>

                      <td>
                        <span className="department">
                          {student.department || "-"}
                        </span>
                      </td>

                      <td>
                        {student.section || "-"}
                      </td>

                      <td>
                        {student.academicYear || "-"}
                      </td>

                      <td>
                        {student.semester || "-"}
                      </td>

                      <td>
                        {student.admissionYear || "-"}
                      </td>

                      <td>
                        {student.age || "-"}
                      </td>

                      <td>
                        {student.status || "-"}
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(student)
                            }
                            disabled={
                              saving ||
                              deletingId !== null
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(student._id)
                            }
                            disabled={
                              saving ||
                              deletingId !== null
                            }
                          >
                            {deletingId === student._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
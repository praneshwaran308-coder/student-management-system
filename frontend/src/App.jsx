import { useEffect, useState } from "react";
import "./App.css";

// API URL
// Local development: http://localhost:3000
// Production: set VITE_API_URL in Render/Vercel environment variables
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    age: "",
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
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setError("");
    setSuccess("");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      department: "",
      age: "",
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
    if (!formData.name.trim()) {
      setError("Please enter the student's name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter the student's email.");
      return;
    }

    if (!formData.department.trim()) {
      setError("Please enter the student's department.");
      return;
    }

    if (!formData.age || Number(formData.age) <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    try {
      setSaving(true);

      const studentData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        age: Number(formData.age),
      };

      if (editingId) {
        // Update student
        const response = await fetch(
          `${API_URL}/students/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(getBackendErrorMessage(data));
        }

        setStudents((currentStudents) => [
          ...currentStudents,
          data,
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
      name: student.name,
      email: student.email,
      department: student.department,
      age: student.age,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
          method: "DELETE",
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
    ),
  ];

  // Filter students
  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      student.name.toLowerCase().includes(searchText) ||
      student.email.toLowerCase().includes(searchText) ||
      student.department.toLowerCase().includes(searchText);

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
                placeholder="Search by name, email or department..."
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <span className="student-name">
                          {student.name}
                        </span>
                      </td>

                      <td>
                        {student.email}
                      </td>

                      <td>
                        <span className="department">
                          {student.department}
                        </span>
                      </td>

                      <td>
                        {student.age}
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
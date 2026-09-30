const express = require("express");

const {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

const router = express.Router();

// Create student
router.post("/", createStudent);

// Get all students
router.get("/", getStudents);

// Update student
router.put("/:id", updateStudent);

// Delete student
router.delete("/:id", deleteStudent);

module.exports = router;
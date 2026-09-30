const mongoose = require("mongoose");
const Student = require("../models/Student");

// Create Student
const createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();

        res.status(201).json(student);
    } catch (error) {
        console.log("Create student error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: Object.values(error.errors).map(
                    (validationError) => validationError.message
                )
            });
        }

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Get All Students
const getStudents = async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json(students);
    } catch (error) {
        console.log("Get students error:", error);

        res.status(500).json({
            message: "Failed to fetch students"
        });
    }
};

// Update Student
const updateStudent = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);
    } catch (error) {
        console.log("Update student error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: Object.values(error.errors).map(
                    (validationError) => validationError.message
                )
            });
        }

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Delete Student
const deleteStudent = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully",
            student
        });
    } catch (error) {
        console.log("Delete student error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent
};

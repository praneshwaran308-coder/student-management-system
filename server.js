require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Student = require("./models/Student");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB Atlas connection failed:", error.message);
    });

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "Student Management API is running!"
    });
});

// Create Student
app.post("/students", async (req, res) => {
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
});

// Get All Students
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json(students);
    } catch (error) {
        console.log("Get students error:", error);

        res.status(500).json({
            message: "Failed to fetch students"
        });
    }
});

// Update Student
app.put("/students/:id", async (req, res) => {
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
});

// Delete Student
app.delete("/students/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const student = await Student.findByIdAndDelete(
            req.params.id
        );

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
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
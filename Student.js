const mongoose = require("mongoose");

// Student Schema
const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ]
        },

        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
            minlength: [2, "Department must contain at least 2 characters"],
            maxlength: [50, "Department cannot exceed 50 characters"]
        },

        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [1, "Age must be at least 1"],
            max: [100, "Age cannot be greater than 100"]
        }
    },
    {
        timestamps: true
    }
);

// Student Model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
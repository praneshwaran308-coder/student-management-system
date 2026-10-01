const mongoose = require("mongoose");

// Student Schema
const studentSchema = new mongoose.Schema(
    {
        registerNumber: {
            type: String,
            required: [true, "Register number is required"],
            trim: true,
            minlength: [2, "Register number must contain at least 2 characters"],
            maxlength: [30, "Register number cannot exceed 30 characters"],
            unique: true
        },

        rollNumber: {
            type: String,
            required: [true, "Roll number is required"],
            trim: true,
            minlength: [1, "Roll number is required"],
            maxlength: [20, "Roll number cannot exceed 20 characters"]
        },

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

        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [
                /^[6-9]\d{9}$/,
                "Please enter a valid 10-digit phone number"
            ]
        },

        dateOfBirth: {
            type: Date,
            required: [true, "Date of birth is required"]
        },

        gender: {
            type: String,
            required: [true, "Gender is required"],
            trim: true,
            enum: {
                values: ["Male", "Female", "Other"],
                message: "Gender must be Male, Female, or Other"
            }
        },

        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
            minlength: [2, "Department must contain at least 2 characters"],
            maxlength: [50, "Department cannot exceed 50 characters"]
        },

        section: {
            type: String,
            required: [true, "Section is required"],
            trim: true,
            uppercase: true,
            minlength: [1, "Section is required"],
            maxlength: [10, "Section cannot exceed 10 characters"]
        },

        academicYear: {
            type: Number,
            required: [true, "Academic year is required"],
            min: [1, "Academic year must be between 1 and 6"],
            max: [6, "Academic year must be between 1 and 6"]
        },

        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: [1, "Semester must be between 1 and 12"],
            max: [12, "Semester must be between 1 and 12"]
        },

        admissionYear: {
            type: Number,
            required: [true, "Admission year is required"],
            min: [2000, "Please enter a valid admission year"],
            max: [2100, "Please enter a valid admission year"]
        },

        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [1, "Age must be at least 1"],
            max: [100, "Age cannot be greater than 100"]
        },

        status: {
            type: String,
            required: [true, "Status is required"],
            trim: true,
            enum: {
                values: ["Active", "Inactive", "Graduated", "Suspended"],
                message: "Invalid student status"
            },
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
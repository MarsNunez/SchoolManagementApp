import mongoose from "mongoose";

const { Schema } = mongoose;

const StudentSchema = new Schema(
  {
    student_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    guardians: [
      {
        full_name: { type: String, required: true, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
      },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    dni: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    birth_date: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    current_courses: [
      {
        type: String,
        ref: "Course",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const StudentModel = mongoose.model("Student", StudentSchema);

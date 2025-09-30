import mongoose from "mongoose";

const { Schema } = mongoose;

const CourseSchema = new Schema(
  {
    course_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "Sin descripción.",
      trim: true,
    },
    teacher_id: {
      type: String,
      trim: true,
    },
    duration: {
      // 4 -> 4 horas semanales
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const CourseModel = mongoose.model("courses", CourseSchema);

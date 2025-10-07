import mongoose from "mongoose";

const { Schema } = mongoose;

const SyllabusSchema = new Schema(
  {
    syllabus_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 0,
    },
    courses: [
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

export const SyllabusModel = mongoose.model("Syllabus", SyllabusSchema);

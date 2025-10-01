import mongoose from "mongoose";

const { Schema } = mongoose;

const SectionSchema = new Schema(
  {
    section_id: {
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
    syllabus_id: {
      type: String,
      required: true,
      trim: true,
    },
    teacher_id: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 0,
    },
    max_capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    current_capacity: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const SectionModel = mongoose.model("sections", SectionSchema);

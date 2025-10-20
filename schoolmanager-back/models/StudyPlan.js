import mongoose from "mongoose";

const { Schema } = mongoose;

const StudyPlanSchema = new Schema(
  {
    studyPlan_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["primaria", "secundaria"],
    },
    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    state: {
      type: String,
      required: true,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    minGrade: {
      type: Number,
      required: true,
      default: 12,
      min: 11,
    },
  },
  {
    timestamps: true,
  }
);

export const StudyPlanModel = mongoose.model("StudyPlan", StudyPlanSchema);

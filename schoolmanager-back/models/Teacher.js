import mongoose from "mongoose";

const { Schema } = mongoose;

const TeacherSchema = new Schema(
  {
    teacher_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    specialties: {
      type: String,
      required: true,
      trim: true,
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
    photo: {
      type: String,
      trim: true,
      default:
        "https://png.pngitem.com/pimgs/s/678-6785836_my-account-icon-png-png-download-instagram-profile.png",
    },
  },
  {
    timestamps: true,
  }
);

export const TeacherModel = mongoose.model("teachers", TeacherSchema);

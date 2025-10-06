import mongoose from "mongoose";

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    links: {
      type: [String],
      default: [],
      trim: true,
    },
    creator_id: {
      type: String,
      required: true,
      ref: "Teacher",
    },
  },
  {
    timestamps: true,
  }
);

export const PostModel = mongoose.model("Post", PostSchema);

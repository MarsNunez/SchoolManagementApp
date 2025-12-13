import mongoose from "mongoose";

const { Schema } = mongoose;

const SupplyItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 1 },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const SupplyListSchema = new Schema(
  {
    list_id: {
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
    section_id: {
      type: String,
      ref: "Section",
      required: true,
      trim: true,
    },
    template: {
      type: String,
      trim: true,
      default: "default",
    },
    paddingTop: {
      type: Number,
      default: 80,
      min: 0,
    },
    paddingRight: {
      type: Number,
      default: 80,
      min: 0,
    },
    paddingBottom: {
      type: Number,
      default: 80,
      min: 0,
    },
    paddingLeft: {
      type: Number,
      default: 80,
      min: 0,
    },
    items: {
      type: [SupplyItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const SupplyListModel = mongoose.model("SupplyList", SupplyListSchema);

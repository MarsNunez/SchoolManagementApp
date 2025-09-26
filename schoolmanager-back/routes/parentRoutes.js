import express from "express";
import { ParentModel } from "../models/Parent.js";

const router = express.Router();

// GET ALL PARENTS
router.get("/", async (req, res) => {
  try {
    const parents = await ParentModel.find();
    res.json(parents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching parents", error: error.message });
  }
});

// GET A PARENT BY parentId
router.get("/:parentId", async (req, res) => {
  try {
    const parent = await ParentModel.findOne({
      parent_id: req.params.parentId,
    });
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    res.json(parent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching parent", error: error.message });
  }
});

// POST A NEW PARENT
router.post("/", async (req, res) => {
  try {
    const parent = await ParentModel.create(req.body);
    res.status(201).json(parent);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating parent", error: error.message });
  }
});

// UPDATE A PARENT BY parentId
router.put("/:parentId", async (req, res) => {
  try {
    const parent = await ParentModel.findOneAndUpdate(
      { parent_id: req.params.parentId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.json(parent);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating parent", error: error.message });
  }
});

// DELETE A PARENT BY parentId
router.delete("/:parentId", async (req, res) => {
  try {
    const parent = await ParentModel.findOneAndDelete({
      parent_id: req.params.parentId,
    });
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.json({ message: "Parent deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting parent", error: error.message });
  }
});

const parentRoutes = router;

export { parentRoutes };
export default parentRoutes;

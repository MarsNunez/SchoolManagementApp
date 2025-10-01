import express from "express";
import { SyllabusModel } from "../models/Syllabus.js";

const router = express.Router();

// GET ALL SYLLABUSES
router.get("/", async (req, res) => {
  try {
    const syllabuses = await SyllabusModel.find();
    res.json(syllabuses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching syllabuses", error: error.message });
  }
});

// GET A SYLLABUS BY syllabusId
router.get("/:syllabusId", async (req, res) => {
  try {
    const syllabus = await SyllabusModel.findOne({
      syllabus_id: req.params.syllabusId,
    });
    if (!syllabus) {
      return res.status(404).json({ message: "Syllabus not found" });
    }
    res.json(syllabus);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching syllabus", error: error.message });
  }
});

// POST A NEW SYLLABUS
router.post("/", async (req, res) => {
  try {
    const syllabus = await SyllabusModel.create(req.body);
    res.status(201).json(syllabus);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating syllabus", error: error.message });
  }
});

// UPDATE A SYLLABUS BY syllabusId
router.put("/:syllabusId", async (req, res) => {
  try {
    const syllabus = await SyllabusModel.findOneAndUpdate(
      { syllabus_id: req.params.syllabusId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!syllabus) {
      return res.status(404).json({ message: "Syllabus not found" });
    }

    res.json(syllabus);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating syllabus", error: error.message });
  }
});

// DELETE A SYLLABUS BY syllabusId
router.delete("/:syllabusId", async (req, res) => {
  try {
    const syllabus = await SyllabusModel.findOneAndDelete({
      syllabus_id: req.params.syllabusId,
    });
    if (!syllabus) {
      return res.status(404).json({ message: "Syllabus not found" });
    }

    res.json({ message: "Syllabus deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting syllabus", error: error.message });
  }
});

const syllabusRoutes = router;

export { syllabusRoutes };
export default syllabusRoutes;

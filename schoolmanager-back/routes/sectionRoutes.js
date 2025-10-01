import express from "express";
import { SectionModel } from "../models/Section.js";

const router = express.Router();

// GET ALL SECTIONS
router.get("/", async (req, res) => {
  try {
    const sections = await SectionModel.find();
    res.json(sections);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sections", error: error.message });
  }
});

// GET A SECTION BY sectionId
router.get("/:sectionId", async (req, res) => {
  try {
    const section = await SectionModel.findOne({
      section_id: req.params.sectionId,
    });
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching section", error: error.message });
  }
});

// POST A NEW SECTION
router.post("/", async (req, res) => {
  try {
    const section = await SectionModel.create(req.body);
    res.status(201).json(section);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating section", error: error.message });
  }
});

// UPDATE A SECTION BY sectionId
router.put("/:sectionId", async (req, res) => {
  try {
    const section = await SectionModel.findOneAndUpdate(
      { section_id: req.params.sectionId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json(section);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating section", error: error.message });
  }
});

// DELETE A SECTION BY sectionId
router.delete("/:sectionId", async (req, res) => {
  try {
    const section = await SectionModel.findOneAndDelete({
      section_id: req.params.sectionId,
    });
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting section", error: error.message });
  }
});

const sectionRoutes = router;

export { sectionRoutes };
export default sectionRoutes;

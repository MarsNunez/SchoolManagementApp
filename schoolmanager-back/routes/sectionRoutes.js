import express from "express";
import { SectionModel } from "../models/Section.js";

const router = express.Router();

const GROUPS = new Set(["A", "B", "C", "D", "E"]);

const normalizeSectionPayload = (payload = {}) => {
  const next = { ...payload };
  if (typeof next.group === "string") {
    next.group = next.group.trim().toUpperCase();
  }
  return next;
};

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
    const payload = normalizeSectionPayload(req.body);
    if (!payload.group || !GROUPS.has(payload.group)) {
      return res
        .status(400)
        .json({ message: "Invalid group. Allowed values are A, B, C, D, E." });
    }
    const section = await SectionModel.create(payload);
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
    const payload = normalizeSectionPayload(req.body);
    if (
      Object.prototype.hasOwnProperty.call(payload, "group") &&
      payload.group &&
      !GROUPS.has(payload.group)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid group. Allowed values are A, B, C, D, E." });
    }
    const section = await SectionModel.findOneAndUpdate(
      { section_id: req.params.sectionId },
      payload,
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

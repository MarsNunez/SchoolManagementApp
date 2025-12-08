import express from "express";
import { SectionModel } from "../models/Section.js";
import { StudentModel } from "../models/Student.js";
import { requireStaffAuth } from "../middlewares/staffAuthMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

const GROUPS = new Set(["A", "B", "C", "D", "E"]);

const normalizeSectionPayload = (payload = {}) => {
  const next = { ...payload };
  if (typeof next.group === "string") {
    next.group = next.group.trim().toUpperCase();
  }
  return next;
};

router.use(requireStaffAuth);

// GET ALL SECTIONS
router.get("/", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const sections = await SectionModel.find().lean();
    const ids = sections
      .map((section) => section.section_id)
      .filter((id) => typeof id === "string" && id.length > 0);

    let countsById = {};
    if (ids.length > 0) {
      const counts = await StudentModel.aggregate([
        { $match: { section_id: { $in: ids } } },
        { $group: { _id: "$section_id", count: { $sum: 1 } } },
      ]);
      countsById = counts.reduce((acc, doc) => {
        acc[doc._id] = doc.count;
        return acc;
      }, {});
    }

    const result = sections.map((section) => ({
      ...section,
      enrolledCount: countsById[section.section_id] || 0,
    }));

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sections", error: error.message });
  }
});

// GET A SECTION BY sectionId
router.get("/:sectionId", requireRole("admin", "secretary"), async (req, res) => {
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
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const generateUniqueSectionId = async () => {
      for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, "0");
        const candidate = `SEC-${num}`;
        const exists = await SectionModel.exists({ section_id: candidate });
        if (!exists) return candidate;
      }
      throw new Error("Could not generate unique section_id");
    };

    const payload = normalizeSectionPayload(req.body);
    if (!payload.group || !GROUPS.has(payload.group)) {
      return res
        .status(400)
        .json({ message: "Invalid group. Allowed values are A, B, C, D, E." });
    }

    const section_id = await generateUniqueSectionId();
    const section = await SectionModel.create({
      ...payload,
      section_id,
    });
    res.status(201).json(section);
  } catch (error) {
    const status = error.message?.includes("section_id") ? 409 : 400;
    res.status(status).json({
      message: "Error creating section",
      error: error.message,
    });
  }
});

// UPDATE A SECTION BY sectionId
router.put("/:sectionId", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const payload = normalizeSectionPayload(req.body);
    const requesterRole = req.staff?.role;

    if (
      Object.prototype.hasOwnProperty.call(payload, "group") &&
      payload.group &&
      !GROUPS.has(payload.group)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid group. Allowed values are A, B, C, D, E." });
    }

    // Secretaries cannot modify capacity or year
    if (requesterRole === "secretary") {
      delete payload.start_capacity;
      delete payload.max_capacity;
      delete payload.year;
      delete payload.section_id;
    }

    if (Object.keys(payload).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
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
router.delete("/:sectionId", requireRole("admin"), async (req, res) => {
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

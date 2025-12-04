import express from "express";
import { StudyPlanModel } from "../models/StudyPlan.js";
import { requireStaffAuth } from "../middlewares/staffAuthMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();
router.use(requireStaffAuth);

// GET ALL STUDY PLANS
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const studyPlans = await StudyPlanModel.find();
    res.json(studyPlans);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching study plans", error: error.message });
  }
});

// GET A STUDY PLAN BY studyPlanId
router.get("/:studyPlanId", requireRole("admin"), async (req, res) => {
  try {
    const studyPlan = await StudyPlanModel.findOne({
      studyPlan_id: req.params.studyPlanId,
    });
    if (!studyPlan) {
      return res.status(404).json({ message: "Study plan not found" });
    }
    res.json(studyPlan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching study plan", error: error.message });
  }
});

// CREATE A STUDY PLAN
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const generateUniqueStudyPlanId = async () => {
      for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, "0");
        const candidate = `STP-${num}`;
        const exists = await StudyPlanModel.exists({
          studyPlan_id: candidate,
        });
        if (!exists) return candidate;
      }
      throw new Error("Could not generate unique studyPlan_id");
    };

    const studyPlan_id = await generateUniqueStudyPlanId();
    const body = { ...req.body, studyPlan_id, version: 1 };
    const studyPlan = await StudyPlanModel.create(body);
    res.status(201).json(studyPlan);
  } catch (error) {
    const status = error.message?.includes("studyPlan_id") ? 409 : 400;
    res.status(status).json({
      message: "Error creating study plan",
      error: error.message,
    });
  }
});

// UPDATE A STUDY PLAN BY studyPlanId
router.put("/:studyPlanId", requireRole("admin"), async (req, res) => {
  try {
    const { version, ...rawData } = req.body;
    const data = Object.fromEntries(
      Object.entries(rawData).filter(([, value]) => value !== undefined)
    );
    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const onlyStateUpdate =
      Object.keys(data).length === 1 && Object.prototype.hasOwnProperty.call(data, "state");

    const updateOps = { $set: data };
    if (!onlyStateUpdate) {
      updateOps.$inc = { version: 1 };
    }

    const studyPlan = await StudyPlanModel.findOneAndUpdate(
      { studyPlan_id: req.params.studyPlanId },
      updateOps,
      { new: true, runValidators: true }
    );

    if (!studyPlan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    res.json(studyPlan);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating study plan", error: error.message });
  }
});

// DELETE A STUDY PLAN BY studyPlanId
router.delete("/:studyPlanId", requireRole("admin"), async (req, res) => {
  try {
    const studyPlan = await StudyPlanModel.findOneAndDelete({
      studyPlan_id: req.params.studyPlanId,
    });
    if (!studyPlan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    res.json({ message: "Study plan deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting study plan", error: error.message });
  }
});

const studyPlanRoutes = router;

export { studyPlanRoutes };
export default studyPlanRoutes;

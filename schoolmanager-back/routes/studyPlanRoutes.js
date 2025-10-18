import express from "express";
import { StudyPlanModel } from "../models/StudyPlan.js";

const router = express.Router();

// GET ALL STUDY PLANS
router.get("/", async (req, res) => {
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
router.get("/:studyPlanId", async (req, res) => {
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
router.post("/", async (req, res) => {
  try {
    const body = { ...req.body, version: 1 };
    const studyPlan = await StudyPlanModel.create(body);
    res.status(201).json(studyPlan);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating study plan", error: error.message });
  }
});

// UPDATE A STUDY PLAN BY studyPlanId
router.put("/:studyPlanId", async (req, res) => {
  try {
    const { version, ...data } = req.body;
    const studyPlan = await StudyPlanModel.findOneAndUpdate(
      { studyPlan_id: req.params.studyPlanId },
      { $set: data, $inc: { version: 1 } },
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
router.delete("/:studyPlanId", async (req, res) => {
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

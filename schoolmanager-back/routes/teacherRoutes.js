import express from "express";
import { TeacherModel } from "../models/Teacher.js";

const router = express.Router();

// GET ALL TEACHERS
router.get("/", async (req, res) => {
  try {
    const teachers = await TeacherModel.find();
    res.json(teachers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teachers", error: error.message });
  }
});

// GET A TEACHER BY teacherId
router.get("/:teacherId", async (req, res) => {
  try {
    const teacher = await TeacherModel.findOne({
      teacher_id: req.params.teacherId,
    });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teacher", error: error.message });
  }
});

// POST A NEW TEACHER
router.post("/", async (req, res) => {
  try {
    const teacher = await TeacherModel.create(req.body);
    res.status(201).json(teacher);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating teacher", error: error.message });
  }
});

// UPDATE A TEACHER BY teacherId
router.put("/:teacherId", async (req, res) => {
  try {
    const teacher = await TeacherModel.findOneAndUpdate(
      { teacher_id: req.params.teacherId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating teacher", error: error.message });
  }
});

// DELETE A TEACHER BY teacherId
router.delete("/:teacherId", async (req, res) => {
  try {
    const teacher = await TeacherModel.findOneAndDelete({
      teacher_id: req.params.teacherId,
    });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting teacher", error: error.message });
  }
});

const teacherRoutes = router;

export { teacherRoutes };
export default teacherRoutes;

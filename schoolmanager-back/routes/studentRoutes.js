import express from "express";
import { StudentModel } from "../models/Student.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireStaffAuth } from "../middlewares/staffAuthMiddleware.js";

const router = express.Router();
router.use(requireStaffAuth);

// GET ALL STUDENTS
router.get("/", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const students = await StudentModel.find();
    res.json(students);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching students", error: error.message });
  }
});

// GET A STUDENT BY studentId
router.get(
  "/:studentId",
  requireRole("admin", "secretary"),
  async (req, res) => {
    try {
      const student = await StudentModel.findOne({
        student_id: req.params.studentId,
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching student", error: error.message });
    }
  }
);

// POST A NEW STUDENT (auto-generate student_id: EST-XXXXXX)
router.post("/", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const generateUniqueStudentId = async () => {
      for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, "0");
        const candidate = `EST-${num}`;
        const exists = await StudentModel.exists({ student_id: candidate });
        if (!exists) return candidate;
      }
      throw new Error("Could not generate unique student_id");
    };

    const student_id = await generateUniqueStudentId();
    const body = { ...req.body, student_id };
    const student = await StudentModel.create(body);
    res.status(201).json(student);
  } catch (error) {
    const status = error.message?.includes("student_id") ? 409 : 400;
    res
      .status(status)
      .json({ message: "Error creating student", error: error.message });
  }
});

// UPDATE A STUDENT BY studentId
router.put(
  "/:studentId",
  requireRole("admin", "secretary"),
  async (req, res) => {
    try {
      const student = await StudentModel.findOneAndUpdate(
        { student_id: req.params.studentId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error updating student", error: error.message });
    }
  }
);

// DELETE A STUDENT BY studentId
router.delete(
  "/:studentId",
  requireRole("admin", "secretary"),
  async (req, res) => {
    try {
      const student = await StudentModel.findOneAndDelete({
        student_id: req.params.studentId,
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting student", error: error.message });
    }
  }
);

const studentRoutes = router;

export { studentRoutes };
export default studentRoutes;

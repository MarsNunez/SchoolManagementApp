import express from "express";
import { StudentModel } from "../models/Student.js";

const router = express.Router();

// GET ALL STUDENTS
router.get("/", async (req, res) => {
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
router.get("/:studentId", async (req, res) => {
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
});

// POST A NEW STUDENT
router.post("/", async (req, res) => {
  try {
    const student = await StudentModel.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating student", error: error.message });
  }
});

// UPDATE A STUDENT BY studentId
router.put("/:studentId", async (req, res) => {
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
});

// DELETE A STUDENT BY studentId
router.delete("/:studentId", async (req, res) => {
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
});

const studentRoutes = router;

export { studentRoutes };
export default studentRoutes;

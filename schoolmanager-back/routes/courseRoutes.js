import express from "express";
import { CourseModel } from "../models/Course.js";

const router = express.Router();

// GET ALL COURSES
router.get("/", async (req, res) => {
  try {
    const courses = await CourseModel.find({});
    res.json(courses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
});

// GET COURSE BY courseId
router.get("/:courseId", async (req, res) => {
  try {
    const course = await CourseModel.findOne({
      course_id: req.params.courseId,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching course", error: error.message });
  }
});

// POST A NEW COURSE
router.post("/", async (req, res) => {
  try {
    const course = await CourseModel.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating course", error: error.message });
  }
});

// UPDATE COURSE BY courseId
router.put("/:courseId", async (req, res) => {
  try {
    const course = await CourseModel.findOneAndUpdate(
      { course_id: req.params.courseId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating course", error: error.message });
  }
});

// DELTE COURSE BY courseId
router.delete("/:courseId", async (req, res) => {
  try {
    const course = await CourseModel.findOneAndDelete({
      course_id: req.params.courseId,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting course", error: error.message });
  }
});

export { router as courseRoutes };

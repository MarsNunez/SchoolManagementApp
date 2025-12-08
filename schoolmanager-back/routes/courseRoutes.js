import express from "express";
import { CourseModel } from "../models/Course.js";
import { requireStaffAuth } from "../middlewares/staffAuthMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(requireStaffAuth);

// GET ALL COURSES
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const courses = await CourseModel.find();
    res.json(courses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
});

// GET COURSE BY courseId
router.get(
  "/:courseId",
  requireRole("admin"),
  async (req, res) => {
    try {
      const course = await CourseModel.findOne({
        course_id: req.params.courseId,
      });
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }
      res.json(course);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching course", error: error.message });
    }
  }
);

// CREATE COURSE
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const generateUniqueCourseId = async () => {
      for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, "0");
        const candidate = `CUR-${num}`;
        const exists = await CourseModel.exists({ course_id: candidate });
        if (!exists) return candidate;
      }
      throw new Error("Could not generate unique course_id");
    };

    const course_id = await generateUniqueCourseId();
    const body = { ...req.body, course_id };
    const course = await CourseModel.create(body);
    res.status(201).json(course);
  } catch (error) {
    const status = error.message?.includes("course_id") ? 409 : 400;
    res
      .status(status)
      .json({ message: "Error creating course", error: error.message });
  }
});

// UPDATE COURSE BY courseId
router.put(
  "/:courseId",
  requireRole("admin"),
  async (req, res) => {
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
  }
);

// DELETE COURSE BY courseId
router.delete(
  "/:courseId",
  requireRole("admin"),
  async (req, res) => {
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
  }
);

const courseRoutes = router;

export { courseRoutes };
export default courseRoutes;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { courseRoutes } from "./routes/courseRoutes.js";
import { postRoutes } from "./routes/postRoutes.js";
import { staffRoutes } from "./routes/staffRoutes.js";
import { studyPlanRoutes } from "./routes/studyPlanRoutes.js";
import { sectionRoutes } from "./routes/sectionRoutes.js";
import { teacherRoutes } from "./routes/teacherRoutes.js";
import { studentRoutes } from "./routes/studentRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/courses", courseRoutes);
app.use("/posts", postRoutes);
app.use("/staff", staffRoutes);
app.use("/study-plans", studyPlanRoutes);
app.use("/sections", sectionRoutes);
app.use("/teachers", teacherRoutes);
app.use("/students", studentRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Backend server is up...");
});

export default app;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { postRoutes } from "./routes/postRoutes.js";
import { teacherRoutes } from "./routes/teacherRoutes.js";
import { parentRoutes } from "./routes/parentRoutes.js";
import { studentRoutes } from "./routes/studentRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/posts", postRoutes);
app.use("/teachers", teacherRoutes);
app.use("/parents", parentRoutes);
app.use("/students", studentRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Backend server is up...");
});

export default app;

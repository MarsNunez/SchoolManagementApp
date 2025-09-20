import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { courseRoutes } from "./routes/courseRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/courses", courseRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Backend server is up...");
});

export default app;

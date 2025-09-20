import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Backend server is up.");
});

const PORT = process.env.PORT || 3001;
const DB_URL = process.env.DB_URL;

const startServer = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🟢 App running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("❌ MongoDB connection error:", error);
  }
};

startServer();

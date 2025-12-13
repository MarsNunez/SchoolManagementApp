import express from "express";
import { SupplyListModel } from "../models/SupplyList.js";
import { requireStaffAuth } from "../middlewares/staffAuthMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();
router.use(requireStaffAuth);

const generateUniqueListId = async () => {
  for (let i = 0; i < 10; i++) {
    const num = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");
    const candidate = `LIS-${num}`;
    const exists = await SupplyListModel.exists({ list_id: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Could not generate unique list_id");
};

// GET ALL SUPPLY LISTS
router.get("/", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const lists = await SupplyListModel.find();
    res.json(lists);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching supply lists", error: error.message });
  }
});

// GET SUPPLY LIST BY listId
router.get("/:listId", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const list = await SupplyListModel.findOne({ list_id: req.params.listId });
    if (!list) {
      return res.status(404).json({ message: "Supply list not found" });
    }
    res.json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching supply list", error: error.message });
  }
});

// CREATE SUPPLY LIST
router.post("/", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const list_id = await generateUniqueListId();
    const payload = {
      ...req.body,
      list_id,
      template: req.body.template || "default",
      paddingTop: Number.isFinite(Number(req.body.paddingTop))
        ? Number(req.body.paddingTop)
        : 80,
      paddingRight: Number.isFinite(Number(req.body.paddingRight))
        ? Number(req.body.paddingRight)
        : 80,
      paddingBottom: Number.isFinite(Number(req.body.paddingBottom))
        ? Number(req.body.paddingBottom)
        : 80,
      paddingLeft: Number.isFinite(Number(req.body.paddingLeft))
        ? Number(req.body.paddingLeft)
        : 80,
    };
    const list = await SupplyListModel.create(payload);
    res.status(201).json(list);
  } catch (error) {
    const status = error.message?.includes("list_id") ? 409 : 400;
    res
      .status(status)
      .json({ message: "Error creating supply list", error: error.message });
  }
});

// UPDATE SUPPLY LIST
router.put("/:listId", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const payload = { ...req.body };
    const numOr = (v, fallback) =>
      Number.isFinite(Number(v)) ? Number(v) : fallback;
    if (Object.prototype.hasOwnProperty.call(payload, "paddingTop")) {
      payload.paddingTop = numOr(payload.paddingTop, 80);
    }
    if (Object.prototype.hasOwnProperty.call(payload, "paddingRight")) {
      payload.paddingRight = numOr(payload.paddingRight, 80);
    }
    if (Object.prototype.hasOwnProperty.call(payload, "paddingBottom")) {
      payload.paddingBottom = numOr(payload.paddingBottom, 80);
    }
    if (Object.prototype.hasOwnProperty.call(payload, "paddingLeft")) {
      payload.paddingLeft = numOr(payload.paddingLeft, 80);
    }
    if (payload.template === undefined || payload.template === null) {
      delete payload.template;
    }

    const list = await SupplyListModel.findOneAndUpdate(
      { list_id: req.params.listId },
      payload,
      { new: true, runValidators: true }
    );
    if (!list) {
      return res.status(404).json({ message: "Supply list not found" });
    }
    res.json(list);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating supply list", error: error.message });
  }
});

// DELETE SUPPLY LIST
router.delete("/:listId", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const list = await SupplyListModel.findOneAndDelete({
      list_id: req.params.listId,
    });
    if (!list) {
      return res.status(404).json({ message: "Supply list not found" });
    }
    res.json({ message: "Supply list deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting supply list", error: error.message });
  }
});

const supplyListRoutes = router;

export { supplyListRoutes };
export default supplyListRoutes;

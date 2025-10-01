import express from "express";
import { StaffModel } from "../models/Staff.js";

const router = express.Router();

// GET ALL STAFF
router.get("/", async (req, res) => {
  try {
    const staff = await StaffModel.find();
    res.json(staff);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching staff", error: error.message });
  }
});

// GET STAFF MEMBER BY staffId
router.get("/:staffId", async (req, res) => {
  try {
    const staffMember = await StaffModel.findOne({
      staff_id: req.params.staffId,
    });
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.json(staffMember);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching staff member", error: error.message });
  }
});

// POST A NEW STAFF MEMBER
router.post("/", async (req, res) => {
  try {
    const staffMember = await StaffModel.create(req.body);
    res.status(201).json(staffMember);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating staff member", error: error.message });
  }
});

// UPDATE STAFF MEMBER BY staffId
router.put("/:staffId", async (req, res) => {
  try {
    const staffMember = await StaffModel.findOneAndUpdate(
      { staff_id: req.params.staffId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(staffMember);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating staff member", error: error.message });
  }
});

// DELETE STAFF MEMBER BY staffId
router.delete("/:staffId", async (req, res) => {
  try {
    const staffMember = await StaffModel.findOneAndDelete({
      staff_id: req.params.staffId,
    });
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting staff member", error: error.message });
  }
});

const staffRoutes = router;

export { staffRoutes };
export default staffRoutes;

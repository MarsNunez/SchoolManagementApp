import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StaffModel } from "../models/Staff.js";
import { requireStaffAuth } from "../middlewares/staffAuthMiddleware.js";

const router = express.Router();

// NOTAS:
// ROLES: Admin -> Secceratria -> Porfesor / Esdudiante / Padre

const sanitizeStaff = (staffDoc) => {
  if (!staffDoc) return staffDoc;
  const staffObject = staffDoc.toObject ? staffDoc.toObject() : staffDoc;
  const { password, ...rest } = staffObject;
  return rest;
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const buildTokenPayload = (staff) => ({
  staffId: staff.staff_id,
  role: staff.role,
});

const createAuthResponse = (staff) => ({
  token: jwt.sign(buildTokenPayload(staff), getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  }),
  staff: sanitizeStaff(staff),
});

// REGISTER STAFF MEMBER
router.post("/register", async (req, res) => {
  try {
    const { staff_id, name, lastname, dni, email, password, role, state } =
      req.body;

    if (
      !staff_id ||
      !name ||
      !lastname ||
      !dni ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        code: "REGISTER_VALIDATION_ERROR",
        message:
          "staff_id, name, lastname, dni, email, password and role are required",
      });
    }

    const existingStaff = await StaffModel.findOne({
      $or: [{ staff_id }, { email }, { dni }],
    });

    if (existingStaff) {
      return res.status(409).json({
        code: "REGISTER_CONFLICT",
        message: "Staff member with provided identifiers already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await StaffModel.create({
      staff_id,
      name,
      lastname,
      dni,
      email,
      password: hashedPassword,
      role,
      state: typeof state === "boolean" ? state : true,
    });

    return res.status(201).json(createAuthResponse(staff));
  } catch (error) {
    const status = error.message === "JWT_SECRET is not configured" ? 500 : 400;
    return res.status(status).json({
      code: "REGISTER_FAILED",
      message: "Error creating staff member",
      details: error.message,
    });
  }
});

// LOGIN STAFF MEMBER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: "LOGIN_VALIDATION_ERROR",
        message: "email and password are required",
      });
    }

    const staff = await StaffModel.findOne({ email });

    if (!staff) {
      return res.status(401).json({
        code: "LOGIN_INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, staff.password);

    if (!isMatch) {
      return res.status(401).json({
        code: "LOGIN_INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    return res.status(200).json(createAuthResponse(staff));
  } catch (error) {
    const status = error.message === "JWT_SECRET is not configured" ? 500 : 400;
    return res.status(status).json({
      code: "LOGIN_FAILED",
      message: "Error logging in",
      details: error.message,
    });
  }
});

router.use(requireStaffAuth);

// GET ALL STAFF
router.get("/", async (req, res) => {
  try {
    const staff = await StaffModel.find();
    const sanitized = staff.map((member) => sanitizeStaff(member));
    res.json(sanitized);
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
    res.json(sanitizeStaff(staffMember));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching staff member", error: error.message });
  }
});

// UPDATE STAFF MEMBER BY staffId
router.put("/:staffId", async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const staffMember = await StaffModel.findOneAndUpdate(
      { staff_id: req.params.staffId },
      payload,
      { new: true, runValidators: true }
    );

    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(sanitizeStaff(staffMember));
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

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StaffModel } from "../models/Staff.js";
import { requireStaffAuth } from "../middlewares/staffAuthMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

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

// REGISTER STAFF MEMBER
router.post("/register", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const { name, lastname, dni, email, password, role, state } =
      req.body;

    if (!name || !lastname || !dni || !email || !password || !role) {
      return res.status(400).json({
        code: "REGISTER_VALIDATION_ERROR",
        message: "name, lastname, dni, email, password and role are required",
      });
    }

    // Ensure email or dni are not already taken
    const existingStaff = await StaffModel.findOne({
      $or: [{ email }, { dni }],
    });

    if (existingStaff) {
      return res.status(409).json({
        code: "REGISTER_CONFLICT",
        message: "Staff member with provided identifiers already exists",
      });
    }

    const requesterRole = req.staff?.role;
    const normalizedRole = String(role || "").toLowerCase() || "secretary";

    if (normalizedRole === "teacher") {
      return res.status(400).json({
        code: "INVALID_ROLE",
        message: "Teacher is not a valid staff role",
      });
    }

    if (requesterRole === "secretary" && normalizedRole === "admin") {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "Secretaries cannot create admin users",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique staff_id with format STF-XXXXXX
    const generateUniqueStaffId = async () => {
      for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, "0");
        const candidate = `STF-${num}`;
        const exists = await StaffModel.exists({ staff_id: candidate });
        if (!exists) return candidate;
      }
      throw new Error("Could not generate unique staff_id");
    };

    const staff_id = await generateUniqueStaffId();

    const staff = await StaffModel.create({
      staff_id,
      name,
      lastname,
      dni,
      email,
      password: hashedPassword,
      role: normalizedRole,
      state: typeof state === "boolean" ? state : true,
    });

    return res.status(201).json(createAuthResponse(staff));
  } catch (error) {
    const status =
      error.message === "JWT_SECRET is not configured" ||
      error.message === "Could not generate unique staff_id"
        ? 500
        : 400;
    return res.status(status).json({
      code: "REGISTER_FAILED",
      message: "Error creating staff member",
      details: error.message,
    });
  }
});

// GET ALL STAFF
router.get("/", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const requesterRole = req.staff?.role;
    const filter =
      requesterRole === "secretary" ? { role: { $ne: "admin" } } : {};
    const staff = await StaffModel.find(filter);
    const sanitized = staff.map((member) => sanitizeStaff(member));
    res.json(sanitized);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching staff", error: error.message });
  }
});

// GET STAFF MEMBER BY staffId
router.get("/:staffId", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const staffMember = await StaffModel.findOne({
      staff_id: req.params.staffId,
    });
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (req.staff?.role === "secretary" && staffMember.role === "admin") {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "Secretaries cannot access admin users",
      });
    }
    res.json(sanitizeStaff(staffMember));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching staff member", error: error.message });
  }
});

// UPDATE STAFF MEMBER BY staffId
router.put("/:staffId", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const requesterRole = req.staff?.role;
    const payload = { ...req.body };

    const target = await StaffModel.findOne({ staff_id: req.params.staffId });
    if (!target) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const targetRole = String(target.role || "").toLowerCase();

    // Secretaries cannot act on admins
    if (requesterRole === "secretary" && targetRole === "admin") {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "Secretaries cannot modify admin users",
      });
    }

    if (payload.role) {
      const incomingRole = String(payload.role).toLowerCase();
      if (incomingRole === "teacher") {
        return res.status(400).json({
          code: "INVALID_ROLE",
          message: "Teacher is not a valid staff role",
        });
      }
      payload.role = incomingRole;
    }

    // If secretary, block changing email, password, or state of teacher/secretary
    if (requesterRole === "secretary") {
      delete payload.email;
      delete payload.state;
      if (payload.password) {
        delete payload.password;
      }
    } else if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    // If nothing to update
    if (Object.keys(payload).length === 0) {
      return res
        .status(400)
        .json({ message: "No allowed fields provided for update" });
    }

    const staffMember = await StaffModel.findOneAndUpdate(
      { staff_id: req.params.staffId },
      payload,
      { new: true, runValidators: true }
    );

    res.json(sanitizeStaff(staffMember));
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating staff member", error: error.message });
  }
});

// DELETE STAFF MEMBER BY staffId
router.delete("/:staffId", requireRole("admin", "secretary"), async (req, res) => {
  try {
    const requesterRole = req.staff?.role;

    const staffMember = await StaffModel.findOne({
      staff_id: req.params.staffId,
    });
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (requesterRole === "secretary" && staffMember.role === "admin") {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "Secretaries cannot delete admin users",
      });
    }

    await StaffModel.deleteOne({ staff_id: req.params.staffId });

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

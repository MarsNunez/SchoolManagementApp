import jwt from "jsonwebtoken";
import { StaffModel } from "../models/Staff.js";

export const requireStaffAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ code: "AUTH_REQUIRED", message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const staff = await StaffModel.findOne({ staff_id: payload.staffId });
    if (!staff) {
      return res
        .status(401)
        .json({ code: "AUTH_INVALID", message: "Staff not found" });
    }

    req.staff = {
      staff_id: staff.staff_id,
      role: staff.role,
      email: staff.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      code: "AUTH_INVALID",
      message: "Invalid or expired token",
      details: error.message,
    });
  }
};

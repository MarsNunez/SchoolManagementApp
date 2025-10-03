export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.staff || !allowedRoles.includes(req.staff.role)) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "Insufficient privileges",
      });
    }
    return next();
  };

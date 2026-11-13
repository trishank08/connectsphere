import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Please log in first" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Account no longer exists" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};

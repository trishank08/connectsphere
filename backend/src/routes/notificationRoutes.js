import { Router } from "express";
import { getNotifications, getSummary, markNotificationsRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", protect, getNotifications);
router.get("/summary", protect, getSummary);
router.patch("/read", protect, markNotificationsRead);
export default router;

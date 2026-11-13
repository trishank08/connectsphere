import { Router } from "express";
import { acceptConnectionRequest, getConnectionStatus, getProfileConnections, sendConnectionRequest } from "../controllers/connectionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/profile/:userId", protect, getProfileConnections);
router.get("/status/:userId", protect, getConnectionStatus);
router.post("/request/:userId", protect, sendConnectionRequest);
router.patch("/request/:requestId/accept", protect, acceptConnectionRequest);
export default router;

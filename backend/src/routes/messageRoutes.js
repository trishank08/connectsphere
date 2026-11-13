import { Router } from "express";
import { getContacts, getConversation, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/contacts", protect, getContacts);
router.get("/:userId", protect, getConversation);
router.post("/:userId", protect, sendMessage);
export default router;

import { Router } from "express";
import { changePassword, getDiscoverPeople, getProfile, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();
router.get("/discover", protect, getDiscoverPeople);
router.get("/:username", protect, getProfile);
router.patch("/me/profile", protect, upload.single("avatar"), updateProfile);
router.patch("/me/password", protect, changePassword);
export default router;

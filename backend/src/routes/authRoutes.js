import { Router } from "express";
import { getMe, login, logout, sendOtp, verifyOtpAndSignup } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/send-otp", sendOtp);
router.post("/verify-signup", verifyOtpAndSignup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
export default router;

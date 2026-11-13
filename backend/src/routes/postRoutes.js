import { Router } from "express";
import { addComment, createPost, getFeed, toggleLike } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();
router.get("/", protect, getFeed);
router.post("/", protect, upload.single("image"), createPost);
router.patch("/:postId/like", protect, toggleLike);
router.post("/:postId/comments", protect, addComment);
export default router;

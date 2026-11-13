import Post from "../models/Post.js";
import { createNotification } from "../utils/notify.js";

const populatedPost = (query) => query.populate("user", "name username avatar").populate("comments.user", "name username avatar");
const fileUrl = (req, file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

export const getFeed = async (_req, res, next) => {
  try {
    const posts = await populatedPost(Post.find().sort({ createdAt: -1 }));
    res.json({ posts });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const caption = req.body.caption?.trim() || "";
    if (!caption && !req.file) return res.status(400).json({ message: "Write something or choose an image" });
    const post = await Post.create({ user: req.user._id, caption, image: req.file ? fileUrl(req, req.file) : "" });
    const fullPost = await populatedPost(Post.findById(post._id));
    res.status(201).json({ post: fullPost });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const index = post.likes.findIndex((id) => id.equals(req.user._id));
    const liked = index === -1;
    if (liked) post.likes.push(req.user._id);
    else post.likes.splice(index, 1);
    await post.save();
    if (liked) await createNotification({ recipient: post.user, actor: req.user._id, type: "like", post: post._id });
    res.json({ liked, likes: post.likes });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const text = req.body.text?.trim();
    if (!text) return res.status(400).json({ message: "Write a comment first" });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ user: req.user._id, text });
    await post.save();
    await createNotification({ recipient: post.user, actor: req.user._id, type: "comment", post: post._id });
    const fullPost = await populatedPost(Post.findById(post._id));
    res.status(201).json({ comments: fullPost.comments });
  } catch (error) {
    next(error);
  }
};

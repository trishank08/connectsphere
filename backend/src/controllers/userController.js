import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Post from "../models/Post.js";

const fileUrl = (req, file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

export const getDiscoverPeople = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("name username avatar bio").sort({ createdAt: -1 }).limit(30);
    res.json({ users });
  } catch (error) { next(error); }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Profile not found" });
    const posts = await Post.find({ user: user._id }).populate("user", "name username avatar").populate("comments.user", "name username avatar").sort({ createdAt: -1 });
    res.json({ user, posts });
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, username, bio } = req.body;
    if (!name?.trim() || !username?.trim()) return res.status(400).json({ message: "Name and username are required" });
    const cleanUsername = username.toLowerCase().trim();
    if (!/^[a-z0-9_.]{3,24}$/.test(cleanUsername)) return res.status(400).json({ message: "Invalid username" });
    const occupied = await User.exists({ username: cleanUsername, _id: { $ne: req.user._id } });
    if (occupied) return res.status(409).json({ message: "That username is taken" });
    req.user.name = name.trim();
    req.user.username = cleanUsername;
    req.user.bio = bio?.trim().slice(0, 160) || "";
    if (req.file) req.user.avatar = fileUrl(req, req.file);
    await req.user.save();
    res.json({ user: req.user });
  } catch (error) { next(error); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ message: "Use a new password with at least 6 characters" });
    const user = await User.findById(req.user._id).select("+password");
    if (!(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ message: "Your current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (error) { next(error); }
};

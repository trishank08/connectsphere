import Message from "../models/Message.js";
import User from "../models/User.js";
import { io } from "../server.js";

export const getContacts = async (req, res, next) => {
  try {
    const recentMessages = await Message.find({ $or: [{ sender: req.user._id }, { recipient: req.user._id }] }).sort({ createdAt: -1 });
    const conversationMeta = new Map();
    for (const message of recentMessages) {
      const otherId = message.sender.equals(req.user._id) ? String(message.recipient) : String(message.sender);
      const existing = conversationMeta.get(otherId);
      if (!existing) {
        conversationMeta.set(otherId, {
          lastMessage: message.text,
          lastAt: message.createdAt,
          lastMessageFromMe: message.sender.equals(req.user._id),
          unreadCount: message.recipient.equals(req.user._id) && !message.read ? 1 : 0,
        });
      } else if (message.recipient.equals(req.user._id) && !message.read) {
        existing.unreadCount += 1;
      }
    }
    const users = await User.find({ _id: { $in: [...conversationMeta.keys()] } }).select("name username avatar bio");
    const contacts = users.map((user) => ({
      ...user.toObject(),
      ...(conversationMeta.get(String(user._id)) || { lastMessage: "No messages yet", lastAt: null, lastMessageFromMe: false, unreadCount: 0 }),
    })).sort((a, b) => {
      if (!a.lastAt && !b.lastAt) return a.name.localeCompare(b.name);
      if (!a.lastAt) return 1;
      if (!b.lastAt) return -1;
      return new Date(b.lastAt) - new Date(a.lastAt);
    });
    res.json({ contacts });
  } catch (error) { next(error); }
};

export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    await Message.updateMany({ sender: userId, recipient: req.user._id, read: false }, { read: true });
    io.to(String(req.user._id)).emit("counts:refresh");
    res.json({ messages });
  } catch (error) { next(error); }
};

export const sendMessage = async (req, res, next) => {
  try {
    const text = req.body.text?.trim();
    const { userId: recipient } = req.params;
    if (!text) return res.status(400).json({ message: "A message can't be empty" });
    if (!(await User.exists({ _id: recipient }))) return res.status(404).json({ message: "Recipient not found" });
    const message = await Message.create({ sender: req.user._id, recipient, text });
    io.to(recipient).emit("message:new", message);
    io.to(recipient).emit("counts:refresh");
    res.status(201).json({ message });
  } catch (error) { next(error); }
};

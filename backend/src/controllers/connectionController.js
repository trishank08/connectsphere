import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { createNotification } from "../utils/notify.js";

export const getConnectionStatus = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    const request = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, recipient: targetId },
        { sender: targetId, recipient: req.user._id },
      ],
    });
    if (!request) return res.json({ status: "none", requestId: null, direction: null });
    res.json({
      status: request.status,
      requestId: request._id,
      direction: request.sender.equals(req.user._id) ? "sent" : "received",
    });
  } catch (error) { next(error); }
};

export const getProfileConnections = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      status: "accepted",
      $or: [{ sender: req.params.userId }, { recipient: req.params.userId }],
    }).populate("sender", "name username avatar bio").populate("recipient", "name username avatar bio").sort({ updatedAt: -1 });
    const connections = requests.map((request) => {
      const profileIsSender = String(request.sender._id) === String(req.params.userId);
      return profileIsSender ? request.recipient : request.sender;
    });
    res.json({ connections });
  } catch (error) { next(error); }
};

export const sendConnectionRequest = async (req, res, next) => {
  try {
    const recipient = req.params.userId;
    if (String(recipient) === String(req.user._id)) return res.status(400).json({ message: "You can't send yourself a request" });
    if (!(await User.exists({ _id: recipient }))) return res.status(404).json({ message: "User not found" });
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, recipient },
        { sender: recipient, recipient: req.user._id },
      ],
    });
    if (existing?.status === "accepted") return res.status(409).json({ message: "You are already connected" });
    if (existing?.status === "pending") return res.status(409).json({ message: "A request is already waiting" });
    const request = await FriendRequest.create({ sender: req.user._id, recipient });
    await createNotification({ recipient, actor: req.user._id, type: "request", request: request._id });
    res.status(201).json({ request, message: "Connection request sent" });
  } catch (error) { next(error); }
};

export const acceptConnectionRequest = async (req, res, next) => {
  try {
    const request = await FriendRequest.findOne({ _id: req.params.requestId, recipient: req.user._id, status: "pending" });
    if (!request) return res.status(404).json({ message: "Connection request not found" });
    request.status = "accepted";
    await request.save();
    await Notification.updateMany(
      { recipient: req.user._id, actor: request.sender, request: request._id, type: "request" },
      { type: "request_accepted_by_you", read: true }
    );
    await createNotification({ recipient: request.sender, actor: req.user._id, type: "request_accepted", request: request._id });
    res.json({ request, message: "Connection request accepted" });
  } catch (error) { next(error); }
};

import Notification from "../models/Notification.js";
import Message from "../models/Message.js";
import FriendRequest from "../models/FriendRequest.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("actor", "name username avatar")
      .populate("post", "caption image")
      .sort({ createdAt: -1 })
      .limit(40);
    const requestIds = notifications.filter((item) => item.type === "request" && item.request).map((item) => item.request);
    if (requestIds.length) {
      const acceptedRequests = await FriendRequest.find({ _id: { $in: requestIds }, status: "accepted" }).select("_id");
      const acceptedSet = new Set(acceptedRequests.map((request) => String(request._id)));
      const resolvedIds = notifications.filter((item) => acceptedSet.has(String(item.request))).map((item) => item._id);
      if (resolvedIds.length) {
        await Notification.updateMany({ _id: { $in: resolvedIds } }, { type: "request_accepted_by_you", read: true });
        notifications.forEach((item) => { if (acceptedSet.has(String(item.request))) item.type = "request_accepted_by_you"; });
      }
    }
    res.json({ notifications, unreadCount: notifications.filter((item) => !item.read).length });
  } catch (error) { next(error); }
};

export const getSummary = async (req, res, next) => {
  try {
    const [unreadNotifications, unreadMessages] = await Promise.all([
      Notification.countDocuments({ recipient: req.user._id, read: false }),
      Message.countDocuments({ recipient: req.user._id, read: false }),
    ]);
    res.json({ unreadNotifications, unreadMessages });
  } catch (error) { next(error); }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: "Notifications marked as read" });
  } catch (error) { next(error); }
};

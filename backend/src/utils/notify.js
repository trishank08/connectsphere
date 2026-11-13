import Notification from "../models/Notification.js";
import { io } from "../server.js";

export const createNotification = async ({ recipient, actor, type, post = null, request = null }) => {
  if (String(recipient) === String(actor)) return null;
  const notification = await Notification.create({ recipient, actor, type, post, request });
  const fullNotification = await notification.populate("actor", "name username avatar");
  io.to(String(recipient)).emit("notification:new", fullNotification);
  io.to(String(recipient)).emit("counts:refresh");
  return fullNotification;
};

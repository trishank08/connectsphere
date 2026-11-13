import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "request", "request_accepted", "request_accepted_by_you"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    request: { type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 24 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "Building little things with big intention.", maxlength: 160 },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

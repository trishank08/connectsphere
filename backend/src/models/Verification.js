import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Verification", verificationSchema);

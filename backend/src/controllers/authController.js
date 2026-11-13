import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Verification from "../models/Verification.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { sendToken } from "../utils/token.js";

const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

export const sendOtp = async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!isEmail(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (await User.exists({ email })) return res.status(409).json({ message: "An account with this email already exists" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await Verification.findOneAndUpdate(
      { email },
      { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true }
    );
    await sendOtpEmail(email, otp);
    res.json({ message: "Verification code sent. Check your email." });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpAndSignup = async (req, res, next) => {
  try {
    const { name, username, email, password, otp } = req.body;
    const normalEmail = email?.toLowerCase().trim();
    const normalUsername = username?.toLowerCase().trim();
    if (!name?.trim() || !normalUsername || !normalEmail || !password || !otp) {
      return res.status(400).json({ message: "Please complete every field" });
    }
    if (!/^[a-z0-9_.]{3,24}$/.test(normalUsername)) {
      return res.status(400).json({ message: "Username needs 3–24 letters, numbers, dots or underscores" });
    }
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const verification = await Verification.findOne({ email: normalEmail });
    if (!verification || verification.expiresAt < new Date() || verification.otp !== String(otp)) {
      return res.status(400).json({ message: "That code is invalid or has expired" });
    }
    if (await User.exists({ $or: [{ email: normalEmail }, { username: normalUsername }] })) {
      return res.status(409).json({ message: "That email or username is already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), username: normalUsername, email: normalEmail, password: hashedPassword });
    await Verification.deleteOne({ _id: verification._id });
    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: "Enter your login and password" });
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase().trim() }, { username: identifier.toLowerCase().trim() }],
    }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Your login details don't match" });
    }
    user.password = undefined;
    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (_req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0), sameSite: "lax" }).json({ message: "Signed out" });
};

export const getMe = (req, res) => res.json({ user: req.user });

import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n[DEV OTP] ${email}: ${otp}\n`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `ConnectSphere <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your ConnectSphere verification code",
    text: `Your ConnectSphere verification code is ${otp}. It expires in 10 minutes.`,
  });
};

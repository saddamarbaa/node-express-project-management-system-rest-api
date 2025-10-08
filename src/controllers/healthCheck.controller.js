import nodemailer from "nodemailer";

import { ApiResponse } from "../utils/app-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { generateEmailTemplate } from "../utils/mail.js";

export const healthCheck = asyncHandler(async (req, res, next) => {
  const response = new ApiResponse(
    res,
    200,
    {
      status: "OK",
      message: "Health check passed",
    },
    "Health check passed",
  );
  response.send();
});

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_TRAP_USER,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

(async () => {
  try {
    const username = "Aama";
    const otp = "123456";
    const to = "user@example.com";

    // Choose "verifyEmail" or "resetPassword"
    const { emailHtml, emailText } = generateEmailTemplate(
      "verifyEmail",
      username,
      otp,
    );

    await sendEmail({
      to,
      subject: "Verify your email address",
      html: emailHtml,
      text: emailText,
    });
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
})();

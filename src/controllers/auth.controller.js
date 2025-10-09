import crypto from "crypto";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/app-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mailer.js";
import { generateEmailTemplate } from "../utils/mail.js";

// User Registration
export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return new ApiResponse(
      res,
      400,
      null,
      "username, email and password are required",
    ).send();
  }

  if (typeof password !== "string" || password.length < 6) {
    return new ApiResponse(
      res,
      400,
      null,
      "Password must be a string with at least 6 characters",
    ).send();
  }

  // Check duplicates
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return new ApiResponse(
      res,
      409,
      null,
      "User with given email or username already exists",
    ).send();
  }

  // Create user instance and save (password hashing handled by model pre-save)
  const newUser = new User({ username, email, password });

  // Generate email verification token here so we don't rely on model helpers
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationTokenExpiry = tokenExpiry;

  await newUser.save();

  // Prepare email content and send
  const { emailHtml, emailText } = generateEmailTemplate(
    "verifyEmail",
    username,
    unHashedToken,
  );

  await sendEmail({
    to: newUser.email,
    subject: "Verify your email",
    html: emailHtml,
    text: emailText,
  });

  // Return created user (safe shape)
  const userSafe = newUser.toObject();
  delete userSafe.password;
  delete userSafe.refreshToken;
  delete userSafe.emailVerificationToken;
  delete userSafe.emailVerificationTokenExpiry;

  const responseData = {
    user: userSafe,
    verifyUrl: `${process.env.FRONTEND_URL}/verify-email?token=${unHashedToken}&email=${encodeURIComponent(newUser.email)}`,
  };

  return new ApiResponse(
    res,
    201,
    responseData,
    "Registration successful. Please verify your email.",
  ).send();
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password || !email.trim() || !password.trim()) {
    return new ApiResponse(
      res,
      400,
      null,
      "email and password are required",
    ).send();
  }
  const user = await User.findOne({ email });
  if (!user) {
    return new ApiResponse(res, 401, null, "Invalid email or password").send();
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return new ApiResponse(res, 401, null, "Invalid email or password").send();
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();

  // Return tokens and user info
  return new ApiResponse(
    res,
    200,
    {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    },
    "Login successful",
  ).send();
});

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

  // Check duplicate email only (usernames may be non-unique by design)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new ApiResponse(
      res,
      409,
      null,
      "User with given email already exists",
    ).send();
  }

  // Create user instance and save (password hashing handled by model pre-save)
  const newUser = new User({ username, email, password });
  // Attach confirmPassword virtual so model can validate equality
  if (req.body.confirmPassword)
    newUser.confirmPassword = req.body.confirmPassword;

  // Use model helper to generate a temporary token (returns raw + hashed + expiry)
  const { unHashToken, hashToken, tokenExpiry } =
    newUser.generateTemporaryToken();
  newUser.emailVerificationToken = hashToken;
  newUser.emailVerificationTokenExpiry = tokenExpiry;

  try {
    await newUser.save();
  } catch (err) {
    // Handle Mongoose validation errors
    if (err && err.name === "ValidationError") {
      const errors = Object.keys(err.errors).map((k) => ({
        param: k,
        msg: err.errors[k].message,
      }));
      return new ApiResponse(
        res,
        400,
        null,
        "Validation failed",
        errors,
      ).send();
    }

    // Handle duplicate key errors (E11000) gracefully
    if (err && err.code === 11000) {
      const dupField = err.keyValue ? Object.keys(err.keyValue)[0] : null;
      const message = dupField
        ? `Duplicate value for field: ${dupField}`
        : "Duplicate key error";
      return new ApiResponse(res, 409, null, message).send();
    }
    throw err;
  }

  // Prepare email content and send
  const verifyUrl = `${process.env.FRONTEND_URL || process.env.APP_URL}/verify-email?token=${unHashToken}&email=${newUser.email}`;

  const { emailHtml, emailText } = generateEmailTemplate(
    "verifyEmail",
    username,
    verifyUrl,
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

  // Expose the full verification URL in the API response only when explicitly enabled.
  // This prevents leaking the raw verification token in normal responses.
  const responseData = { user: userSafe };
  // Only expose the verification URL in the API response when explicitly enabled.
  if (process.env.EXPOSE_VERIFY_URL === "true") {
    responseData.verifyUrl = verifyUrl;
  }

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

  // If the user hasn't verified their email, resend verification and ask them to verify first.
  if (!user.isEmailVerified) {
    // Generate a new temporary token using the model helper
    const { unHashToken, hashToken, tokenExpiry } =
      user.generateTemporaryToken();
    user.emailVerificationToken = hashToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL || process.env.APP_URL}/verify-email?token=${unHashToken}&email=${user.email}`;
    const { emailHtml, emailText } = generateEmailTemplate(
      "verifyEmail",
      user.username || user.email,
      verifyUrl,
    );

    // Attempt to send verification email (don't block login flow on send failure)
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: emailHtml,
        text: emailText,
      });
    } catch (err) {
      console.error("Failed to send verification email on login:", err);
    }

    // Return a clear response telling the user to verify first and include the link
    return new ApiResponse(
      res,
      403,
      { verifyUrl },
      "Email not verified. A verification email was sent. Please verify your email before logging in.",
    ).send();
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

// Verify email handler
export const verifyEmail = asyncHandler(async (req, res) => {
  // token may come from query (link click) or body (frontend POST)
  const token = req?.query?.token || req?.body?.token;
  const email = req?.query?.email || req?.body?.email;

  if (!token || !email) {
    return new ApiResponse(
      res,
      400,
      null,
      "token and email are required",
    ).send();
  }

  const user = await User.findByVerificationToken(token, email);

  if (!user) {
    return new ApiResponse(
      res,
      401,
      null,
      "Invalid or expired verification token",
    ).send();
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  return new ApiResponse(res, 200, null, "Email verified successfully").send();
});

// Request password reset (send reset link)
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email)
    return new ApiResponse(res, 400, null, "Email is required").send();

  const user = await User.findOne({ email });
  if (!user)
    return new ApiResponse(
      res,
      202,
      null,
      "If an account with that email exists, a password reset link will be sent.",
    ).send();

  // Use model helper for temporary token (keeps token generation consistent).
  // Note: generateTemporaryToken currently sets a 30-minute expiry.
  const { unHashToken, hashToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgetPasswordToken = hashToken;
  user.forgetPasswordTokenExpiry = tokenExpiry;
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL || process.env.APP_URL}/reset-password?token=${unHashToken}&email=${user.email}`;
  const { emailHtml, emailText } = generateEmailTemplate(
    "resetPassword",
    user.username || user.email,
    resetUrl,
  );
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: emailHtml,
      text: emailText,
    });
  } catch (err) {
    console.error("Failed to send reset email:", err);
  }

  // Compute a friendly expiry duration (minutes) for the generic message.
  let expiresInMinutes = Math.max(
    1,
    Math.round((tokenExpiry - Date.now()) / 60000),
  );

  // Include the reset URL and raw token in the response so tools like Postman can use it.
  const responsePayload = {
    resetUrl,
    token: unHashToken,
  };

  return new ApiResponse(
    res,
    202,
    responsePayload,
    `If an account with that email exists, a password reset link valid for ${expiresInMinutes} minute(s) will be sent.`,
  ).send();
});

// Reset password using token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return new ApiResponse(
      res,
      400,
      null,
      "token and password are required",
    ).send();

  const user = await User.findByResetToken(token);
  if (!user)
    return new ApiResponse(res, 400, null, "Invalid or expired token").send();

  user.password = password;
  user.forgetPasswordToken = undefined;
  user.forgetPasswordTokenExpiry = undefined;
  // Ensure model's confirmPassword virtual is set so pre-save validation passes
  user.confirmPassword = password;
  try {
    await user.save();
  } catch (err) {
    // Convert validation failures to a 400 response with a friendly message
    if (
      err &&
      (err.name === "ValidationError" || err.message === "Validation failed")
    ) {
      return new ApiResponse(res, 400, null, "Validation failed").send();
    }
    throw err;
  }

  return new ApiResponse(res, 200, null, "Password reset successful").send();
});

// Refresh token handler
export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies?.refreshToken || req.headers["x-refresh-token"];
  if (!refreshToken)
    return new ApiResponse(res, 401, null, "Refresh token required").send();

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, d) =>
        err ? reject(err) : resolve(d),
      );
    });

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken)
      return new ApiResponse(res, 401, null, "Invalid refresh token").send();

    const newAccess = user.generateAccessToken();
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", newAccess, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
    });

    return new ApiResponse(
      res,
      200,
      { accessToken: newAccess },
      "Token refreshed",
    ).send();
  } catch (err) {
    return new ApiResponse(res, 401, null, "Invalid refresh token").send();
  }
});

// Logout - clear refresh token
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.headers["x-refresh-token"];
  if (token) {
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, d) =>
          err ? reject(err) : resolve(d),
        );
      });
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    } catch (err) {
      // ignore
    }
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return new ApiResponse(res, 200, null, "Logged out").send();
});

// Change password for authenticated users
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  if (!userId) {
    return new ApiResponse(res, 401, null, "Authentication required").send();
  }

  const user = await User.findById(userId);
  if (!user) {
    return new ApiResponse(res, 404, null, "User not found").send();
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return new ApiResponse(res, 400, null, "Old password is incorrect").send();
  }

  user.password = newPassword;
  // satisfy pre-save confirmPassword check
  user.confirmPassword = newPassword;
  // clear refresh tokens so existing sessions are invalidated
  user.refreshToken = undefined;
  await user.save();

  // send notification email
  try {
    const { emailHtml, emailText } = generateEmailTemplate(
      "resetPassword",
      user.username || user.email,
      process.env.FRONTEND_URL || process.env.APP_URL,
    );
    await sendEmail({
      to: user.email,
      subject: "Your password was changed",
      html: emailHtml,
      text: emailText,
    });
  } catch (err) {
    console.error("Failed to send password change notification:", err);
  }

  return new ApiResponse(
    res,
    200,
    null,
    "Password changed successfully. Please log in again.",
  ).send();
});

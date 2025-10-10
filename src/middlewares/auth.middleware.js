import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/app-error.js";

// Middleware contract:
// - Inputs: req with optional Authorization header or cookies (accessToken, refreshToken)
// - Outputs: attaches req.user when authenticated
// - Errors: calls next(ApiError(401)) when authentication fails

const verifyToken = (token, secret) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieAccess = req.cookies?.accessToken;
    const cookieRefresh = req.cookies?.refreshToken;

    let accessToken = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.split(" ")[1];
    } else if (cookieAccess) {
      accessToken = cookieAccess;
    }

    // Try verifying access token first
    if (accessToken) {
      try {
        const decoded = await verifyToken(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET,
        );
        // Attach a minimal user-like object
        req.user = {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
        };
        return next();
      } catch (err) {
        // If token expired, we'll try refresh path below. Otherwise, continue to refresh logic.
        // console.debug('access token verify failed', err.message);
      }
    }

    // At this point access token is missing or invalid/expired. Try refresh token from cookie.
    const refreshToken = cookieRefresh || req.headers["x-refresh-token"];
    if (!refreshToken) {
      return next(new ApiError(401, "Authentication required"));
    }

    // Verify refresh token and ensure it matches the one stored for the user
    let decodedRefresh;
    try {
      decodedRefresh = await verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
    } catch (err) {
      return next(new ApiError(401, "Invalid refresh token"));
    }

    // Load user and compare stored refreshToken
    const user = await User.findById(decodedRefresh.id).select("refreshToken");
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      return next(new ApiError(401, "Invalid refresh token"));
    }

    // All good: issue new access token and attach user
    const newAccessToken = jwt.sign(
      {
        id: decodedRefresh.id,
        username: decodedRefresh.username,
        email: decodedRefresh.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" },
    );

    // Set cookie for new access token
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: (() => {
        const s = process.env.ACCESS_TOKEN_EXPIRY;
        // simple parse: if number with unit
        if (!s) return 15 * 60 * 1000;
        const m = String(s).match(/^(\d+)([smhd])$/i);
        if (!m) return 15 * 60 * 1000;
        const val = parseInt(m[1], 10);
        switch (m[2].toLowerCase()) {
          case "s":
            return val * 1000;
          case "m":
            return val * 60 * 1000;
          case "h":
            return val * 60 * 60 * 1000;
          case "d":
            return val * 24 * 60 * 60 * 1000;
          default:
            return 15 * 60 * 1000;
        }
      })(),
    });

    req.user = {
      id: decodedRefresh.id,
      email: decodedRefresh.email,
      username: decodedRefresh.username,
    };
    return next();
  } catch (err) {
    return next(
      new ApiError(500, "Authentication middleware error", [], err.stack),
    );
  }
};

export default authMiddleware;

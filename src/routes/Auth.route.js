import { Router } from "express";
import {
  login,
  register,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  refreshTokenHandler,
  logout,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validator.middleware.js";
import { registerValidation, loginValidation } from "../validators/index.js";
import {
  resetPasswordValidation,
  emailValidation,
} from "../validators/index.js";

const route = Router();

route.post("/register", registerValidation, validateRequest, register);
route.post("/login", loginValidation, validateRequest, login);

route.post(
  "/forgot-password",
  emailValidation,
  validateRequest,
  requestPasswordReset,
);
route.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  resetPassword,
);

// verifyEmail is available as a direct import (clean)
route.get("/verify-email", verifyEmail);

route.post("/refresh-token", refreshTokenHandler);
route.post("/logout", logout);

export default route;

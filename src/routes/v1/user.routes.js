import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getProfile } from "../../controllers/user.controller.js";
import { changePassword } from "../../controllers/auth.controller.js";
import { changePasswordValidation } from "../../validators/index.js";
import { validateRequest } from "../../middlewares/validator.middleware.js";

const router = Router();

// GET /api/v1/users/profile
router.get("/profile", authMiddleware, getProfile);

// POST /api/v1/users/change-password
router.post(
  "/change-password",
  authMiddleware,
  changePasswordValidation,
  validateRequest,
  changePassword,
);

export default router;

import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getProfile } from "../../controllers/user.controller.js";

const router = Router();

// GET /api/v1/users/profile
router.get("/profile", authMiddleware, getProfile);

export default router;

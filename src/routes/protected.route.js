import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

export default router;

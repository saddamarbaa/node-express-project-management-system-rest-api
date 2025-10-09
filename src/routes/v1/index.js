import express from "express";
import healthCheckRouter from "../../routes/healthCheck.route.js";
import AuthRouter from "../../routes/Auth.route.js";

const router = express.Router();

// Mount v1 routes here
router.use("/health", healthCheckRouter);
router.use("/auth", AuthRouter);

export default router;

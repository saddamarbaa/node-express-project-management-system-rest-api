import express from "express";
import healthCheckRouter from "../../routes/healthCheck.route.js";
import AuthRouter from "../../routes/Auth.route.js";
import protectedRouter from "../../routes/protected.route.js";
import userRouter from "./user.routes.js";

const router = express.Router();

// Mount v1 routes here
router.use("/health", healthCheckRouter);
router.use("/auth", AuthRouter);
router.use("/protected", protectedRouter);
router.use("/users", userRouter);

export default router;

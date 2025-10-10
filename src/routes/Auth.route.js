import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
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
  (req, res, next) =>
    import("../controllers/auth.controller.js").then((m) =>
      m.requestPasswordReset(req, res, next),
    ),
);
route.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  (req, res, next) =>
    import("../controllers/auth.controller.js").then((m) =>
      m.resetPassword(req, res, next),
    ),
);

route.get("/verify-email", (req, res, next) =>
  import("../controllers/auth.controller.js").then((m) =>
    m.verifyEmail(req, res, next),
  ),
);
route.post("/refresh-token", (req, res, next) =>
  import("../controllers/auth.controller.js").then((m) =>
    m.refreshTokenHandler(req, res, next),
  ),
);
route.post("/logout", (req, res, next) =>
  import("../controllers/auth.controller.js").then((m) =>
    m.logout(req, res, next),
  ),
);

export default route;

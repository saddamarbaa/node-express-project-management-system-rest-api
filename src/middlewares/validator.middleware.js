import { validationResult } from "express-validator";
import { ApiError } from "../utils/app-error.js";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors
      .array()
      .map((err) => ({ param: err.param, msg: err.msg }));
    return next(new ApiError(400, "Validation failed", extracted));
  }
  next();
};

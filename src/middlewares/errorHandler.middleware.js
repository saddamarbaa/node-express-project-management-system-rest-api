import { ApiError } from "../utils/app-error.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const apiError =
    err instanceof ApiError
      ? err
      : new ApiError(
          statusCode,
          err.message || "Internal Server Error",
          err.errors || [],
          err.stack,
        );

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    errors: apiError.errors,
    stack: process.env.NODE_ENV === "production" ? null : apiError.stack,
  });
};

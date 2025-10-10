import { ApiError } from "../utils/app-error.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Unknown errors
  console.error(err);
  return res.status(500).json({
    statusCode: 500,
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;

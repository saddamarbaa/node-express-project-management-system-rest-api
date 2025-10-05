class ApiError extends Error {
  constructor(
    statusCode,
    message,
    errors = [],
    message = "An error occurred",
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = null;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

exports = { ApiError };

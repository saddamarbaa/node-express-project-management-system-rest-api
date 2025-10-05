class ApiResponse {
  constructor(res, statusCode, data = null, message = null) {
    this.res = res;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  send() {
    return this.res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

exports = { ApiResponse };

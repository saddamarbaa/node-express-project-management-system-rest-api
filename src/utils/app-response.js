export class ApiResponse {
  constructor(res, statusCode, data = null, message = null) {
    this.res = res; // Now res is properly assigned
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  send() {
    return this.res.status(this.statusCode).json({
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

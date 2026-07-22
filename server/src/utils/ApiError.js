class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message || code);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

module.exports = ApiError;

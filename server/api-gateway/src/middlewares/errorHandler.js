const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Specific error handling
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }

  if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized Access";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid data format";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler };

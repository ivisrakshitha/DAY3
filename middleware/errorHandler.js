const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } '${value}' already exists`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;

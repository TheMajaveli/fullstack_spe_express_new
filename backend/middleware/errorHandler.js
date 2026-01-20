function errorHandler(err, req, res, next) {
  if (!res.headersSent) {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
}

module.exports = errorHandler;


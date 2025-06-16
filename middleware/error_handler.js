function errorHandler(err, req, res, next) {
  // JWT authentication error
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized access. Invalid token.' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  // Custom error with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Default to 500 server error
  console.error('Unhandled error:', err);
  return res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = errorHandler;

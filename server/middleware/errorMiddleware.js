import { errorResponse } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  return errorResponse(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed for input data.';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value: ${field} '${err.keyValue[field]}' already exists.`;
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid ID: ${err.value}`;
  }

  return errorResponse(res, statusCode, message, errors);
};

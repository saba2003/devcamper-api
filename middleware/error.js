const chalk = require('chalk');
const ErrorResponse = require('../utilities/errorResponse');

const errorHandler = (error, request, response, next) => {
  let error1 = { ...error };

  error1.message = error.message;

  // log to console for dev
  // console.log(error);

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = `Resource not found`;
    error1 = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const message = `Duplicate field value entered`;
    error1 = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((value) => value.message);
    error1 = new ErrorResponse(message, 400);
  }

  response.status(error1.statusCode || 500).json({
    success: false,
    error: error1.message || 'Server Error',
  });
};

module.exports = errorHandler;

const ErrorResponse = require('../utilities/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (request, response, next) => {
  const { name, email, password, role } = request.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, response);
});

// @desc    Log in user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (request, response, next) => {
  const { email, password } = request.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, response);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, response) => {
  // Create Token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure.true;
  }

  response.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (request, response, next) => {
  const user = await User.findById(request.user.id);

  response.status(200).json({
    success: true,
    data: user,
  });
});

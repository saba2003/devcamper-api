const crypto = require('crypto');
const ErrorResponse = require('../utilities/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utilities/sendEmail');
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

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (request, response, next) => {
  const fieldsToUpdate = {
    name: request.body.name,
    email: request.body.email,
  };

  const user = await User.findByIdAndUpdate(request.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (request, response, next) => {
  const user = await User.findById(request.user.id).select('+password');

  //Check current password
  if (!(await user.matchPassword(request.body.currentPassword))) {
    return next(new ErrorResponse('Invalid password', 401));
  }

  user.password = request.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, response);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (request, response, next) => {
  const user = await User.findOne({ email: request.body.email });

  if (!user) {
    return next(new ErrorResponse('no user with that email', 404));
  }

  // Get reset Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${request.protocol}://${request.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `In order to reset your password please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    response.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

  response.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (request, response, next) => {
  // Get hashed Token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(request.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = request.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

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

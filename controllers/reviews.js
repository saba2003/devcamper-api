const ErrorResponse = require('../utilities/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (request, response, next) => {
  if (request.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: request.params.bootcampId });

    return response.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    response.status(200).json(response.advancedResults);
  }
});

// @desc    Get single reviews
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (request, response, next) => {
  const review = await Review.findById(request.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${request.params.id}`),
      404
    );
  }

  response.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Add a review
// @route   POST /api/v1/bootcamps/:bootcampsId/reviews
// @access  Private
exports.addReview = asyncHandler(async (request, response, next) => {
  request.body.bootcamp = request.params.bootcampId;
  request.body.user = request.user.id;

  const bootcamp = await Bootcamp.findById(request.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${request.params.bootcampId}`
      ),
      404
    );
  }

  const review = await Review.create(request.body);

  response.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Update a review
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateReview = asyncHandler(async (request, response, next) => {
  let review = await Review.findById(request.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${request.params.id}`),
      404
    );
  }

  // Make sure user is review owner
  if (
    review.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to update review ${review._id}`,
        401
      )
    );
  }

  review = await Review.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete a review
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteReview = asyncHandler(async (request, response, next) => {
  const review = await Review.findById(request.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${request.params.id}`),
      404
    );
  }

  // Make sure user is review owner
  if (
    review.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to delete review ${review._id}`,
        401
      )
    );
  }

  await review.remove();

  response.status(200).json({
    success: true,
    data: {},
  });
});

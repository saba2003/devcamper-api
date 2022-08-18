const ErrorResponse = require('../utilities/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (request, response, next) => {
  if (request.params.bootcampId) {
    const courses = await Course.find({ bootcamp: request.params.bootcampId });

    return response.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    response.status(200).json(response.advancedResults);
  }
});

// @desc    Get single courses
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (request, response, next) => {
  const course = await Course.findById(request.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${request.params.id}`),
      404
    );
  }

  response.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Add a course
// @route   POST /api/v1/bootcamps/:bootcampsId/courses
// @access  Private
exports.addCourse = asyncHandler(async (request, response, next) => {
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

  // Make sure user is course owner
  if (
    course.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(request.body);

  response.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Update a course
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateCourse = asyncHandler(async (request, response, next) => {
  let course = await Course.findById(request.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${request.params.id}`),
      404
    );
  }

  // Make sure user is course owner
  if (
    course.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Delete a course
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (request, response, next) => {
  const course = await Course.findById(request.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${request.params.id}`),
      404
    );
  }

  // Make sure user is course owner
  if (
    course.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  await course.remove();

  response.status(200).json({
    success: true,
    data: {},
  });
});

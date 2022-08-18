const path = require('path');
const ErrorResponse = require('../utilities/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utilities/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (request, response, next) => {
  response.status(200).json(response.advancedResults);
});

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.findById(request.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    );
  }

  response.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (request, response, next) => {
  // Add user to request.body
  request.body.user = request.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: request.user.id });

  // If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && request.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${request.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(request.body);

  response.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (request, response, next) => {
  let bootcamp = await Bootcamp.findById(request.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    );
  }

  // Make sure user is bootcamp owner
  if (
    bootcamp.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.findById(request.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    );
  }

  // Make sure user is bootcamp owner
  if (
    bootcamp.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.params.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();

  response.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    GET bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (request, response, next) => {
  const { zipcode, distance } = request.params;

  // Get latitude/longitude
  const location = await geocoder.geocode(zipcode);
  const latitude = location[0].latitude;
  const longitude = location[0].longitude;

  // Calculate radius using radians
  // Divide distance by radius of earth
  // Earth Radius = 6378 Km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  response.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.findById(request.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    );
  }

  // Make sure user is bootcamp owner
  if (
    bootcamp.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!request.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = request.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
    if (error) {
      console.error(error);
      return next(new ErrorResponse(`problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(request.params.id, { photo: file.name });

    response.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

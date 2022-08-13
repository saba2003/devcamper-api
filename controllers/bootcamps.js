// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (request, response, next) => {
    response.status(200).json({ success: true, msg: 'Show all bootcamps' })
}

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (request, response, next) => {
    response.status(200).json({ success: true, msg: `Display bootcamp ${request.params.id}`})
}

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = (request, response, next) => {
    response.status(200).json({ success: true, msg: 'Create new bootcamp' })
}

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (request, response, next) => {
    response.status(200).json({ success: true, msg: `Update bootcamp ${request.params.id}`})
}

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (request, response, next) => {
    response.status(200).json({ success: true, msg: `Delete bootcamp ${request.params.id}`})
}
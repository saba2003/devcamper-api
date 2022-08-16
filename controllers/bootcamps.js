const ErrorResponse = require('../utilities/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utilities/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (request, response, next) => {
    // Searching specific results START
    let query

    // Copy request.query
    const requestQuery = { ...request.query }

    // fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit']

    // Loop over removeFields and delete them from requestQuery
    removeFields.forEach(param => delete requestQuery[param])

    // Create query string
    let queryString = JSON.stringify(requestQuery)

    // adding $ in front of ($gt, $gte, $etc...) // gt = greater than, etc...
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // Finding resource
    query = Bootcamp.find(JSON.parse(queryString))
    
    // Select Fields
    if (request.query.select) {
        const fields = request.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // Sort
    if(request.query.sort){
        const sortBy = request.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(request.query.page, 10) || 1
    const limit = parseInt(request.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const totalElements = await Bootcamp.countDocuments()

    query = query.skip(startIndex).limit(limit)

    // Executing query
    const bootcamps = await query

    // Pagination result
    const pagination = {}

    if(endIndex < totalElements) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.previous = {
            page: page - 1,
            limit
        }
    }

    // Searching specific results END

    response.status(200).json({
        success:true, 
        count: bootcamps.length, 
        pagination,
        data: bootcamps
    })
})

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.findById(request.params.id)

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404))
    }

    response.status(200).json({
        success:true, 
        data: bootcamp
    })
})

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.create(request.body)

    response.status(201).json({
        success: true,
        data: bootcamp
    })
})

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true,
    })
    
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404))
    }

    response.status(200).json({ 
        success: true, 
        data: bootcamp 
    })
})

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(request.params.id)
    
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404))
    }

    response.status(200).json({ 
        success: true, 
        data: {} 
    })
})

// @desc    GET bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (request, response, next) => {
    const { zipcode, distance } = request.params

    // Get latitude/longitude
    const location = await geocoder.geocode(zipcode)
    const latitude = location[0].latitude
    const longitude = location[0].longitude

    // Calculate radius using radians
    // Divide distance by radius of earth
    // Earth Radius = 6378 Km
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
    })

    response.status(200).json(
        {
            success: true,
            count: bootcamps.length,
            data: bootcamps
        }
    )
})
const advancedResults =
  (model, populate) => async (request, response, next) => {
    // Searching specific results START
    let query;

    // Copy request.query
    const requestQuery = { ...request.query };

    // fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from requestQuery
    removeFields.forEach((param) => delete requestQuery[param]);

    // Create query string
    let queryString = JSON.stringify(requestQuery);

    // adding $ in front of ($gt, $gte, $etc...) // gt = greater than, etc...
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = model.find(JSON.parse(queryString));

    // Select Fields
    if (request.query.select) {
      const fields = request.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (request.query.sort) {
      const sortBy = request.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalElements = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < totalElements) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit,
      };
    }

    response.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    next();

    // Searching specific results END
  };

module.exports = advancedResults;

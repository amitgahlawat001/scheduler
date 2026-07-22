const ApiError = require('../utils/ApiError');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      return next(new ApiError(400, 'VALIDATION_ERROR', 'Invalid request', result.error.flatten()));
    }
    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    next();
  };
}

module.exports = validate;

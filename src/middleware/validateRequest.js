/**
 * Generic Joi validation middleware factory.
 * Usage:  router.get("/path", validate({ params: schema, query: schema }), handler)
 *
 * Validates req.params, req.query, and req.body independently.
 * On failure, passes a decorated Error to next() so errorHandler formats it.
 */
const validate = (schemas) => (req, res, next) => {
  const targets = { params: req.params, query: req.query, body: req.body };

  for (const [key, schema] of Object.entries(schemas)) {
    if (!schema) continue;
    const { error } = schema.validate(targets[key], { abortEarly: false });
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
  }

  next();
};

export default validate;

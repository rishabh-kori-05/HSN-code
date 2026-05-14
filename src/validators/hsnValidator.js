import Joi from "joi";

const VALID_GST_RATES = [0, 3, 5, 12, 18, 28];

/** Param: /api/hsn/:code */
export const hsnCodeParam = Joi.object({
  code: Joi.string()
    .pattern(/^\d{2,8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "HSN code must be a numeric string between 2 and 8 digits",
      "any.required": "HSN code is required",
    }),
});

/** Query: /api/hsn/search?q=wheat&page=1&limit=10&sort=gstRate */
export const searchQuery = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    "string.min": "Search query must be at least 2 characters",
    "any.required": 'Query parameter "q" is required',
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("hsnCode", "gstRate", "description").default("hsnCode"),
});

/** Query: /api/hsn/filter?gst=18&page=1&limit=10 */
export const filterQuery = Joi.object({
  gst: Joi.number()
    .valid(...VALID_GST_RATES)
    .required()
    .messages({
      "any.only": `GST rate must be one of: ${VALID_GST_RATES.join(", ")}`,
      "any.required": 'Query parameter "gst" is required',
    }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("hsnCode", "gstRate", "description").default("hsnCode"),
});

/** Query: /api/hsn?page=1&limit=10&sort=gstRate */
export const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("hsnCode", "gstRate", "description").default("hsnCode"),
  category: Joi.string().max(100).optional(),
});

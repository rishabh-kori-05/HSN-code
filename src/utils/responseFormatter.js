/**
 * Standardised API response envelope helpers.
 * All handlers use these so the shape is consistent across every route.
 */

export const success = (data, meta = {}) => ({
  success: true,
  ...meta,
  data,
});

export const successList = (results, pagination = null) => {
  const envelope = { success: true, count: results.length, results };
  if (pagination) envelope.pagination = pagination;
  return envelope;
};

export const error = (message, statusCode = 500, details = null) => {
  const body = { success: false, error: message };
  if (details) body.details = details;
  body.statusCode = statusCode;
  return body;
};

export const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

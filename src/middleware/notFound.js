import { error } from "../utils/responseFormatter.js";

/**
 * 404 catch-all — registered after all routes.
 */
const notFound = (req, res) => {
  res.status(404).json(
    error(`Route not found: ${req.method} ${req.originalUrl}`, 404)
  );
};

export default notFound;

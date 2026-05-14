import { Router } from "express";
import * as controller from "../controllers/hsnController.js";
import validate from "../middleware/validateRequest.js";
import {
  hsnCodeParam,
  searchQuery,
  filterQuery,
  listQuery,
} from "../validators/hsnValidator.js";

const router = Router();

/**
 * @swagger
 * /api/hsn:
 *   get:
 *     summary: List all HSN codes (paginated)
 *     tags: [HSN]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [hsnCode, gstRate, description] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of HSN records
 */
router.get("/", validate({ query: listQuery }), controller.listAll);

/**
 * @swagger
 * /api/hsn/summary:
 *   get:
 *     summary: Dataset summary — total records, GST slabs, categories
 *     tags: [HSN]
 *     responses:
 *       200:
 *         description: Summary object
 */
router.get("/summary", controller.getSummary);

/**
 * @swagger
 * /api/hsn/search:
 *   get:
 *     summary: Full-text search across HSN codes, descriptions, and categories
 *     tags: [HSN]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [hsnCode, gstRate, description] }
 *     responses:
 *       200:
 *         description: Matching HSN records
 *       400:
 *         description: Validation error
 */
router.get("/search", validate({ query: searchQuery }), controller.searchHsn);

/**
 * @swagger
 * /api/hsn/filter:
 *   get:
 *     summary: Filter HSN codes by exact GST rate
 *     tags: [HSN]
 *     parameters:
 *       - in: query
 *         name: gst
 *         required: true
 *         schema: { type: number, enum: [0, 3, 5, 12, 18, 28] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: HSN records matching the given GST rate
 *       400:
 *         description: Validation error
 */
router.get("/filter", validate({ query: filterQuery }), controller.filterByGst);

/**
 * @swagger
 * /api/hsn/{code}:
 *   get:
 *     summary: Get GST details for a specific HSN code
 *     tags: [HSN]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         description: 2–8 digit HSN code
 *     responses:
 *       200:
 *         description: HSN record
 *       404:
 *         description: HSN code not found
 *       400:
 *         description: Validation error
 */
router.get("/:code", validate({ params: hsnCodeParam }), controller.getByCode);

export default router;

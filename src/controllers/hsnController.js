import * as hsnService from "../services/hsnService.js";
import {
  success,
  successList,
  error,
  buildPagination,
} from "../utils/responseFormatter.js";

// ── GET /api/hsn ─────────────────────────────────────────────────────────────
export const listAll = (req, res) => {
  const { page = 1, limit = 10, sort = "hsnCode", category } = req.query;
  const p = Number(page);
  const l = Number(limit);

  const { items, total } = hsnService.list({ page: p, limit: l, sort, category });
  const pagination = buildPagination(p, l, total);

  return res.status(200).json(successList(items, pagination));
};

// ── GET /api/hsn/summary ─────────────────────────────────────────────────────
export const getSummary = (req, res) => {
  const summary = hsnService.getSummary();
  return res.status(200).json(success(summary));
};

// ── GET /api/hsn/search?q= ───────────────────────────────────────────────────
export const searchHsn = (req, res) => {
  const { q, page = 1, limit = 10, sort = "hsnCode" } = req.query;
  const p = Number(page);
  const l = Number(limit);

  const { items, total } = hsnService.search({ q, page: p, limit: l, sort });
  const pagination = buildPagination(p, l, total);

  return res.status(200).json(successList(items, pagination));
};

// ── GET /api/hsn/filter?gst= ─────────────────────────────────────────────────
export const filterByGst = (req, res) => {
  const { gst, page = 1, limit = 10, sort = "hsnCode" } = req.query;
  const p = Number(page);
  const l = Number(limit);

  const { items, total } = hsnService.filterByGst({ gst, page: p, limit: l, sort });
  const pagination = buildPagination(p, l, total);

  return res.status(200).json(successList(items, pagination));
};

// ── GET /api/hsn/:code ───────────────────────────────────────────────────────
export const getByCode = (req, res, next) => {
  const { code } = req.params;
  const record = hsnService.getByCode(code);

  if (!record) {
    return res
      .status(404)
      .json(error(`HSN code "${code}" not found`, 404));
  }

  return res.status(200).json(success(record));
};

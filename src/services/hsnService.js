import { createRequire } from "module";
import env from "../config/env.js";

const require = createRequire(import.meta.url);
const RAW_DATA = require("../data/hsnData.json");

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map();

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > env.CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCache = (key, value) => {
  cache.set(key, { value, ts: Date.now() });
};

export const clearCache = () => cache.clear(); // exposed for tests

// ── Helpers ──────────────────────────────────────────────────────────────────
const sortData = (data, sortField) =>
  [...data].sort((a, b) => {
    const va = a[sortField];
    const vb = b[sortField];
    if (typeof va === "number") return va - vb;
    return String(va).localeCompare(String(vb));
  });

const paginate = (data, page, limit) => {
  const total = data.length;
  const start = (page - 1) * limit;
  return { items: data.slice(start, start + limit), total };
};

// ── Service methods ──────────────────────────────────────────────────────────

/**
 * Look up a single HSN code. Returns null when not found.
 */
export const getByCode = (code) => {
  const cacheKey = `code:${code}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  const result = RAW_DATA.find((item) => item.hsnCode === code) ?? null;
  setCache(cacheKey, result);
  return result;
};

/**
 * Full-text search across hsnCode, description, and category fields.
 */
export const search = ({ q, page, limit, sort }) => {
  const cacheKey = `search:${q}:${page}:${limit}:${sort}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  const lower = q.toLowerCase();
  const matched = RAW_DATA.filter(
    (item) =>
      item.hsnCode.includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower)
  );

  const sorted = sortData(matched, sort);
  const { items, total } = paginate(sorted, page, limit);
  const result = { items, total };

  setCache(cacheKey, result);
  return result;
};

/**
 * Filter by exact GST rate.
 */
export const filterByGst = ({ gst, page, limit, sort }) => {
  const cacheKey = `filter:${gst}:${page}:${limit}:${sort}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  const matched = RAW_DATA.filter((item) => item.gstRate === Number(gst));
  const sorted = sortData(matched, sort);
  const { items, total } = paginate(sorted, page, limit);
  const result = { items, total };

  setCache(cacheKey, result);
  return result;
};

/**
 * Paginated list of all HSN entries, optionally filtered by category.
 */
export const list = ({ page, limit, sort, category }) => {
  const cacheKey = `list:${page}:${limit}:${sort}:${category ?? "all"}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  let data = RAW_DATA;
  if (category) {
    const lower = category.toLowerCase();
    data = data.filter((item) => item.category.toLowerCase().includes(lower));
  }

  const sorted = sortData(data, sort);
  const { items, total } = paginate(sorted, page, limit);
  const result = { items, total };

  setCache(cacheKey, result);
  return result;
};

/**
 * Return a summary grouped by GST rate slab.
 */
export const getSummary = () => {
  const cacheKey = "summary";
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  const slabs = {};
  for (const item of RAW_DATA) {
    const key = `${item.gstRate}%`;
    slabs[key] = (slabs[key] ?? 0) + 1;
  }

  const categories = [...new Set(RAW_DATA.map((i) => i.category))].sort();
  const result = {
    totalRecords: RAW_DATA.length,
    gstSlabs: slabs,
    categories,
  };

  setCache(cacheKey, result);
  return result;
};

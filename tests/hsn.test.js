import request from "supertest";
import createApp from "../src/app.js";
import { clearCache } from "../src/services/hsnService.js";

const app = createApp();

beforeEach(() => clearCache());

// ── GET /api/hsn ─────────────────────────────────────────────────────────────
describe("GET /api/hsn", () => {
  it("returns paginated list with default page/limit", async () => {
    const res = await request(app).get("/api/hsn");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeLessThanOrEqual(10);
    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination.page).toBe(1);
  });

  it("supports custom page and limit", async () => {
    const res = await request(app).get("/api/hsn?page=2&limit=5");
    expect(res.statusCode).toBe(200);
    expect(res.body.results.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination.page).toBe(2);
  });

  it("supports sorting by gstRate", async () => {
    const res = await request(app).get("/api/hsn?sort=gstRate&limit=100");
    expect(res.statusCode).toBe(200);
    const rates = res.body.results.map((r) => r.gstRate);
    const sorted = [...rates].sort((a, b) => a - b);
    expect(rates).toEqual(sorted);
  });

  it("rejects invalid limit", async () => {
    const res = await request(app).get("/api/hsn?limit=999");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── GET /api/hsn/summary ─────────────────────────────────────────────────────
describe("GET /api/hsn/summary", () => {
  it("returns totalRecords, gstSlabs, and categories", async () => {
    const res = await request(app).get("/api/hsn/summary");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalRecords");
    expect(res.body.data).toHaveProperty("gstSlabs");
    expect(res.body.data).toHaveProperty("categories");
    expect(res.body.data.totalRecords).toBeGreaterThanOrEqual(50);
  });
});

// ── GET /api/hsn/:code ───────────────────────────────────────────────────────
describe("GET /api/hsn/:code", () => {
  it("returns correct record for a valid HSN code", async () => {
    const res = await request(app).get("/api/hsn/1001");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hsnCode).toBe("1001");
    expect(res.body.data).toHaveProperty("description");
    expect(res.body.data).toHaveProperty("gstRate");
    expect(res.body.data).toHaveProperty("category");
  });

  it("returns 404 for a non-existent HSN code", async () => {
    const res = await request(app).get("/api/hsn/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a non-numeric HSN code", async () => {
    const res = await request(app).get("/api/hsn/ABCD");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a single-digit HSN code (min 2 digits)", async () => {
    const res = await request(app).get("/api/hsn/1");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("serves cached response on second request", async () => {
    await request(app).get("/api/hsn/0901"); // warm cache
    const res = await request(app).get("/api/hsn/0901");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.hsnCode).toBe("0901");
  });
});

// ── GET /api/hsn/search ──────────────────────────────────────────────────────
describe("GET /api/hsn/search", () => {
  it("returns results for a valid search term", async () => {
    const res = await request(app).get("/api/hsn/search?q=wheat");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("pagination");
  });

  it("returns empty results for unmatched term", async () => {
    const res = await request(app).get("/api/hsn/search?q=zzzunknown");
    expect(res.statusCode).toBe(200);
    expect(res.body.results.length).toBe(0);
    expect(res.body.count).toBe(0);
  });

  it("returns 400 when q is missing", async () => {
    const res = await request(app).get("/api/hsn/search");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when q is too short", async () => {
    const res = await request(app).get("/api/hsn/search?q=a");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("supports sorting and pagination in search", async () => {
    const res = await request(app).get(
      "/api/hsn/search?q=oil&sort=gstRate&page=1&limit=5"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.results.length).toBeLessThanOrEqual(5);
  });
});

// ── GET /api/hsn/filter ──────────────────────────────────────────────────────
describe("GET /api/hsn/filter", () => {
  it("returns results for GST rate 18", async () => {
    const res = await request(app).get("/api/hsn/filter?gst=18");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    res.body.results.forEach((r) => expect(r.gstRate).toBe(18));
  });

  it("returns results for GST rate 0", async () => {
    const res = await request(app).get("/api/hsn/filter?gst=0");
    expect(res.statusCode).toBe(200);
    res.body.results.forEach((r) => expect(r.gstRate).toBe(0));
  });

  it("returns 400 for an invalid GST rate", async () => {
    const res = await request(app).get("/api/hsn/filter?gst=99");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when gst param is missing", async () => {
    const res = await request(app).get("/api/hsn/filter");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("supports pagination in filter", async () => {
    const res = await request(app).get("/api/hsn/filter?gst=18&page=1&limit=3");
    expect(res.statusCode).toBe(200);
    expect(res.body.results.length).toBeLessThanOrEqual(3);
    expect(res.body.pagination.limit).toBe(3);
  });
});

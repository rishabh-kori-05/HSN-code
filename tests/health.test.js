import request from "supertest";
import createApp from "../src/app.js";

const app = createApp();

describe("GET /api/health", () => {
  it("returns 200 with success true", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("API is running");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist-xyz");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import env from "./config/env.js";
import hsnRoutes from "./routes/hsnRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

// ── Swagger definition ────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HSN Code Lookup API",
      version: "1.0.0",
      description:
        "Production-ready REST API for querying GST information by Indian HSN codes.",
      contact: { name: "API Support", email: "support@example.com" },
      license: { name: "MIT" },
    },
    servers: [
      { url: "/", description: "Current server" },
    ],
    tags: [{ name: "HSN", description: "HSN code lookup and search" }],
  },
  apis: ["./src/routes/*.js"],
});

// ── Rate limiter ──────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
    statusCode: 429,
  },
});

// ── App factory ───────────────────────────────────────────────────────────────
const createApp = () => {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS.includes("*") ? "*" : env.ALLOWED_ORIGINS,
      methods: ["GET"],
    })
  );

  // Logging — skip in test env to keep output clean
  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Rate limiting (API routes only)
  app.use("/api/", limiter);

  // ── Health check ─────────────────────────────────────────────────────────
  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Health check
   *     tags: [HSN]
   *     responses:
   *       200:
   *         description: API is running
   */
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "API is running",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Swagger docs ──────────────────────────────────────────────────────────
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

  // ── Domain routes ─────────────────────────────────────────────────────────
  app.use("/api/hsn", hsnRoutes);

  // ── Catch-all & error handler ─────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;

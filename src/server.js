import createApp from "./app.js";
import env from "./config/env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`
┌──────────────────────────────────────────────┐
│          HSN Code Lookup API                 │
│                                              │
│  Environment : ${env.NODE_ENV.padEnd(28)}│
│  Port        : ${String(env.PORT).padEnd(28)}│
│  Docs        : http://localhost:${env.PORT}/api/docs  │
└──────────────────────────────────────────────┘
  `);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("[Server] HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;

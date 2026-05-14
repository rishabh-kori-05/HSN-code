# HSN Code Lookup API

> Production-ready REST API for querying GST tax information by Indian HSN (Harmonized System of Nomenclature) codes.

[![Node.js CI](https://github.com/YOUR_USERNAME/hsn-code-lookup-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/YOUR_USERNAME/hsn-code-lookup-api/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

---

## Overview

The HSN Code Lookup API is a lightweight, stateless REST service that maps Indian HSN codes to their corresponding GST rates, descriptions, and product categories. It is designed for integration into billing software, ERP systems, accounting tools, or any application that needs accurate, fast GST lookups.

Built with Express.js and a static JSON dataset, it ships with full-text search, GST-rate filtering, pagination, sorting, in-memory caching, rate limiting, Joi validation, Swagger documentation, and a GitHub Actions CI pipeline.

---

## Features

- **HSN lookup** by exact code
- **Full-text search** across code, description, and category
- **Filter by GST rate** (0%, 3%, 5%, 12%, 18%, 28%)
- **Pagination & sorting** on all list endpoints
- **In-memory caching** with configurable TTL
- **Rate limiting** (per IP, configurable)
- **Joi validation** with descriptive error messages
- **Swagger / OpenAPI 3.0** interactive docs at `/api/docs`
- **Helmet + CORS** security headers
- **Morgan** HTTP request logging
- **Jest + Supertest** test suite (22 tests)
- **GitHub Actions** CI across Node 18, 20, 22
- **Graceful shutdown** on SIGTERM/SIGINT

---

## Project Structure

```
hsn-code-lookup-api/
├── src/
│   ├── config/env.js           # Centralised environment config
│   ├── controllers/
│   │   └── hsnController.js    # Route handlers (thin layer)
│   ├── routes/
│   │   └── hsnRoutes.js        # Express router + Swagger JSDoc annotations
│   ├── middleware/
│   │   ├── errorHandler.js     # Centralised error formatting
│   │   ├── notFound.js         # 404 catch-all
│   │   └── validateRequest.js  # Joi middleware factory
│   ├── services/
│   │   └── hsnService.js       # Business logic + in-memory cache
│   ├── validators/
│   │   └── hsnValidator.js     # Joi schemas
│   ├── data/
│   │   └── hsnData.json        # Static dataset (60+ HSN records)
│   ├── utils/
│   │   └── responseFormatter.js # Response envelope helpers
│   ├── app.js                  # Express app factory
│   └── server.js               # Entry point + graceful shutdown
├── tests/
│   ├── hsn.test.js             # HSN endpoint tests (20 cases)
│   └── health.test.js          # Health & 404 tests
├── .github/workflows/node.js.yml
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/hsn-code-lookup-api.git
cd hsn-code-lookup-api

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start development server
npm run dev
```

The API will be live at `http://localhost:3000`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | HTTP port |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |
| `CACHE_TTL_MS` | `300000` | In-memory cache TTL (ms) |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS origins |

---

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/hsn` | Paginated list of all HSN codes |
| GET | `/api/hsn/summary` | Dataset summary by GST slab |
| GET | `/api/hsn/search?q=` | Full-text search |
| GET | `/api/hsn/filter?gst=` | Filter by GST rate |
| GET | `/api/hsn/:code` | Lookup a specific HSN code |
| GET | `/api/docs` | Swagger UI |
| GET | `/api/docs.json` | OpenAPI 3.0 JSON spec |

---

## Request & Response Examples

### Health Check

```http
GET /api/health
```

```json
{
  "success": true,
  "message": "API is running",
  "environment": "development",
  "timestamp": "2025-01-01T10:00:00.000Z"
}
```

---

### Lookup HSN Code

```http
GET /api/hsn/1001
```

```json
{
  "success": true,
  "data": {
    "hsnCode": "1001",
    "description": "Wheat and meslin",
    "gstRate": 5,
    "category": "Agricultural Products"
  }
}
```

**HSN code not found:**

```http
GET /api/hsn/9999
```

```json
{
  "success": false,
  "error": "HSN code \"9999\" not found",
  "statusCode": 404
}
```

---

### List All (Paginated)

```http
GET /api/hsn?page=1&limit=5&sort=gstRate
```

```json
{
  "success": true,
  "count": 5,
  "results": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 62,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Search

```http
GET /api/hsn/search?q=wheat&sort=hsnCode
```

```json
{
  "success": true,
  "count": 2,
  "results": [
    {
      "hsnCode": "1001",
      "description": "Wheat and meslin",
      "gstRate": 5,
      "category": "Agricultural Products"
    },
    {
      "hsnCode": "1101",
      "description": "Wheat or meslin flour",
      "gstRate": 0,
      "category": "Flour & Grain Products"
    }
  ],
  "pagination": { ... }
}
```

---

### Filter by GST Rate

```http
GET /api/hsn/filter?gst=28&limit=5
```

```json
{
  "success": true,
  "count": 5,
  "results": [
    { "hsnCode": "2202", "description": "Waters with added sugar", "gstRate": 28, "category": "Beverages" },
    ...
  ],
  "pagination": { ... }
}
```

---

### Dataset Summary

```http
GET /api/hsn/summary
```

```json
{
  "success": true,
  "data": {
    "totalRecords": 62,
    "gstSlabs": {
      "0%": 12,
      "3%": 2,
      "5%": 16,
      "12%": 12,
      "18%": 14,
      "28%": 6
    },
    "categories": ["Agricultural Products", "Art & Antiques", ...]
  }
}
```

---

### Validation Error

```http
GET /api/hsn/ABCD
```

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["HSN code must be a numeric string between 2 and 8 digits"],
  "statusCode": 400
}
```

---

## Testing

```bash
# Run full test suite
npm test

# Run with coverage report
npm run test:coverage
```

**Current test results:** 22 tests across 2 suites — all passing.

Tests cover:
- Health check & 404 routes
- Valid/invalid HSN code lookups
- Pagination and sorting on list
- Search — match, no match, missing/short query
- Filter — valid rate, invalid rate, missing param, pagination
- Cache behaviour (warm cache read)

---

## Swagger Documentation

Interactive API docs are available at:

```
http://localhost:3000/api/docs
```

The raw OpenAPI 3.0 JSON spec:

```
http://localhost:3000/api/docs.json
```

---

## Deployment

### Render

1. Push to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add environment variables from `.env.example`.

### Railway

1. Push to GitHub.
2. Create a new project on [railway.app](https://railway.app).
3. Connect the repo — Railway auto-detects Node.js.
4. Set `PORT` to `${{PORT}}` (Railway injects this automatically).
5. Add remaining env vars in the Variables tab.

### Vercel

> Best for serverless. Requires an `api/` entry adapter.

Alternatively, deploy as a standard Node.js server using `vercel --prod` with `"builds": [{ "src": "src/server.js", "use": "@vercel/node" }]` in `vercel.json`.

### Environment for Production

```env
NODE_ENV=production
PORT=3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CACHE_TTL_MS=300000
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## GitHub Push Instructions

```bash
git init
git add .
git commit -m "feat: initial production release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hsn-code-lookup-api.git
git push -u origin main
```

CI will automatically run on push via GitHub Actions.

---

## Production Checklist

- [x] All endpoints return consistent JSON envelopes
- [x] Joi validation on params, query, body
- [x] Centralised error handler — no stack traces in production
- [x] Helmet security headers
- [x] CORS configured
- [x] Rate limiting (IP-based)
- [x] In-memory caching with TTL
- [x] Morgan HTTP logging (suppressed in test env)
- [x] Graceful SIGTERM/SIGINT shutdown
- [x] 22 Jest + Supertest tests — all passing
- [x] GitHub Actions CI across Node 18/20/22
- [x] Swagger/OpenAPI 3.0 docs
- [x] `.env.example` committed, `.env` gitignored
- [x] ES Modules throughout (`"type": "module"`)
- [x] No hardcoded secrets or magic strings

---

## Future Roadmap

- [ ] PostgreSQL / SQLite persistence for user-editable HSN data
- [ ] Admin endpoints (add/update/delete HSN records) with JWT auth
- [ ] Redis cache adapter (drop-in replacement for in-memory cache)
- [ ] Bulk lookup endpoint (`POST /api/hsn/bulk`)
- [ ] CSV/Excel export of filtered results
- [ ] Webhook support for GST rate change notifications
- [ ] Multi-language descriptions (Hindi, regional languages)
- [ ] Expand dataset to full 5000+ HSN code catalogue

---

## License

[MIT](./LICENSE)

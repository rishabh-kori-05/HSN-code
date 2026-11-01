# HSN Code Lookup API

A Node.js and Express REST API for looking up Indian HSN codes and their associated descriptions, categories and GST rates.

## Features

- Look up an HSN code
- Search records by code, description or category
- Filter records by GST rate
- Paginated and sortable results
- In-memory response caching
- Request validation and rate limiting
- Swagger / OpenAPI documentation
- Jest and Supertest tests
- GitHub Actions workflow

## Important dataset limitation

The repository currently includes a **small sample dataset (approximately 60 records)**. It is a demonstration dataset, not a complete or authoritative HSN catalogue. Verify tax classifications and rates against current official sources before using them for billing, tax filing or other business decisions.

## Tech stack

- Node.js
- Express.js
- Joi
- Swagger / OpenAPI
- Jest and Supertest

## Run locally

Requirements: Node.js 18+ and npm.

```bash
git clone https://github.com/rishabh-kori-05/HSN-code.git
cd HSN-code
npm install
cp .env.example .env
npm run dev
```

The API defaults to `http://localhost:3000`. Check `package.json` for the available scripts if your local setup differs.

## Environment variables

| Variable | Default | Description |
|---|---:|---|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | HTTP port |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit window |
| `RATE_LIMIT_MAX` | `100` | Maximum requests per window |
| `CACHE_TTL_MS` | `300000` | Cache time-to-live |
| `ALLOWED_ORIGINS` | `*` | Allowed CORS origins |

## API endpoints

Base path: `/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/hsn` | List records |
| GET | `/hsn/summary` | Dataset summary |
| GET | `/hsn/search?q=` | Search records |
| GET | `/hsn/filter?gst=` | Filter by GST rate |
| GET | `/hsn/:code` | Look up one code |
| GET | `/docs` | Swagger UI |

Interactive API documentation is available at `/api/docs` when the server is running.

## Tests

Run the test suite with:

```bash
npm test
```

## Project structure

```text
src/
  config/
  controllers/
  routes/
  middleware/
  services/
  validators/
  data/
  utils/
  app.js
  server.js
tests/
.github/workflows/
.env.example
package.json
```

## Scope and possible next steps

This project currently uses a static JSON dataset. Possible extensions include a maintained full catalogue, bulk lookup, CSV export and persistent storage. These are future ideas, not current features.

## License

MIT. See [LICENSE](./LICENSE).

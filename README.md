# backAlgolia

This project demonstrates an Algolia search implementation with an Express.js backend and a simple InstantSearch.js powered frontend.

## Features

- Search as you type with InstantSearch.js
- Brand refinement, pagination and price based sorting
- Hits show name, image and price
- Proxy search requests through the Express.js server
- Frontend sends `X-Forwarded-For` header so the backend can forward the user IP to Algolia
- Request and Algolia latency traced with OpenTelemetry and Honeycomb

## Setup

1. Copy `.env.sample` to `.env` and fill in your Algolia credentials.
2. Copy `client/env.example.js` to `client/env.js` and adjust the index name and replicas if needed.
3. Install dependencies (requires internet access):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node server/index.js
   ```
   The Express server now also serves the static frontend.
5. Open `http://localhost:3000` in your browser. The frontend proxies search requests to the backend at `/search` and `/facet`.
   Traces are sent to Honeycomb if `HONEYCOMB_API_KEY` and `HONEYCOMB_DATASET`
   are set in your `.env` file.

## Notes

- Two Algolia replica indices named `products_price_asc` and `products_price_desc` are expected for sorting by price.
- The example fetches the client IP via `https://api.ipify.org`; adjust as needed or remove if running offline.
- Frontend configuration is read from `client/env.js` so index names can be changed without modifying `index.html`.


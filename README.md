# backAlgolia

This project demonstrates an Algolia search implementation with an Express.js backend and a simple InstantSearch.js powered frontend.

## Features

- Search as you type with InstantSearch.js
- Brand refinement, pagination and price based sorting
- Hits show name, image and price
- Proxy search requests through the Express.js server
- Frontend sends `X-Forwarded-For` header so the backend can forward the user IP to Algolia

## Setup

1. Copy `.env.example` to `.env` and fill in your Algolia credentials.
2. Install dependencies (requires internet access):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server/index.js
   ```
4. Serve the `client/` folder (for example with `npx serve client`). The frontend proxies search requests to the backend at `/search` and `/facet`.

## Notes

- Two Algolia replica indices named `products_price_asc` and `products_price_desc` are expected for sorting by price.
- The example fetches the client IP via `https://api.ipify.org`; adjust as needed or remove if running offline.


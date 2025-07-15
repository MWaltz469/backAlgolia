// Initialize OpenTelemetry and Honeycomb export
require('./tracing');

const express = require('express');
const cors = require('cors');
const algoliasearch = require('algoliasearch');
const path = require('path');
const botAuth  = require('./authBotMiddleware');
// The OpenTelemetry API is used directly for manual spans
const { trace } = require('@opentelemetry/api');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

// Obtain a tracer to create custom spans within the application
const tracer = trace.getTracer('backAlgolia');

// Convert a high-resolution time tuple to milliseconds
function hrToMs(hr) {
  return hr[0] * 1000 + hr[1] / 1e6;
}

// Middleware to record the total time spent handling each request
app.use((req, res, next) => {
  const span = tracer.startSpan('http_request', {
    attributes: {
      'http.method': req.method,
      'http.target': req.originalUrl,
    },
  });
  const start = process.hrtime();
  res.on('finish', () => {
    span.setAttribute('http.status_code', res.statusCode);
    span.setAttribute('request.duration_ms', hrToMs(process.hrtime(start)));
    span.end();
  });
  next();
});

const appId = process.env.ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME;

if (!appId || !apiKey || !indexName) {
  console.error('Missing Algolia configuration');
  process.exit(1);
}

const client = algoliasearch(appId, apiKey);
client.initIndex(indexName)
  .search('', { hitsPerPage: 1 })
  .then(() => console.log('Algolia connectivity verified'))
  .catch(err => console.error('Algolia connection error:', err.message));

// Wrap search endpoint in a span to capture Algolia request latency
app.post('/search', botAuth, async (req, res) => {
  const requests = req.body.requests || [];
  const userIp = req.headers['x-forwarded-for'] || req.ip;

  await tracer.startActiveSpan('algolia.search', async span => {
    // Measure the time spent waiting for Algolia to respond
    const start = process.hrtime();
    try {
      const results = await client.search(requests, {
        headers: { 'X-Forwarded-For': userIp }
      });
      // Record how long the Algolia API took
      span.setAttribute('algolia.latency_ms', hrToMs(process.hrtime(start)));
      res.json(results);
    } catch (err) {
      span.recordException(err);
      res.status(500).json({ error: err.message });
    } finally {
      span.end();
    }
  });
});

// Similar span for facet value requests
app.post('/facet', async (req, res) => {
  const requests = req.body.requests || [];
  const userIp = req.headers['x-forwarded-for'] || req.ip;

  await tracer.startActiveSpan('algolia.facet', async span => {
    // Measure the time spent waiting for Algolia facets
    const start = process.hrtime();
    try {
      const results = await client.searchForFacetValues(requests, {
        headers: { 'X-Forwarded-For': userIp }
      });
      // Record API latency for the facet search
      span.setAttribute('algolia.latency_ms', hrToMs(process.hrtime(start)));
      res.json(results);
    } catch (err) {
      span.recordException(err);
      res.status(500).json({ error: err.message });
    } finally {
      span.end();
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


const express = require('express');
const cors = require('cors');
const algoliasearch = require('algoliasearch');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const appId = process.env.ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME;

if (!appId || !apiKey || !indexName) {
  console.error('Missing Algolia configuration');
  process.exit(1);
}

const client = algoliasearch(appId, apiKey);

app.post('/search', async (req, res) => {
  const requests = req.body.requests || [];
  const userIp = req.headers['x-forwarded-for'] || req.ip;

  try {
    const results = await client.search(requests, {
      headers: { 'X-Forwarded-For': userIp }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/facet', async (req, res) => {
  const requests = req.body.requests || [];
  const userIp = req.headers['x-forwarded-for'] || req.ip;

  try {
    const results = await client.searchForFacetValues(requests, {
      headers: { 'X-Forwarded-For': userIp }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


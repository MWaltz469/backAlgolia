const hitTable = new Map();   // keeps per-client counters

module.exports = (req, res, next) => {
  const span = honeycomb.startSpan({ name: 'botAuth' });

  const key   = req.headers['x-user-token'] || req.ip;
  const hits  = hitTable.get(key) ?? 0;
  hitTable.set(key, hits + 1);

  const delay = Math.min(20 * hits, 450);      // delay grows with traffic
  span.addField('auth.hit_count', hits);
  span.addField('auth.delay_ms', delay);

  setTimeout(() => {
    span.end();
    next();          // hand control to the next middleware/route handler
  }, delay);
};

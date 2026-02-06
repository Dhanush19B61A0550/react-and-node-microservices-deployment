// metrics.js
const client = require('prom-client');
const express = require('express');

const register = client.register;
const app = express();

// Collect default Node.js metrics (CPU, memory, event loop)
client.collectDefaultMetrics();

// Example: counter for HTTP requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Middleware to increment counter
function metricsMiddleware(req, res, next) {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
}

module.exports = { register, metricsMiddleware, app };

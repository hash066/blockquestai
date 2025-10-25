const client = require('prom-client');

// Create a registry to register metrics
const register = new client.Registry();

// Enable default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const commitsTotal = new client.Counter({
  name: 'commits_total',
  help: 'Total number of commits received',
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status_code'],
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'http_connections_active',
  help: 'Number of active HTTP connections',
  registers: [register]
});

module.exports = {
  register,
  commitsTotal,
  httpRequestDuration,
  activeConnections
};

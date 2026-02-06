// const express = require('express');
// const cors = require('cors'); // enable CORS
// const { init, getUsers, addUser } = require('./db');
// const client = require('prom-client'); // ✅ Prometheus client

// const app = express();

// /* ------------ Prometheus Metrics Setup ------------ */
// const register = new client.Registry();

// // Collect default Node.js metrics (CPU, memory, event loop)
// client.collectDefaultMetrics({ register });

// // Counter for HTTP requests
// const httpRequestCounter = new client.Counter({
//   name: 'http_requests_total',
//   help: 'Total HTTP requests',
//   labelNames: ['method', 'route', 'status'],
// });
// register.registerMetric(httpRequestCounter);

// // Counter for users created
// const usersCreatedCounter = new client.Counter({
//   name: 'users_created_total',
//   help: 'Total users created successfully',
// });
// register.registerMetric(usersCreatedCounter);

// // Middleware to count HTTP requests
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
//   });
//   next();
// });

// /* ------------ Middleware ------------ */
// app.use(express.json());
// app.use(cors());

// /* ------------ DB Init ------------ */
// init()
//   .then(() => console.log('User Service DB initialized'))
//   .catch(err => {
//     console.error('DB init failed:', err);
//     process.exit(1);
//   });

// /* ------------ Routes ------------ */

// // GET all users
// app.get('/users', async (req, res) => {
//   try {
//     const users = await getUsers();
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error fetching users');
//   }
// });

// // POST add user
// app.post('/users', async (req, res) => {
//   try {
//     const user = await addUser(req.body);

//     // ✅ Increment users created counter
//     usersCreatedCounter.inc();

//     res.json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error adding user');
//   }
// });

// /* ------------ Metrics Endpoint ------------ */
// app.get('/metrics', async (req, res) => {
//   try {
//     res.set('Content-Type', register.contentType);
//     res.end(await register.metrics());
//   } catch (err) {
//     res.status(500).end(err);
//   }
// });

// /* ------------ Start Server ------------ */
// const PORT = 3003;
// app.listen(PORT, () => console.log('User Service running on port 3003'));
const express = require('express');
const cors = require('cors'); // enable CORS
const { init, getUsers, addUser } = require('./db');
const client = require('prom-client'); // ✅ Prometheus client
const logger = require('./logger'); // ✅ Winston logger

const app = express();

/* ------------ Prometheus Metrics Setup ------------ */
const register = new client.Registry();

// Collect default Node.js metrics (CPU, memory, event loop)
client.collectDefaultMetrics({ register });

// Counter for HTTP requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestCounter);

// Counter for users created
const usersCreatedCounter = new client.Counter({
  name: 'users_created_total',
  help: 'Total users created successfully',
});
register.registerMetric(usersCreatedCounter);

// Middleware to count HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

/* ------------ Middleware ------------ */
app.use(express.json());
app.use(cors());

/* ------------ DB Init ------------ */
init()
  .then(() => logger.info('User Service DB initialized'))
  .catch(err => {
    logger.error('DB init failed: ' + err.message);
    process.exit(1);
  });

/* ------------ Routes ------------ */

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await getUsers();
    logger.info(`Fetched ${users.length} users successfully`);
    res.status(200).json(users);
  } catch (err) {
    logger.error('GET /users error: ' + err.message);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// POST add user
app.post('/users', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      logger.error('Failed to add user: name missing');
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await addUser({ name });

    logger.info(`User added successfully: ${user.name} (id=${user.id})`);

    // ✅ Increment users created counter
    usersCreatedCounter.inc();

    res.status(201).json(user);
  } catch (err) {
    logger.error('POST /users error: ' + (err.message || err));
    res.status(500).json({ error: err.message || 'Error adding user' });
  }
});

/* ------------ Metrics Endpoint ------------ */
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error('Error fetching metrics: ' + err.message);
    res.status(500).end(err);
  }
});

/* ------------ Start Server ------------ */
const PORT = 3003;
app.listen(PORT, () => {
  logger.info(`User Service running on port ${PORT}`);
});

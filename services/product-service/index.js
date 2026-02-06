// const express = require('express');
// const cors = require('cors');
// const { init, getProducts, addProduct } = require('./db');
// const client = require('prom-client'); // ✅ Prometheus client

// const app = express();

// /* ------------ Prometheus Metrics Setup ------------ */
// const register = new client.Registry();

// // Collect default Node.js metrics
// client.collectDefaultMetrics({ register });

// // Counter for HTTP requests
// const httpRequestCounter = new client.Counter({
//   name: 'http_requests_total',
//   help: 'Total HTTP requests',
//   labelNames: ['method', 'route', 'status'],
// });
// register.registerMetric(httpRequestCounter);

// // Counter for products created
// const productsCreatedCounter = new client.Counter({
//   name: 'products_created_total',
//   help: 'Total products created successfully',
// });
// register.registerMetric(productsCreatedCounter);

// // Middleware to count HTTP requests
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
//   });
//   next();
// });

// /* ------------ Middleware ------------ */
// app.use(cors());
// app.use(express.json());

// /* ------------ DB Init ------------ */
// init()
//   .then(() => console.log('Database initialized'))
//   .catch(err => {
//     console.error('Database init failed:', err);
//     process.exit(1);
//   });

// /* ------------ Routes ------------ */

// // GET all products
// app.get('/products', async (req, res) => {
//   try {
//     const products = await getProducts();
//     res.status(200).json(products);
//   } catch (err) {
//     console.error('GET /products error:', err);
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// });

// // POST add product
// app.post('/products', async (req, res) => {
//   try {
//     console.log('Incoming product payload:', req.body);

//     const { name, price, description, stock } = req.body;

//     if (!name || typeof price !== 'number' || isNaN(price)) {
//       return res.status(400).json({ error: 'Valid name and price are required' });
//     }

//     const productData = {
//       name,
//       price,
//       description: description || '',
//       stock: typeof stock === 'number' ? stock : 0
//     };

//     const product = await addProduct(productData);

//     console.log('Product created successfully:', product);

//     // ✅ Increment products created counter
//     productsCreatedCounter.inc();

//     res.status(201).json(product);

//   } catch (err) {
//     console.error('POST /products error:', err);
//     res.status(500).json({ error: err.message || 'Failed to add product' });
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
// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Product Service running on port ${PORT}`);
// });
// const express = require('express');
// const cors = require('cors');
// const { init, getProducts, addProduct } = require('./db');
// const client = require('prom-client'); // ✅ Prometheus client

// const app = express();

// /* ------------ Prometheus Metrics Setup ------------ */
// const register = new client.Registry();

// // Collect default Node.js metrics (CPU, memory, event loop, etc.)
// client.collectDefaultMetrics({ register });

// // Counter for HTTP requests
// const httpRequestCounter = new client.Counter({
//   name: 'http_requests_total',
//   help: 'Total HTTP requests',
//   labelNames: ['method', 'route', 'status'],
// });
// register.registerMetric(httpRequestCounter);

// // Counter for products created
// const productsCreatedCounter = new client.Counter({
//   name: 'products_created_total',
//   help: 'Total products created successfully',
// });
// register.registerMetric(productsCreatedCounter);

// // Middleware to count HTTP requests
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
//   });
//   next();
// });

// /* ------------ Middleware ------------ */
// app.use(cors());
// app.use(express.json());

// /* ------------ DB Init ------------ */
// init()
//   .then(() => console.log('Database initialized'))
//   .catch(err => {
//     console.error('Database init failed:', err);
//     process.exit(1);
//   });

// /* ------------ Routes ------------ */

// // GET all products
// app.get('/products', async (req, res) => {
//   try {
//     const products = await getProducts();
//     res.status(200).json(products);
//   } catch (err) {
//     console.error('GET /products error:', err);
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// });

// // POST add product
// app.post('/products', async (req, res) => {
//   try {
//     const { name, price, description, stock } = req.body;

//     if (!name || typeof price !== 'number' || isNaN(price)) {
//       return res.status(400).json({ error: 'Valid name and price are required' });
//     }

//     const productData = {
//       name,
//       price,
//       description: description || '',
//       stock: typeof stock === 'number' ? stock : 0
//     };

//     const product = await addProduct(productData);

//     // ✅ Increment products created counter
//     productsCreatedCounter.inc();

//     res.status(201).json(product);
//   } catch (err) {
//     console.error('POST /products error:', err);
//     res.status(500).json({ error: err.message || 'Failed to add product' });
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
// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Product Service running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const { init, getProducts, addProduct } = require('./db');
const client = require('prom-client'); // ✅ Prometheus client
const logger = require('./logger'); // ✅ Winston logger

const app = express();

/* ------------ Prometheus Metrics Setup ------------ */
const register = new client.Registry();

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Counter for HTTP requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestCounter);

// Counter for products created
const productsCreatedCounter = new client.Counter({
  name: 'products_created_total',
  help: 'Total products created successfully',
});
register.registerMetric(productsCreatedCounter);

// Middleware to count HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

/* ------------ Middleware ------------ */
app.use(cors());
app.use(express.json());

/* ------------ DB Init ------------ */
init()
  .then(() => logger.info('Product Service DB initialized'))
  .catch(err => {
    logger.error('Database init failed: ' + err.message);
    process.exit(1);
  });

/* ------------ Routes ------------ */

// GET all products
app.get('/products', async (req, res) => {
  try {
    const products = await getProducts();
    logger.info(`Fetched ${products.length} products successfully`);
    res.status(200).json(products);
  } catch (err) {
    logger.error('GET /products error: ' + err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST add product
app.post('/products', async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    if (!name || typeof price !== 'number' || isNaN(price)) {
      logger.error('Failed to add product: invalid name or price');
      return res.status(400).json({ error: 'Valid name and price are required' });
    }

    const productData = {
      name,
      price,
      description: description || '',
      stock: typeof stock === 'number' ? stock : 0
    };

    const product = await addProduct(productData);

    logger.info(`Product added successfully: ${name} (id=${product.id}, price=${price})`);

    // ✅ Increment products created counter
    productsCreatedCounter.inc();

    res.status(201).json(product);
  } catch (err) {
    logger.error('POST /products error: ' + (err.message || err));
    res.status(500).json({ error: err.message || 'Failed to add product' });
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
const PORT = 3001;
app.listen(PORT, () => {
  logger.info(`Product Service running on port ${PORT}`);
});

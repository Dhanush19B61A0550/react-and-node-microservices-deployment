const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { init, addOrder, getOrders } = require('./db');
const client = require('prom-client'); // ✅ Prometheus client

const app = express();

/* ------------ Prometheus Metrics Setup ------------ */
// Create a Registry
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

// Counter for orders created
const ordersCreatedCounter = new client.Counter({
  name: 'orders_created_total',
  help: 'Total orders created successfully',
});
register.registerMetric(ordersCreatedCounter);

// Middleware to count HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

/* ------------ Middleware ------------ */
app.use(express.json());
app.use(cors()); // enable CORS

/* ------------ DB Init ------------ */
init()
  .then(() => console.log('Order Service DB initialized'))
  .catch(err => {
    console.error('DB init failed:', err);
    process.exit(1);
  });

/* ------------ Config ------------ */
// Product Service URLs
const PRODUCT_SERVICE_INTERNAL = 'http://52.238.31.54/products';
const PRODUCT_SERVICE_LOCAL = 'http://127.0.0.1:60394/products';
const isKubernetes = process.env.KUBERNETES_SERVICE_HOST !== undefined;

/* ------------ Routes ------------ */

// GET all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await getOrders();
    res.status(200).json(orders);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST a new order
app.post('/orders', async (req, res) => {
  try {
    console.log('Incoming order payload:', req.body);

    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }

    const productServiceURL = isKubernetes ? PRODUCT_SERVICE_INTERNAL : PRODUCT_SERVICE_LOCAL;

    let productResp;
    try {
      productResp = await axios.get(productServiceURL, { timeout: 3000 });
    } catch (err) {
      console.error('Error fetching products:', err.message);
      return res.status(502).json({ error: 'Cannot fetch products from Product Service' });
    }

    const product = productResp.data.find(p => p.id === productId);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    if (typeof product.price !== 'number' || isNaN(product.price)) {
      return res.status(400).json({ error: 'Product price is invalid' });
    }

    const orderData = {
      userId,
      productId,
      productName: product.name,
      price: product.price
    };

    const order = await addOrder(orderData);

    console.log('Order created successfully:', order);

    // ✅ Increment orders counter
    ordersCreatedCounter.inc();

    res.status(201).json(order);

  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

/* ------------ Metrics Endpoint ------------ */
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

/* ------------ Start Server ------------ */
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

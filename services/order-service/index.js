const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { init, addOrder, getOrders } = require('./db');

const app = express();

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
// Use ClusterIP inside Kubernetes
const PRODUCT_SERVICE_INTERNAL = 'http://product-service:3001/products';
// Use NodePort for testing locally on host machine
const PRODUCT_SERVICE_LOCAL = 'http://127.0.0.1:60394/products';

// Helper to detect environment
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

    // Validate input
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }

    // Select correct Product Service URL
    const productServiceURL = isKubernetes ? PRODUCT_SERVICE_INTERNAL : PRODUCT_SERVICE_LOCAL;

    // Fetch products from Product Service
    let productResp;
    try {
      productResp = await axios.get(productServiceURL, { timeout: 3000 });
    } catch (err) {
      console.error('Error fetching products:', err.message);
      return res.status(502).json({ error: 'Cannot fetch products from Product Service' });
    }

    // Find the product
    const product = productResp.data.find(p => p.id === productId);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    if (typeof product.price !== 'number' || isNaN(product.price)) {
      return res.status(400).json({ error: 'Product price is invalid' });
    }

    // Create order in DB
    const orderData = {
      userId,
      productId,
      productName: product.name,
      price: product.price
    };

    const order = await addOrder(orderData);

    console.log('Order created successfully:', order);
    res.status(201).json(order);

  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

/* ------------ Start Server ------------ */
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

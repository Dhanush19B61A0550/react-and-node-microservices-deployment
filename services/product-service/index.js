const express = require('express');
const cors = require('cors');
const { init, getProducts, addProduct } = require('./db');

const app = express();

/* ------------ Middleware ------------ */
app.use(cors());
app.use(express.json());

/* ------------ DB Init ------------ */
init()
  .then(() => console.log('Database initialized'))
  .catch(err => {
    console.error('Database init failed:', err);
    process.exit(1);
  });

/* ------------ Routes ------------ */

// GET all products
app.get('/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST add product
app.post('/products', async (req, res) => {
  try {
    console.log('Incoming product payload:', req.body);

    const { name, price, description, stock } = req.body;

    // ✅ Proper validation
    if (!name || typeof price !== 'number' || isNaN(price)) {
      return res.status(400).json({
        error: 'Valid name and price are required'
      });
    }

    // Provide default values for optional fields to prevent DB errors
    const productData = {
      name,
      price,
      description: description || '', // default empty string
      stock: typeof stock === 'number' ? stock : 0 // default 0
    };

    const product = await addProduct(productData);

    console.log('Product created successfully:', product);
    res.status(201).json(product);

  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).json({
      error: err.message || 'Failed to add product'
    });
  }
});

/* ------------ Start Server ------------ */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});

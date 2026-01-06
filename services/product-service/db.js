const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'product_db',
  process.env.DB_USER || 'micro_user',
  process.env.DB_PASSWORD || 'micro_pass',
  {
    host: process.env.DB_HOST || 'mysql',
    port: 3306,
    dialect: 'mysql'
  }
);

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false }
});

async function init() {
  await sequelize.authenticate();
  await sequelize.sync();
}

async function addProduct(product) {
  return await Product.create(product);
}

async function getProducts() {
  return await Product.findAll();
}

module.exports = {
  init,
  addProduct,
  getProducts
};

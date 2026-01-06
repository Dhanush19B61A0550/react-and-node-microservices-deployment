const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'order_db',
  process.env.DB_USER || 'micro_user',
  process.env.DB_PASSWORD || 'micro_pass',
  {
    host: process.env.DB_HOST || 'mysql', 
    port: 3306,
    dialect: 'mysql'
  }
);

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  productName: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false }
});

async function init() {
  await sequelize.authenticate(); // optional but very useful
  await sequelize.sync();
}

async function addOrder(order) {
  return await Order.create(order);
}

async function getOrders() {
  return await Order.findAll();
}

module.exports = { init, addOrder, getOrders };

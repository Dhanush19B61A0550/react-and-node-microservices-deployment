const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'user_db',
  process.env.DB_USER || 'micro_user',
  process.env.DB_PASSWORD || 'micro_pass',
  {
    host: process.env.DB_HOST || 'mysql',
    port: 3306,
    dialect: 'mysql'
  }
);

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false }
});

async function init() {
  await sequelize.authenticate();
  await sequelize.sync();
}

async function getUsers() {
  return await User.findAll();
}

async function addUser(user) {
  return await User.create(user);
}

module.exports = { init, getUsers, addUser };

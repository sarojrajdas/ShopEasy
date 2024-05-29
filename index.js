const express = require('express');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

const app = express();

app.use(express.json());
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);

module.exports = app;

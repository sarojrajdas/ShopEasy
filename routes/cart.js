const express = require('express');
const fs = require('fs');
const router = express.Router();

const dataFilePath = 'data.json';

// Helper function to read data
const readData = () => {
    const rawData = fs.readFileSync(dataFilePath);
    return JSON.parse(rawData);
};

// Helper function to write data
const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

router.post('/', (req, res) => {
    const { productId, quantity } = req.body;
    const data = readData();

    const product = data.products.find((p) => p.id === productId);
    if (!product) {
        return res.status(404).send('Product not found');
    }

    const cartItem = data.cart.find((item) => item.productId === productId);
    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        data.cart.push({ productId, quantity });
    }

    writeData(data);
    res.send('Product added to cart');
});

router.get('/', (req, res) => {
    const data = readData();
    const cartItems = data.cart.map((item) => {
        const product = data.products.find((p) => p.id === item.productId);
        return { productId: item.productId, name: product.name, quantity: item.quantity };
    });
    res.json(cartItems);
});

router.delete('/:productId', (req, res) => {
    const { productId } = req.params;
    const data = readData();
    const cartItem = data.cart.find((item) => item.productId === parseInt(productId));

    if (!cartItem) {
        return res.status(404).send('Product not found in cart');
    }

    if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        res.send('Product quantity decremented');
    } else {
        data.cart = data.cart.filter((item) => item.productId !== parseInt(productId));
        res.send('Product removed from cart');
    }

    writeData(data);
});

module.exports = router;

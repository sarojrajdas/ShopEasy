const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Function to read data from the JSON file
const readData = () => {
    const data = fs.readFileSync('data.json');
    return JSON.parse(data);
}

// Function to write data to the JSON file
const writeData = (data) => {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// Endpoint to get all products
app.get('/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// Endpoint to add a product to the cart
app.post('/cart', (req, res) => {
    const { productId, quantity } = req.body;
    const data = readData();
    const product = data.products.find(p => p.id === productId);

    if (product) {
        const cartItem = data.cart.find(item => item.productId === productId);
        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            data.cart.push({ productId, quantity });
        }
        writeData(data);
        res.status(200).send('Product added to cart');
    } else {
        res.status(404).send('Product not found');
    }
});

// Endpoint to get all items in the cart
app.get('/cart', (req, res) => {
    const data = readData();
    const cartItems = data.cart.map(item => {
        const product = data.products.find(p => p.id === item.productId);
        return {
            productId: item.productId,
            name: product.name,
            quantity: item.quantity
        };
    });
    res.json(cartItems);
});

// Endpoint to decrement a product quantity in the cart
app.post('/cart/decrement', (req, res) => {
    const { productId } = req.body;
    const data = readData();
    const cartItem = data.cart.find(item => item.productId === productId);

    if (cartItem) {
        cartItem.quantity -= 1;
        if (cartItem.quantity <= 0) {
            data.cart = data.cart.filter(item => item.productId !== productId);
        }
        writeData(data);
        res.status(200).send('Product quantity decremented');
    } else {
        res.status(404).send('Product not found in cart');
    }
});

// Endpoint to decrement a product quantity in the cart
app.delete('/cart/:productId', (req, res) => {
    const { productId } = req.params;
    const data = readData();
    const cartItem = data.cart.find(item => item.productId === parseInt(productId));

    if (cartItem) {
        cartItem.quantity -= 1;
        if (cartItem.quantity <= 0) {
            data.cart = data.cart.filter(item => item.productId !== parseInt(productId));
        }
        writeData(data);
        res.status(200).send('Product quantity decremented');
    } else {
        res.status(404).send('Product not found in cart');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

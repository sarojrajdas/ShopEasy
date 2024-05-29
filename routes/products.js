const express = require('express');
const fs = require('fs');
const router = express.Router();

const dataFilePath = 'data.json';

// Helper function to read data
const readData = () => {
    const rawData = fs.readFileSync(dataFilePath);
    return JSON.parse(rawData);
};

router.get('/', (req, res) => {
    const data = readData();
    res.json(data.products);
});

module.exports = router;

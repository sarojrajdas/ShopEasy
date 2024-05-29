const request = require('supertest');
const fs = require('fs');
const app = require('../index');

const dataFilePath = 'data.json';

// Helper function to reset the data.json file before each test
const resetDataFile = () => {
    const initialData = {
        products: [
            { id: 1, name: 'Product 1' },
            { id: 2, name: 'Product 2' },
            { id: 3, name: 'Product 3' }
        ],
        cart: []
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
};

beforeEach(() => {
    resetDataFile();
});

describe('ShopEasy API', () => {
    describe('GET /products', () => {
        it('should get all products', async () => {
            const res = await request(app).get('/products');
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(3);
        });
    });

    describe('POST /cart', () => {
        it('should add a product to the cart', async () => {
            const res = await request(app)
                .post('/cart')
                .send({ productId: 1, quantity: 2 });
            expect(res.status).toBe(200);
            expect(res.text).toBe('Product added to cart');

            const data = JSON.parse(fs.readFileSync(dataFilePath));
            expect(data.cart).toEqual(expect.arrayContaining([{ productId: 1, quantity: 2 }]));
        });

        it('should return 404 if product not found', async () => {
            const res = await request(app)
                .post('/cart')
                .send({ productId: 999, quantity: 1 });
            expect(res.status).toBe(404);
            expect(res.text).toBe('Product not found');
        });
    });

    describe('GET /cart', () => {
        it('should get all items in the cart', async () => {
            await request(app)
                .post('/cart')
                .send({ productId: 1, quantity: 2 });

            const res = await request(app).get('/cart');
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toEqual(
                expect.objectContaining({
                    productId: 1,
                    name: 'Product 1',
                    quantity: 2,
                })
            );
        });
    });

    describe('DELETE /cart/:productId', () => {
        it('should decrement the quantity of a product in the cart', async () => {
            await request(app)
                .post('/cart')
                .send({ productId: 1, quantity: 2 });

            const res = await request(app).delete('/cart/1');
            expect(res.status).toBe(200);
            expect(res.text).toBe('Product quantity decremented');

            const data = JSON.parse(fs.readFileSync(dataFilePath));
            expect(data.cart).toEqual(expect.arrayContaining([{ productId: 1, quantity: 1 }]));
        });

        it('should remove the product from the cart if quantity is 0', async () => {
            await request(app)
                .post('/cart')
                .send({ productId: 1, quantity: 1 });

            const res = await request(app).delete('/cart/1');
            expect(res.status).toBe(200);
            expect(res.text).toBe('Product removed from cart');

            const data = JSON.parse(fs.readFileSync(dataFilePath));
            expect(data.cart).not.toEqual(expect.arrayContaining([{ productId: 1 }]));
        });

        it('should return 404 if product not found in cart', async () => {
            const res = await request(app).delete('/cart/999');
            expect(res.status).toBe(404);
            expect(res.text).toBe('Product not found in cart');
        });
    });
});

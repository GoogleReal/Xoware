const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/stripe', async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PayPal integration (use PayPal SDK)
const paypal = require('@paypal/checkout-server-sdk');
const payPalClient = require('../config/paypal'); // setup PayPal environment in config/paypal.js

router.post('/paypal', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: req.body.amount } }],
    });

    try {
        const order = await payPalClient.execute(request);
        res.json({ id: order.result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

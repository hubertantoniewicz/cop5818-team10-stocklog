const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/securities - list all tickers with their current price
router.get('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// POST /api/securities - add a new ticker
router.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// PUT /api/securities/:ticker - update the current price of a ticker
router.put('/:ticker', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;

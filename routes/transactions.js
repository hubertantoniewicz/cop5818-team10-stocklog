const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/transactions - list all transactions, newest first
router.get('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// POST /api/transactions - record a BUY or SELL
router.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;

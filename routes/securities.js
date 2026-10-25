const express = require('express');
const db = require('../db/database');

const router = express.Router();

function toSecurity(row) {
  return { ticker: row.ticker, name: row.name, currentPriceCents: row.current_price_cents };
}

// GET /api/securities - list all tickers with their current price
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM securities ORDER BY ticker').all();
  res.json(rows.map(toSecurity));
});

// POST /api/securities - add a new ticker
router.post('/', (req, res) => {
  const { ticker: rawTicker, name: rawName, currentPriceCents } = req.body || {};
  const ticker = typeof rawTicker === 'string' ? rawTicker.trim().toUpperCase() : '';
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (!/^[A-Z.]{1,10}$/.test(ticker)) {
    return res.status(400).json({ error: 'Ticker must contain 1 to 10 letters or dots.' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Company name must be a non-empty string.' });
  }
  if (!Number.isInteger(currentPriceCents) || currentPriceCents <= 0) {
    return res.status(400).json({ error: 'Current price must be a positive whole number of cents.' });
  }
  try {
    db.prepare('INSERT INTO securities (ticker, name, current_price_cents) VALUES (?, ?, ?)')
      .run(ticker, name, currentPriceCents);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: `${ticker} already exists` });
    }
    throw err;
  }
  res.status(201).json(toSecurity(db.prepare('SELECT * FROM securities WHERE ticker = ?').get(ticker)));
});

// PUT /api/securities/:ticker - update the current price of a ticker
router.put('/:ticker', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;

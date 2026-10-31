const express = require('express');
const db = require('../db/database');

const router = express.Router();

// Turn a database row into the JSON shape the frontend uses
function toTransaction(row) {
  return {
    id: row.id,
    ticker: row.ticker,
    type: row.type,
    tradeDate: row.trade_date,
    shares: row.shares,
    priceCents: row.price_cents,
    account: row.account,
    comment: row.comment || null,
  };
}

// GET /api/transactions - list all transactions, newest first
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY trade_date DESC, id DESC').all();
  res.json(rows.map(toTransaction));
});

// POST /api/transactions - record a BUY or SELL
router.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;

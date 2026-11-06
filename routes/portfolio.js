const express = require('express');
const db = require('../db/database');
const { calculateSummary } = require('../lib/portfolio');

const router = express.Router();

// GET /api/portfolio/summary - holdings, gains, allocation and totals
router.get('/summary', (req, res) => {
  const securities = db.prepare('SELECT * FROM securities').all().map((row) => ({
    ticker: row.ticker,
    name: row.name,
    currentPriceCents: row.current_price_cents,
  }));

  // Oldest first: the average cost depends on the order of the trades
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY trade_date, id').all()
    .map((row) => ({
      ticker: row.ticker,
      type: row.type,
      shares: row.shares,
      priceCents: row.price_cents,
    }));

  res.json(calculateSummary(securities, transactions));
});

module.exports = router;

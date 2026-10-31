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

// Checks the request body in order and returns the first problem found,
// or null when everything is valid. Cleans up ticker, type, account and comment.
function validateTransaction(body) {
  if (typeof body.ticker !== 'string' || !body.ticker.trim()) {
    return 'Ticker is required';
  }
  body.ticker = body.ticker.trim().toUpperCase();
  if (!db.prepare('SELECT 1 FROM securities WHERE ticker = ?').get(body.ticker)) {
    return `Ticker ${body.ticker} not found. Add it on the Prices page first.`;
  }

  body.type = typeof body.type === 'string' ? body.type.trim().toUpperCase() : '';
  if (body.type !== 'BUY' && body.type !== 'SELL') {
    return 'Type must be BUY or SELL';
  }

  const { tradeDate, shares, priceCents } = body;
  if (typeof tradeDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tradeDate) || isNaN(new Date(tradeDate))) {
    return 'Trade date must be a real date in YYYY-MM-DD format';
  }
  if (!Number.isInteger(shares) || shares <= 0) {
    return 'Shares must be a whole number above 0';
  }
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    return 'Price must be a whole number of cents above 0';
  }

  body.account = typeof body.account === 'string' ? body.account.trim() : '';
  if (!body.account) {
    return 'Account is required';
  }

  if (body.comment !== undefined && body.comment !== null && typeof body.comment !== 'string') {
    return 'Comment must be text';
  }
  body.comment = typeof body.comment === 'string' && body.comment.trim() ? body.comment.trim() : null;
  if (body.comment && body.comment.length > 500) {
    return 'Comment must be 500 characters or fewer';
  }

  return null;
}

// GET /api/transactions - list all transactions, newest first
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY trade_date DESC, id DESC').all();
  res.json(rows.map(toTransaction));
});

// POST /api/transactions - record a BUY or SELL
router.post('/', (req, res) => {
  const body = { ...(req.body || {}) };
  const error = validateTransaction(body);
  if (error) {
    // An unknown ticker is "not found"; every other problem is bad input
    const status = error.includes('not found') ? 404 : 400;
    return res.status(status).json({ error });
  }

  const { ticker, type, tradeDate, shares, priceCents, account, comment } = body;

  // Sell rule: you can't sell more shares than this account holds
  if (type === 'SELL') {
    const { held } = db.prepare(
      `SELECT COALESCE(SUM(CASE WHEN type = 'BUY' THEN shares ELSE -shares END), 0) AS held
       FROM transactions WHERE ticker = ? AND account = ?`
    ).get(ticker, account);
    if (shares > held) {
      return res.status(400).json({
        error: `Cannot sell ${shares} shares of ${ticker}, only ${held} held in ${account}`,
      });
    }
  }
  const info = db.prepare(
    `INSERT INTO transactions (ticker, type, trade_date, shares, price_cents, account, comment)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(ticker, type, tradeDate, shares, priceCents, account, comment);

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toTransaction(row));
});

module.exports = router;

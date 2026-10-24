const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/portfolio/summary - holdings, gains, allocation and totals
router.get('/summary', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;

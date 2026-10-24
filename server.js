const express = require('express');
const path = require('path');
require('./db/database'); // opens the database and creates the tables

const securitiesRoutes = require('./routes/securities');
const transactionsRoutes = require('./routes/transactions');
const portfolioRoutes = require('./routes/portfolio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/securities', securitiesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Unknown API path
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Bad JSON in the request body, or any other error
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`StockLog running at http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');
require('./db/database'); // opens the database and creates the tables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`StockLog running at http://localhost:${PORT}`);
});

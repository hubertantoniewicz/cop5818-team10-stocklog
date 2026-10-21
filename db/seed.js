// Fills the database with the fictional example from our proposal.
// Run with: npm run db:seed  (this clears any existing data first)
const db = require('./database');

const securities = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 17000 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 42000 },
];

const transactions = [
  { ticker: 'AAPL', type: 'BUY', date: '2026-09-02', shares: 10, price: 15000, account: 'Fidelity', comment: 'Starting position' },
  { ticker: 'AAPL', type: 'BUY', date: '2026-09-15', shares: 5, price: 18000, account: 'Fidelity', comment: 'Bought more before the product event' },
  { ticker: 'AAPL', type: 'SELL', date: '2026-10-01', shares: 5, price: 17500, account: 'Fidelity', comment: 'Taking some profit' },
  { ticker: 'MSFT', type: 'BUY', date: '2026-10-05', shares: 4, price: 40000, account: 'Robinhood', comment: null },
];

db.exec('DELETE FROM transactions; DELETE FROM securities;');

const insertSecurity = db.prepare(
  'INSERT INTO securities (ticker, name, current_price_cents) VALUES (?, ?, ?)'
);
const insertTransaction = db.prepare(
  `INSERT INTO transactions (ticker, type, trade_date, shares, price_cents, account, comment)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

for (const s of securities) {
  insertSecurity.run(s.ticker, s.name, s.price);
}
for (const t of transactions) {
  insertTransaction.run(t.ticker, t.type, t.date, t.shares, t.price, t.account, t.comment);
}

console.log(`Added ${securities.length} securities and ${transactions.length} transactions.`);

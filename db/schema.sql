-- StockLog database schema
-- Money is stored in whole cents, shares as whole numbers.

CREATE TABLE IF NOT EXISTS securities (
  ticker              TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  current_price_cents INTEGER NOT NULL CHECK (current_price_cents > 0)
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker      TEXT NOT NULL REFERENCES securities(ticker),
  type        TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
  trade_date  TEXT NOT NULL,
  shares      INTEGER NOT NULL CHECK (shares > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  account     TEXT NOT NULL,
  comment     TEXT
);

# StockLog

A simple investment portfolio tracker for COP 5818 (Full Stack Development for FinTech), Team 10.

StockLog lets a beginner investor record stock buy and sell transactions and see each
holding's cost basis, market value, and gain or loss in one place.

**Team 10:** Hannah Fish, Michael Azzi, Alexander Hubenthal, Hubert Antoniewicz, Crispen Chachengwa

## The problem

A beginner who buys a few stocks over time often can't tell what they paid per share on
average, or whether a position is up or down. It gets harder when the shares are spread
across a couple of brokerages, because no single app shows everything together.

StockLog keeps all the buys and sells in one place and works out the numbers from them:
shares held, average cost, market value, and unrealized and realized gain. That helps the
user decide whether a position is profitable before selling, and see how much of the
portfolio sits in one stock.

## Features

The essential features we are building:

1. Add tickers and type in their current prices by hand.
2. Record BUY and SELL transactions with an account label (for example Fidelity or
   Robinhood) and an optional comment, such as the reason for the trade. A sell for more
   shares than the account holds is rejected.
3. A holdings view with shares, average cost, market value, and unrealized gain.
4. Realized gain on sales, using the average-cost method.
5. Portfolio totals, allocation %, and the full transaction history.

If we have time after the essentials work and are tested, we may add price refresh from
Yahoo Finance (`yahoo-finance2` package), tax-free vs. taxable account tags, or a simple
what-if price simulation.

Not included: real trading, fractional shares, dividends, stock splits, currencies other
than USD, and login.

## Example

Using made-up data: buy 10 AAPL at $150 and 5 AAPL at $180, then sell 5 AAPL at $175.
Buy 4 MSFT at $400. Current prices are AAPL $170 and MSFT $420.

| Holding | Shares | Avg cost | Cost basis | Market value | Unrealized | Allocation |
|---------|--------|----------|------------|--------------|------------|------------|
| AAPL | 10 | $160.00 | $1,600.00 | $1,700.00 | +$100.00 (+6.25%) | 50.30% |
| MSFT | 4 | $400.00 | $1,600.00 | $1,680.00 | +$80.00 (+5.00%) | 49.70% |
| **Total** | | | **$3,200.00** | **$3,380.00** | **+$180.00 (+5.63%)** | 100% |

The AAPL sale gives a realized gain of +$75.00: $875 in proceeds minus $800 of average
cost (5 shares at $160).

## How it works

- **Frontend:** plain HTML, CSS, and JavaScript. Three pages: Dashboard (totals and
  holdings), Transactions (buy/sell form and history), and Prices (tickers and current
  prices). Each page shows a message while loading, when there is no data, on errors, and
  after a successful action.
- **Backend:** Node.js and Express. A small REST API for securities, transactions, and a
  portfolio summary. The server checks every input and returns 400 for invalid data and
  404 for records that don't exist.
- **Database:** a SQLite file with two tables. `securities` holds the ticker, name, and
  current price. `transactions` holds each buy or sell with its ticker, date, shares,
  price, account, and comment. Holdings are calculated from the transactions, not stored
  separately.

For example, when the user sells 5 AAPL at $175.00, the browser sends
`POST /api/transactions` with a price of 17500 cents. Express checks that the account
holds at least 5 shares, saves the row in SQLite, and the page shows a success message
and reloads the summary.

Money is always stored as whole cents and shares as whole numbers, so there are no
floating point rounding problems. On a partial sale, the cost taken out is rounded to the
nearest cent and the rest stays with the remaining shares, so the totals always add up.

## Team and responsibilities

| Task | Owner | Target |
|------|-------|--------|
| Repo, README, SQLite schema, sample data | Hubert | 2nd half of Oct |
| Securities API (tickers, prices) and Prices screen | Crispen | 2nd half of Oct |
| Transactions API with sell validation | Michael | 2nd half of Oct |
| Transactions screen: form, history, messages | Hannah | 2nd half of Oct |
| Portfolio summary calculations (avg cost, gains, allocation) | Alexander | 1st half of Nov |
| Dashboard screen | Hubert | 1st half of Nov |
| End-to-end testing (one check each, see below) | All | 1st half of Nov |
| Bug fixes, final README, demo prep | All | 2nd half of Nov |

## How we work

- Each task is a GitHub Issue.
- Pull the latest `main` before starting, then work on a short feature branch, for
  example `feature/securities-api`.
- When the change is ready, open a pull request. Another member reviews it before it is
  merged into `main`.
- `node_modules`, the database file, and any credentials stay out of the repository.
- We meet online for 20 minutes once a week and use the group chat for quick questions.

## Getting started

Setup and run steps will be added here as the project skeleton comes together.

## Testing plan

Each member tests a feature that someone else built.

| # | Check | Input or action | Expected result | Owner |
|---|-------|-----------------|-----------------|-------|
| 1 | Financial result | Buy 10 AAPL @ $150 and 5 @ $180; price $170 | 15 shares, avg $160.00, value $2,550.00, unrealized +$150.00 | Hannah |
| 2 | Realized gain | Then sell 5 AAPL @ $175 | Realized +$75.00; 10 shares left; cost basis $1,600.00 | Crispen |
| 3 | Invalid input | Sell 20 AAPL with 15 held; buy at a price of -5 | 400 response with a clear message; no row added | Alexander |
| 4 | Browser to API to DB | Add MSFT @ $420 and buy 4 @ $400 through the UI | Shows in history and on the Dashboard; row saved in SQLite | Michael |
| 5 | Persistence after restart | Restart the server and reload the Dashboard | Same holdings and totals as before | Hubert |

## Known limitations

- Prices are entered by hand, so they are only as current as the last update.
- Only whole shares and USD are supported.
- There is no login; the app is meant for one user running it locally.

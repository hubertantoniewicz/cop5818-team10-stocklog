# End-to-end testing

All features are merged into `main`, so everyone can run their check now. Each person
runs one check from the testing plan in the README and posts the result in issue #3.
This is the last thing we need before the demo.

## Before you start (everyone)

1. Get the latest code and install:

   ```bash
   git checkout main
   git pull
   npm install
   ```

2. Start from an **empty database**. Stop the server if it is running (Ctrl+C), then
   delete the file `data/stocklog.db` (in VS Code or your file explorer, or with
   `rm data/stocklog.db` on Mac). Don't run `npm run db:seed` for checks 1 to 4,
   because the seed data already has the trades you are about to enter.

3. Start the server and open http://localhost:3000:

   ```bash
   npm start
   ```

4. Use these dates so everyone's results match: buys on **2026-09-02** and
   **2026-09-15**, the sell on **2026-10-01**, and MSFT on **2026-10-05**. The account is
   **Fidelity** for AAPL and **Robinhood** for MSFT.

## Hannah: Check 1, Financial result

1. Prices page: add ticker `AAPL`, name `Apple Inc.`, current price `170`.
2. Transactions page: BUY 10 AAPL at `150` on 2026-09-02, account Fidelity.
3. BUY 5 AAPL at `180` on 2026-09-15, account Fidelity.
4. Open the Dashboard.

**Expected:** AAPL shows 15 shares, avg cost $160.00, cost basis $2,400.00, market value
$2,550.00, unrealized +$150.00 (+6.25%).

## Crispen: Check 2, Realized gain

1. Do steps 1 to 3 from Check 1 first (add AAPL, the two buys).
2. Transactions page: SELL 5 AAPL at `175` on 2026-10-01, account Fidelity.
3. Open the Dashboard.

**Expected:** realized gain +$75.00, 10 AAPL shares left, avg cost still $160.00, cost
basis $1,600.00, market value $1,700.00.

## Alexander: Check 3, Invalid input

1. Do steps 1 to 3 from Check 1 first, so Fidelity holds 15 AAPL.
2. Transactions page: try to SELL 20 AAPL at `175` on 2026-10-01, account Fidelity.
   It should show the error *"Cannot sell 20 shares of AAPL, only 15 available in
   Fidelity on 2026-10-01"*.
3. Try a BUY with the price `-5`. The page should show a price error and not save.
4. Send the same bad price straight to the API, so we know the server checks it too:

   ```bash
   curl -i -X POST http://localhost:3000/api/transactions -H "Content-Type: application/json" -d "{\"ticker\":\"AAPL\",\"type\":\"BUY\",\"tradeDate\":\"2026-10-01\",\"shares\":1,\"priceCents\":-500,\"account\":\"Fidelity\"}"
   ```

**Expected:** both bad requests get a `400` with a clear message, and the history still
shows only the 2 buys (no row added).

## Michael: Check 4, Browser to API to DB

1. Prices page: add ticker `MSFT`, name `Microsoft Corp.`, current price `420`.
2. Transactions page: BUY 4 MSFT at `400` on 2026-10-05, account Robinhood.
3. Check the transaction shows in the history table, and that the Dashboard shows MSFT
   with 4 shares, cost basis $1,600.00, market value $1,680.00, unrealized +$80.00
   (+5.00%).
4. Check the row is really in SQLite. Stop the server and run:

   ```bash
   node -e "console.log(require('./db/database').prepare('SELECT * FROM transactions').all())"
   ```

**Expected:** the MSFT buy is in the history, on the Dashboard, and printed from the
database.

## Hubert: Check 5, Persistence after restart

1. Run `npm run db:seed` (this loads the full example from the README), then
   `npm start` and open the Dashboard.
2. Write down the holdings and totals: AAPL 10 shares, MSFT 4 shares, market value
   $3,380.00, unrealized +$180.00 (+5.63%), realized +$75.00.
3. Stop the server with Ctrl+C, start it again with `npm start`, and reload the
   Dashboard.

**Expected:** the same holdings and totals as before the restart.

## Extra checks 6 to 8 (final report)

These cover the remaining categories from the final project rubric. Start each one from an
empty database as described above. The curl commands work in Terminal on Mac, and in
Command Prompt on Windows.

### Check 6, Required field empty

1. Prices page: add `AAPL`, `Apple Inc.`, `170`.
2. Transactions page: BUY 10 AAPL at `150`, leave **Account** empty, and click Save.
   The page should show *"Enter an account name."* and nothing is saved.
3. The server checks it too:

   ```bash
   curl -i -X POST http://localhost:3000/api/transactions -H "Content-Type: application/json" -d "{\"ticker\":\"AAPL\",\"type\":\"BUY\",\"tradeDate\":\"2026-09-02\",\"shares\":10,\"priceCents\":15000,\"account\":\"\"}"
   curl -i -X POST http://localhost:3000/api/securities -H "Content-Type: application/json" -d "{\"ticker\":\"MSFT\",\"name\":\"\",\"currentPriceCents\":42000}"
   ```

**Expected:** `400` "Account is required" and `400` "Company name must be a non-empty
string.", and the history is still empty.

### Check 7, Boundary: selling exactly the shares held

1. Do Check 1 and Check 2 first, so Fidelity holds 10 AAPL.
2. Transactions page: SELL **11** AAPL at `175` on 2026-10-20, account Fidelity.
   Rejected: *"Cannot sell 11 shares of AAPL, only 10 available in Fidelity on 2026-10-20"*.
3. SELL exactly **10** AAPL at `175` on 2026-10-20, account Fidelity. This is accepted,
   because it leaves 0 shares, not a negative number.
4. Try a BUY with the price `0`. Rejected, because prices must be above $0.

**Expected:** AAPL is no longer listed in the holdings, and the total realized gain is
+$225.00 ($75.00 from the first sale plus 10 × ($175 − $160) = $150.00).

### Check 8, Empty result and missing record

1. With an empty database, open the Dashboard. It should show *"No holdings yet. Record
   your first buy on the Transactions page."* and $0.00 totals.
2. Update the price of a ticker that doesn't exist:

   ```bash
   curl -i -X PUT http://localhost:3000/api/securities/ZZZZ -H "Content-Type: application/json" -d "{\"currentPriceCents\":100}"
   ```

**Expected:** `404` "Ticker ZZZZ not found".

## Posting your result

Comment on issue #3 with something like this, and add a screenshot of the Dashboard or
the error message:

```
Check 3 (Invalid input): PASS
- Sell 20 AAPL with 15 held: 400, "Cannot sell 20 shares of AAPL, only 15 available in Fidelity on 2026-10-01"
- Buy at -5: rejected on the page and 400 from the API, no row added
```

If something doesn't match, write FAIL, what you saw, and the steps you took, and post it
in the group chat too so we can fix it before the demo.

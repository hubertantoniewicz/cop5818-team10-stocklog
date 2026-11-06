// Tests for the portfolio summary math. Run with: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateSummary } = require('../lib/portfolio');

const AAPL = { ticker: 'AAPL', name: 'Apple Inc.', currentPriceCents: 17000 };
const MSFT = { ticker: 'MSFT', name: 'Microsoft Corp.', currentPriceCents: 42000 };

function buy(ticker, shares, priceCents) {
  return { ticker, type: 'BUY', shares, priceCents };
}
function sell(ticker, shares, priceCents) {
  return { ticker, type: 'SELL', shares, priceCents };
}

test('README example gives the numbers in the example table', () => {
  const summary = calculateSummary([AAPL, MSFT], [
    buy('AAPL', 10, 15000),
    buy('AAPL', 5, 18000),
    sell('AAPL', 5, 17500),
    buy('MSFT', 4, 40000),
  ]);

  assert.deepEqual(summary, {
    holdings: [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        shares: 10,
        avgCostCents: 16000,
        costBasisCents: 160000,
        currentPriceCents: 17000,
        marketValueCents: 170000,
        unrealizedGainCents: 10000,
        unrealizedGainPct: 6.25,
        realizedGainCents: 7500,
        allocationPct: 50.3,
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        shares: 4,
        avgCostCents: 40000,
        costBasisCents: 160000,
        currentPriceCents: 42000,
        marketValueCents: 168000,
        unrealizedGainCents: 8000,
        unrealizedGainPct: 5,
        realizedGainCents: 0,
        allocationPct: 49.7,
      },
    ],
    totals: {
      costBasisCents: 320000,
      marketValueCents: 338000,
      unrealizedGainCents: 18000,
      unrealizedGainPct: 5.63,
      realizedGainCents: 7500,
    },
  });
});

test('two AAPL buys at a price of $170 (testing-plan check #1)', () => {
  const { holdings } = calculateSummary([AAPL], [
    buy('AAPL', 10, 15000),
    buy('AAPL', 5, 18000),
  ]);

  assert.equal(holdings.length, 1);
  assert.equal(holdings[0].shares, 15);
  assert.equal(holdings[0].avgCostCents, 16000);
  assert.equal(holdings[0].marketValueCents, 255000);
  assert.equal(holdings[0].unrealizedGainCents, 15000);
});

test('uneven partial sale rounds the removed cost and loses no cents', () => {
  const security = { ticker: 'XYZ', name: 'XYZ Corp.', currentPriceCents: 1100 };
  const trades = [buy('XYZ', 1, 1000), buy('XYZ', 2, 1001)]; // 3 shares, cost 3002

  // Sell 1: removed = Math.round(3002 / 3) = 1001, realized = 1100 - 1001 = 99
  trades.push(sell('XYZ', 1, 1100));
  let summary = calculateSummary([security], trades);
  assert.equal(summary.holdings[0].shares, 2);
  assert.equal(summary.holdings[0].costBasisCents, 2001);
  assert.equal(summary.holdings[0].avgCostCents, 1001);
  assert.equal(summary.holdings[0].realizedGainCents, 99);

  // Sell the last 2: removes exactly the 2001 left, so 1001 + 2001 = the 3002 paid
  trades.push(sell('XYZ', 2, 1100));
  summary = calculateSummary([security], trades);
  assert.deepEqual(summary.holdings, []);
  assert.equal(summary.totals.realizedGainCents, 3300 - 3002);
});

test('a ticker sold completely is left out of holdings but its gain is in the totals', () => {
  const summary = calculateSummary([AAPL, MSFT], [
    buy('AAPL', 2, 15000),
    sell('AAPL', 2, 17500),
    buy('MSFT', 1, 40000),
  ]);

  assert.deepEqual(summary.holdings.map((h) => h.ticker), ['MSFT']);
  assert.equal(summary.totals.realizedGainCents, 5000);
  assert.equal(summary.holdings[0].allocationPct, 100);
});

test('no transactions gives an empty portfolio with zeros, not NaN', () => {
  const summary = calculateSummary([AAPL, MSFT], []);

  assert.deepEqual(summary, {
    holdings: [],
    totals: {
      costBasisCents: 0,
      marketValueCents: 0,
      unrealizedGainCents: 0,
      unrealizedGainPct: 0,
      realizedGainCents: 0,
    },
  });
});

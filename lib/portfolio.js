// Portfolio math for GET /api/portfolio/summary.
// No database or Express in here, so the numbers are easy to test.
// Money is always whole cents and shares are whole numbers.

// Goes through the transactions (oldest first) and keeps a running total per
// ticker, using the average-cost method. Accounts are combined, so the same
// ticker in Fidelity and Robinhood is one position.
function buildPositions(transactions) {
  const positions = new Map();

  for (const t of transactions) {
    if (!positions.has(t.ticker)) {
      positions.set(t.ticker, { shares: 0, costCents: 0, realizedGainCents: 0 });
    }
    const position = positions.get(t.ticker);

    if (t.type === 'BUY') {
      position.shares += t.shares;
      position.costCents += t.shares * t.priceCents;
    } else if (t.type === 'SELL') {
      // Take out the sold shares' part of the cost, rounded to the nearest cent.
      // Whatever is left stays with the remaining shares, so no cent is lost.
      const removedCents = Math.round(position.costCents * t.shares / position.shares);
      position.realizedGainCents += t.shares * t.priceCents - removedCents;
      position.costCents -= removedCents;
      position.shares -= t.shares;
    }
  }

  return positions;
}

// securities:   [{ ticker, name, currentPriceCents }]
// transactions: [{ ticker, type, shares, priceCents }], oldest first
function calculateSummary(securities, transactions) {
  const securitiesByTicker = new Map(securities.map((s) => [s.ticker, s]));
  const positions = buildPositions(transactions);

  const holdings = [];
  for (const [ticker, position] of positions) {
    // Sold out completely: not a holding any more
    if (position.shares <= 0) continue;

    const security = securitiesByTicker.get(ticker);
    const marketValueCents = position.shares * security.currentPriceCents;
    const unrealizedGainCents = marketValueCents - position.costCents;

    holdings.push({
      ticker,
      name: security.name,
      shares: position.shares,
      avgCostCents: Math.round(position.costCents / position.shares),
      costBasisCents: position.costCents,
      currentPriceCents: security.currentPriceCents,
      marketValueCents,
      unrealizedGainCents,
      unrealizedGainPct: Math.round(unrealizedGainCents / position.costCents * 10000) / 100,
      realizedGainCents: position.realizedGainCents,
    });
  }

  return { holdings };
}

module.exports = { calculateSummary };

// Dashboard page: totals and holdings table

function gainClass(cents) {
  if (cents > 0) return 'gain';
  if (cents < 0) return 'loss';
  return '';
}

// 6.25 -> "+6.25%"
function formatPct(pct) {
  return (pct > 0 ? '+' : '') + pct.toFixed(2) + '%';
}

function renderTotals(totals) {
  const cards = [
    { label: 'Market value', value: formatCents(totals.marketValueCents) },
    { label: 'Cost basis', value: formatCents(totals.costBasisCents) },
    {
      label: 'Unrealized gain',
      value: `${formatGain(totals.unrealizedGainCents)} (${formatPct(totals.unrealizedGainPct)})`,
      className: gainClass(totals.unrealizedGainCents),
    },
    {
      label: 'Realized gain',
      value: formatGain(totals.realizedGainCents),
      className: gainClass(totals.realizedGainCents),
    },
  ];

  const section = document.getElementById('totals');
  section.textContent = '';
  for (const card of cards) {
    const div = document.createElement('div');
    div.className = 'card';
    const label = document.createElement('span');
    label.className = 'card-label';
    label.textContent = card.label;
    const value = document.createElement('span');
    value.className = 'card-value ' + (card.className || '');
    value.textContent = card.value;
    div.append(label, value);
    section.append(div);
  }
}

// Same columns as the example table in the README, plus realized gain
function renderHoldings(holdings) {
  const section = document.getElementById('holdings');
  section.textContent = '';
  if (holdings.length === 0) return;

  const heading = document.createElement('h2');
  heading.textContent = 'Holdings';
  const table = document.createElement('table');
  const head = table.createTHead().insertRow();
  const columns = ['Holding', 'Shares', 'Avg cost', 'Cost basis', 'Market value', 'Unrealized', 'Realized', 'Allocation'];
  for (const title of columns) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = title;
    if (title !== 'Holding') th.className = 'number';
    head.append(th);
  }

  const body = table.createTBody();
  for (const h of holdings) {
    const row = body.insertRow();
    const holding = row.insertCell();
    holding.textContent = h.ticker;
    holding.title = h.name;

    const cells = [
      { text: String(h.shares) },
      { text: formatCents(h.avgCostCents) },
      { text: formatCents(h.costBasisCents) },
      { text: formatCents(h.marketValueCents) },
      {
        text: `${formatGain(h.unrealizedGainCents)} (${formatPct(h.unrealizedGainPct)})`,
        className: gainClass(h.unrealizedGainCents),
      },
      { text: formatGain(h.realizedGainCents), className: gainClass(h.realizedGainCents) },
      { text: h.allocationPct.toFixed(2) + '%' },
    ];
    for (const cell of cells) {
      const td = row.insertCell();
      td.className = 'number ' + (cell.className || '');
      td.textContent = cell.text;
    }
  }

  section.append(heading, table);
}

async function loadSummary() {
  showMessage('Loading portfolio…');
  try {
    const summary = await api('GET', '/api/portfolio/summary');
    if (summary.holdings.length === 0) {
      showMessage('No holdings yet. Record your first buy on the Transactions page.');
    } else {
      clearMessage();
    }
    renderTotals(summary.totals);
    renderHoldings(summary.holdings);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

loadSummary();

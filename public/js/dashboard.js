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
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

loadSummary();

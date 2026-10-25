// Dashboard page: totals and holdings table

async function loadSummary() {
  showMessage('Loading portfolio…');
  try {
    const summary = await api('GET', '/api/portfolio/summary');
    if (summary.holdings.length === 0) {
      showMessage('No holdings yet. Record your first buy on the Transactions page.');
    } else {
      clearMessage();
    }
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

loadSummary();

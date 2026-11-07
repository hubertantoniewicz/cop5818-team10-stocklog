// Transactions page: transaction history.
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const historyContent = byId('history-content');

  function renderHistory(transactions) {
    historyContent.replaceChildren();

    if (transactions.length === 0) {
      historyContent.textContent =
        'No transactions yet. Record your first buy above.';
      return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headings = [
      'Date',
      'Type',
      'Ticker',
      'Shares',
      'Price',
      'Total',
      'Account',
      'Comment'
    ];

    headings.forEach(heading => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = heading;
      headerRow.append(th);
    });

    thead.append(headerRow);
    table.append(thead);

    const tbody = document.createElement('tbody');

    const sorted = [...transactions].sort((a, b) => {
      return (
        b.tradeDate.localeCompare(a.tradeDate) ||
        Number(b.id) - Number(a.id)
      );
    });

    sorted.forEach(transaction => {
      const row = document.createElement('tr');

      const values = [
        transaction.tradeDate,
        transaction.type,
        transaction.ticker,
        transaction.shares,
        formatCents(transaction.priceCents),
        formatCents(transaction.shares * transaction.priceCents),
        transaction.account,
        transaction.comment || ''
      ];

      values.forEach((value, index) => {
        const td = document.createElement('td');
        td.textContent = String(value);

        if ([3, 4, 5].includes(index)) {
          td.className = 'number';
        }

        if (index === 1) {
          td.className =
            transaction.type === 'BUY' ? 'gain' : 'loss';
        }

        row.append(td);
      });

      tbody.append(row);
    });

    table.append(tbody);
    historyContent.append(table);
  }

  async function loadHistory() {
    historyContent.textContent = 'Loading transactions…';

    try {
      const transactions = await api('GET', '/api/transactions');
      renderHistory(transactions);
    } catch (error) {
      historyContent.textContent = error.message;
    }
  }

  loadHistory();
})();

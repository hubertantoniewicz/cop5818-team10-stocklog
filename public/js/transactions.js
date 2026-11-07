// Transactions page: history and form setup.
(() => {
  'use strict';

  const byId = id => document.getElementById(id);

  const historyContent = byId('history-content');
  const form = byId('transaction-form');
  const fields = byId('transaction-fields');
  const saveButton = byId('save-transaction');

  // Default the date to today using the local calendar date.
  const today = new Date();

  byId('trade-date').value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

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

  function updateAccountSuggestions(transactions) {
    const accounts = [
      ...new Set(
        transactions
          .map(transaction => transaction.account)
          .filter(Boolean)
      )
    ].sort();

    const options = accounts.map(account => {
      const option = document.createElement('option');
      option.value = account;
      return option;
    });

    byId('account-names').replaceChildren(...options);
  }

  async function loadHistory() {
    historyContent.textContent = 'Loading transactions…';

    try {
      const transactions = await api('GET', '/api/transactions');

      renderHistory(transactions);
      updateAccountSuggestions(transactions);
    } catch (error) {
      historyContent.textContent = error.message;
    }
  }

  async function loadSecurities() {
    const status = byId('ticker-status');

    fields.disabled = true;
    status.textContent = 'Loading tickers…';

    try {
      const securities = await api('GET', '/api/securities');

      const options = securities.map(security => {
        const option = document.createElement('option');
        option.value = security.ticker;

        option.textContent = security.name
          ? `${security.ticker} — ${security.name}`
          : security.ticker;

        return option;
      });

      byId('ticker').replaceChildren(...options);

      if (securities.length === 0) {
        status.textContent =
          'Add a ticker on the Prices page first. ';

        const link = document.createElement('a');
        link.href = 'prices.html';
        link.textContent = 'Go to Prices';

        status.append(link);
        return;
      }

      status.textContent = '';
      fields.disabled = false;
    } catch (error) {
      status.textContent = error.message;
    }
  }

  let saving = false;

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (saving || fields.disabled) {
      return;
    }

    clearMessage();

    const ticker = byId('ticker').value;
    const type = byId('trade-type').value;
    const tradeDate = byId('trade-date').value;
    const shares = Number(byId('shares').value);
    const priceCents = dollarsToCents(byId('price').value);
    const account = byId('account').value.trim();
    const comment = byId('comment').value.trim();

    if (
      !ticker ||
      !['BUY', 'SELL'].includes(type) ||
      !tradeDate ||
      !byId('trade-date').validity.valid
    ) {
      showMessage(
        'Choose a ticker, transaction type, and valid date.',
        'error'
      );
      return;
    }

    if (!Number.isSafeInteger(shares) || shares <= 0) {
      showMessage(
        'Shares must be a whole number above 0.',
        'error'
      );
      return;
    }

    if (!Number.isSafeInteger(priceCents) || priceCents <= 0) {
      showMessage(
        'Enter a price above $0 with no more than two decimal places.',
        'error'
      );
      return;
    }

    if (!Number.isSafeInteger(shares * priceCents)) {
      showMessage(
        'The transaction total is too large. Enter smaller values.',
        'error'
      );
      return;
    }

    if (!account) {
      showMessage('Enter an account name.', 'error');
      return;
    }

    const transaction = {
      ticker,
      type,
      tradeDate,
      shares,
      priceCents,
      account,
      comment
    };

    saving = true;
    fields.disabled = true;
    saveButton.textContent = 'Saving…';
    showMessage('Saving…', 'info');

    try {
      await api('POST', '/api/transactions', transaction);

      showMessage(
        `Saved: ${type} ${shares} ${ticker} @ ${formatCents(priceCents)} in ${account}.`,
        'success'
      );

      byId('shares').value = '';
      byId('price').value = '';
      byId('comment').value = '';

      await loadHistory();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      saving = false;
      fields.disabled = false;
      saveButton.textContent = 'Save transaction';
    }
  });

  // STARTUP
  loadHistory();
  loadSecurities();
})();

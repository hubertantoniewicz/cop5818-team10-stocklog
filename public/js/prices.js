// All security data is rendered as text, never as HTML.
async function loadPrices(successMessage = '') {
  const section = document.getElementById('price-list');
  showMessage('Loading prices…');
  section.replaceChildren();
  section.setAttribute('aria-busy', 'true');
  try {
    const securities = await api('GET', '/api/securities');
    if (securities.length === 0) {
      showMessage('No tickers yet. Add one above.');
      return;
    }
    const heading = document.createElement('h2');
    heading.textContent = 'Current prices';
    const table = document.createElement('table');
    const head = table.createTHead().insertRow();
    for (const title of ['Ticker', 'Name', 'Current price', 'New price']) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = title;
      if (title === 'Current price') th.className = 'number';
      head.append(th);
    }
    const body = table.createTBody();
    for (const security of securities) {
      const row = body.insertRow();
      row.insertCell().textContent = security.ticker;
      row.insertCell().textContent = security.name;
      const price = row.insertCell();
      price.className = 'number';
      price.textContent = formatCents(security.currentPriceCents);
      const actions = row.insertCell();
      const form = document.createElement('form');
      const label = document.createElement('label');
      label.textContent = 'New price ($)';
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.required = true;
      input.setAttribute('aria-label', `New price for ${security.ticker} ($)`);
      label.append(input);
      const button = document.createElement('button');
      button.type = 'submit';
      button.textContent = 'Update';
      form.append(label, button);
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const currentPriceCents = dollarsToCents(input.value);
        if (currentPriceCents === null || !Number.isInteger(currentPriceCents) || currentPriceCents <= 0) {
          showMessage('Enter a positive price with no more than two decimal places.', 'error');
          return;
        }
        button.disabled = true;
        try {
          const updated = await api('PUT', `/api/securities/${encodeURIComponent(security.ticker)}`, { currentPriceCents });
          await loadPrices(`${updated.ticker} price updated to ${formatCents(updated.currentPriceCents)}.`);
        } catch (err) {
          showMessage(err.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
      actions.append(form);
    }
    section.append(heading, table);
    if (successMessage) showMessage(successMessage, 'success');
    else clearMessage();
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    section.setAttribute('aria-busy', 'false');
  }
}

document.getElementById('add-security-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const currentPriceCents = dollarsToCents(form.elements.price.value);
  if (currentPriceCents === null || !Number.isInteger(currentPriceCents) || currentPriceCents <= 0) {
    showMessage('Enter a positive price with no more than two decimal places.', 'error');
    return;
  }
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    const security = await api('POST', '/api/securities', {
      ticker: form.elements.ticker.value,
      name: form.elements.name.value,
      currentPriceCents
    });
    form.reset();
    await loadPrices(`${security.ticker} added.`);
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    button.disabled = false;
  }
});

loadPrices();

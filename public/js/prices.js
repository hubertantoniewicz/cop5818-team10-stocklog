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
    for (const title of ['Ticker', 'Name', 'Current price']) {
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

loadPrices();

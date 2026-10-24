// Shared helpers used by every page.

// Calls the API and returns the JSON body.
// Throws an Error with the server's message if the request fails.
async function api(method, path, body) {
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data && data.error ? data.error : 'Request failed');
  }
  return data;
}

// 160000 -> "$1,600.00", -500 -> "-$5.00"
function formatCents(cents) {
  const dollars = Math.abs(cents) / 100;
  const text = dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return cents < 0 ? '-' + text : text;
}

// Same as formatCents but always shows the sign, for gains: "+$75.00"
function formatGain(cents) {
  return cents > 0 ? '+' + formatCents(cents) : formatCents(cents);
}

// "175.00" or "175" -> 17500. Returns null if it is not a valid amount.
function dollarsToCents(text) {
  const value = String(text).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return null;
  }
  return Math.round(parseFloat(value) * 100);
}

// Shows a message at the top of the page.
// type is 'info' (loading / empty), 'error' or 'success'.
function showMessage(text, type = 'info') {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = 'message ' + type;
}

function clearMessage() {
  showMessage('');
}

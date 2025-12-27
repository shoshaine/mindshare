/*
  wallet-connect.js
  - Waits for a Solana provider to be injected (polling briefly)
  - Hooks buttons with class "connect-wallet" to call provider.connect()
  - On success stores the public key in localStorage and redirects to index2.html
  - Adds a small helper to attempt automatic redirect if already connected
*/

function waitForProvider(timeout = 5000) {
  return new Promise((resolve) => {
    if (window.solana) return resolve(window.solana);
    const interval = 100;
    let waited = 0;
    const id = setInterval(() => {
      if (window.solana) {
        clearInterval(id);
        return resolve(window.solana);
      }
      waited += interval;
      if (waited >= timeout) {
        clearInterval(id);
        return resolve(null);
      }
    }, interval);
  });
}

async function connectWalletAndRedirect() {
  try {
    const provider = await waitForProvider(5000);
    if (!provider) {
      alert('No Solana wallet detected. Install Phantom or a compatible wallet and try again.');
      return;
    }

    // If already connected (trusted connection) - skip explicit connect
    if (provider.isConnected && provider.publicKey) {
      localStorage.setItem('solanaPublicKey', provider.publicKey.toString());
      window.location.href = 'index2.html';
      return;
    }

    // Attempt to connect
    const resp = await provider.connect();
    const pub = (resp && resp.publicKey) ? resp.publicKey.toString() : (provider.publicKey ? provider.publicKey.toString() : null);
    if (pub) {
      localStorage.setItem('solanaPublicKey', pub);
      // small delay to ensure storage is flushed in some browsers
      setTimeout(() => window.location.href = 'index2.html', 50);
      // hide connect buttons in case scripts remain
      if (window._hideConnectButtons) window._hideConnectButtons();
      return;
    }

    alert('Connected but could not obtain public key.');
  } catch (err) {
    console.error('Wallet connect error', err);
    const msg = err && err.message ? err.message : String(err);
    alert('Wallet connection failed: ' + msg);
  }
}

function attachButtonHandlers() {
  const buttons = document.querySelectorAll('.connect-wallet');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      connectWalletAndRedirect();
    });
  });
}

// On page load attach handlers and attempt auto-redirect if already connected
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    attachButtonHandlers();
    const provider = await waitForProvider(2000);
    if (provider && (provider.isConnected || provider.publicKey)) {
      // Persist public key for later use but do NOT auto-redirect from the first page.
      localStorage.setItem('solanaPublicKey', provider.publicKey ? provider.publicKey.toString() : localStorage.getItem('solanaPublicKey'));
    }
  });
} else {
  attachButtonHandlers();
}

// Expose for debugging
window._connectWalletAndRedirect = connectWalletAndRedirect;
// helper to hide connect buttons when connected
window._hideConnectButtons = function() {
  try {
    const pub = localStorage.getItem('solanaPublicKey');
    const provider = window.solana || null;
    const connected = Boolean(pub) || (provider && (provider.isConnected || provider.publicKey));
    const buttons = document.querySelectorAll('.connect-wallet');

    // Only hide connect buttons when on the second page (index2.html).
    const path = window.location.pathname || window.location.href;
    const isSecondPage = path.indexOf('index2.html') !== -1 || path.endsWith('/index2.html');

    buttons.forEach(b => {
      if (connected && isSecondPage) b.style.display = 'none';
      else b.style.display = '';
    });
  } catch (e) {
    console.warn('hideConnectButtons failed', e);
  }
};

// run on load
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window._hideConnectButtons); else window._hideConnectButtons();

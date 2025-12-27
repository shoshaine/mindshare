/* wallet-adapter-cdn.js
   Defensive CDN adapter loader:
   - Detects global adapter constructors exported by the IIFE/UMD bundles
   - Tries Phantom and Solflare adapters if available, then falls back to window.solana
   - Hooks elements with class .connect-wallet
*/

function resolveGlobal(path) {
  // path like 'walletAdapterPhantom.PhantomWalletAdapter' or 'PhantomWalletAdapter'
  try {
    return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : null, window);
  } catch (e) {
    return null;
  }
}

function findAdapterConstructors() {
  const phantomCandidates = [
    'PhantomWalletAdapter',
    'walletAdapterPhantom.PhantomWalletAdapter',
    'walletAdapterPhantom',
    '@solana/wallet-adapter-phantom.PhantomWalletAdapter'
  ];
  const solflareCandidates = [
    'SolflareWalletAdapter',
    'walletAdapterSolflare.SolflareWalletAdapter',
    'walletAdapterSolflare',
    '@solana/wallet-adapter-solflare.SolflareWalletAdapter'
  ];

  const phantom = phantomCandidates.map(resolveGlobal).find(x => x);
  const solflare = solflareCandidates.map(resolveGlobal).find(x => x);

  return { phantom, solflare };
}

async function tryConnectWithAdapters(adapters) {
  for (const adapter of adapters) {
    if (!adapter) continue;
    try {
      // If adapter is a constructor, instantiate it
      const instance = (typeof adapter === 'function') ? new adapter() : adapter;
      if (instance && typeof instance.connect === 'function') {
        await instance.connect();
        const pub = (instance.publicKey && instance.publicKey.toString) ? instance.publicKey.toString() : (instance.publicKey || null);
        if (pub) return pub;
      }
    } catch (e) {
      console.warn('Adapter connect failed (continuing):', e && e.message ? e.message : e);
      // continue to next
    }
  }
  return null;
}

async function connectViaCdnAdapters() {
  const { phantom, solflare } = findAdapterConstructors();
  const adapters = [];
  if (phantom) adapters.push(phantom);
  if (solflare) adapters.push(solflare);

  // Try adapters first
  const pub = await tryConnectWithAdapters(adapters);
  if (pub) {
    localStorage.setItem('solanaPublicKey', pub);
    setTimeout(() => (window.location.href = 'index2.html'), 50);
    return true;
  }

  // notify page scripts to hide connect UI
  if (window._hideConnectButtons) window._hideConnectButtons();

  // fallback to injected provider (Phantom classic)
  try {
    if (window.solana) {
      const resp = await window.solana.connect();
      const pub2 = resp && resp.publicKey && resp.publicKey.toString ? resp.publicKey.toString() : (window.solana.publicKey ? window.solana.publicKey.toString() : null);
      if (pub2) {
        localStorage.setItem('solanaPublicKey', pub2);
        setTimeout(() => (window.location.href = 'index2.html'), 50);
        return true;
      }
    }
  } catch (e) {
    console.warn('Injected provider connect failed', e && e.message ? e.message : e);
  }

  alert('No wallet connected. Install Phantom or Solflare or use a supported browser extension.');
  return false;
}

function attachButtons() {
  const buttons = document.querySelectorAll('.connect-wallet');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const original = btn.textContent;
      try {
        btn.textContent = 'Connecting...';
        btn.disabled = true;
        await connectViaCdnAdapters();
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => attachButtons());
} else {
  attachButtons();
}

// expose for debugging
window._cdnConnect = connectViaCdnAdapters;

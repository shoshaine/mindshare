// wallet-adapter-init.js
// This file uses the official @solana/wallet-adapter packages (bundled by esbuild)
// It attempts to connect using popular adapters (Phantom, Solflare) and redirects to index2.html

import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Build an ordered list of adapters to try. You can add more adapters here later.
const adapters = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter()
];

async function tryConnectAdapter(adapter) {
  try {
    if (!adapter) return null;
    // adapter.ready may be a boolean or string depending on adapter/version
    const isReady = typeof adapter.ready === 'boolean' ? adapter.ready : Boolean(adapter.ready);
    if (!isReady && adapter.name !== 'Phantom') {
      // Some adapters expose readiness differently; try anyway
    }
    await adapter.connect();
    const pub = adapter.publicKey ? adapter.publicKey.toString() : null;
    if (pub) return { adapter, publicKey: pub };
  } catch (e) {
    // adapter.connect() will throw if user rejects or not available; ignore and continue
    console.warn('adapter connect failed', adapter && adapter.name, e?.message || e);
  }
  return null;
}

async function connectWithAdapters() {
  for (const adapter of adapters) {
    // attempt
    const res = await tryConnectAdapter(adapter);
    if (res && res.publicKey) {
      localStorage.setItem('solanaPublicKey', res.publicKey);
      // short delay to ensure storage flush
      setTimeout(() => (window.location.href = 'index2.html'), 50);
      return res.publicKey;
    }
  }
  // if none succeeded, open the Phantom provider if available as fallback
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      const pub = resp?.publicKey?.toString() || (window.solana.publicKey ? window.solana.publicKey.toString() : null);
      if (pub) {
        localStorage.setItem('solanaPublicKey', pub);
        setTimeout(() => (window.location.href = 'index2.html'), 50);
        return pub;
      }
    } catch (e) {
      console.warn('fallback window.solana connect failed', e?.message || e);
    }
  }

  alert('No supported wallet was available or connection was rejected. Please install Phantom or another Solana wallet.');
  return null;
}

function attachAdapterButtons() {
  const buttons = document.querySelectorAll('.connect-wallet');
  buttons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Provide a small UI cue
      btn.textContent = 'Connecting...';
      btn.disabled = true;
      try {
        await connectWithAdapters();
      } finally {
        btn.disabled = false;
        btn.textContent = 'Connect wallet';
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => attachAdapterButtons());
} else {
  attachAdapterButtons();
}

// expose for debugging
window._walletAdapterConnect = connectWithAdapters;

export { connectWithAdapters };

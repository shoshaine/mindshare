document.addEventListener('DOMContentLoaded', async () => {
  const pub = localStorage.getItem('solanaPublicKey');
  const provider = window.solana || null;

  // If a wallet is connected, hide any Connect UI on this page
  try {
    const shouldHide = Boolean(pub) || (provider && (provider.isConnected || provider.publicKey));
    if (shouldHide) {
      // common connect button class
      document.querySelectorAll('.connect-wallet').forEach(el => el.style.display = 'none');
      // tilda header connect block id used on both pages
      const headerConnect = document.getElementById('style-VBSH6');
      if (headerConnect) headerConnect.style.display = 'none';
      // hide elements by data-elem-id if present
      document.querySelectorAll('[data-elem-id="1758110169972"]').forEach(el => el.style.display = 'none');
    }
  } catch (e) {
    console.warn('Failed to hide connect UI', e);
  }

  const banner = document.createElement('div');
  banner.style.position = 'fixed';
  banner.style.right = '12px';
  banner.style.top = '12px';
  banner.style.zIndex = '9999';
  banner.style.background = 'rgba(20,20,20,0.85)';
  banner.style.color = '#fff';
  banner.style.padding = '8px 12px';
  banner.style.borderRadius = '8px';
  banner.style.fontFamily = 'Courier New, Arial, sans-serif';
  banner.style.fontSize = '13px';
  banner.style.display = 'flex';
  banner.style.alignItems = 'center';
  banner.style.gap = '8px';

  if (pub) {
    const short = pub.slice(0, 4) + '...' + pub.slice(-4);
    const span = document.createElement('span');
    span.textContent = short;
    span.title = pub;

    const btn = document.createElement('button');
    btn.textContent = 'Disconnect';
    btn.style.background = '#4c7717';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.padding = '6px 8px';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';

    btn.addEventListener('click', async () => {
      try {
        if (provider && provider.disconnect) await provider.disconnect();
      } catch (e) {
        console.warn('Provider disconnect failed', e);
      }
      localStorage.removeItem('solanaPublicKey');
      // return to start
      window.location.href = 'index.html';
    });

    banner.appendChild(span);
    banner.appendChild(btn);
  } else {
    const span = document.createElement('span');
    span.textContent = 'No wallet connected';
    banner.appendChild(span);

    const btn = document.createElement('button');
    btn.textContent = 'Connect';
    btn.style.background = '#4c7717';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.padding = '6px 8px';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => window.location.href = 'index.html');
    banner.appendChild(btn);
  }

  document.body.appendChild(banner);
});

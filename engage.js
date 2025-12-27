document.addEventListener('DOMContentLoaded', function () {
  // prefer the real Tilda container class if present, fall back to the exported id
  const inPlace = document.querySelector('.t39-pxe.tn-kdm.style-ZiVCx') || document.getElementById('style-q7ez3');
  const nextBtn = document.getElementById('style-XEi3X');
  if (!inPlace) return;

  // ensure container can host an absolutely-positioned overlay without changing
  // the original content or background. Keep original layout intact; only set
  // position to relative so the overlay can be placed on top.
  if (!inPlace.style.position || inPlace.style.position === '' ) {
    inPlace.style.position = 'relative';
  }

  // Use live Twitter widgets inserted into the tn-ypq div. Each entry is a blockquote that
  // Twitter's widgets.js will convert to an iframe. This keeps the widget inside the
  // `#style-q7ez3` container; CSS will size it to 90% width and 70% height of that container.
  const tweets = [
    `
    <blockquote class="twitter-tweet" data-theme="dark"><p lang="en" dir="ltr">guys when ur deploying coins make sure to add “this narrative is INSANE” to ur tweets it’s actually really helpful so i know which coin is good or not instantly</p>&mdash; casino (@casino616) <a href="https://twitter.com/casino616/status/1985572279292739835?ref_src=twsrc%5Etfw">November 4, 2025</a></blockquote>
    `,
    `
    <blockquote class="twitter-tweet" data-theme="dark"><p lang="en" dir="ltr">How can you lose if you started from nothing?</p>&mdash; OTTA 💰 (@ottabag) <a href="https://twitter.com/ottabag/status/1985449238285992278?ref_src=twsrc%5Etfw">November 3, 2025</a></blockquote>
    `
  ];

  let idx = 0;

  // Load widgets.js (once) and then render the in-place block so widgets convert blockquotes -> iframes
  function loadWidgetsThenRender(el) {
    if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') {
      try { window.twttr.widgets.load(el); } catch (e) {}
      return;
    }
    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      s.charset = 'utf-8';
      s.onload = () => { try { window.twttr && window.twttr.widgets && window.twttr.widgets.load(el); } catch(e){} };
      document.head.appendChild(s);
    } else {
      // if script is present but twttr not ready yet
      setTimeout(() => { try { window.twttr && window.twttr.widgets && window.twttr.widgets.load(el); } catch(e){} }, 250);
    }
  }

  function render() {
    // Create or update an overlay div so we don't wipe out the original
    // container contents (background, decorative layers). The overlay sits
    // on top of the container and holds the injected blockquote/iframe.
    let overlay = inPlace.querySelector('.engage-embed-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'engage-embed-overlay';
      Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pointerEvents: 'auto',
        zIndex: '10'
      });
      inPlace.appendChild(overlay);
    }

    overlay.innerHTML = tweets[idx] || '';
    // Call widgets loader to transform the blockquote into the live widget
    loadWidgetsThenRender(overlay);

    // After widgets convert the blockquote into an iframe, force the iframe size
    // to be 90% width and 70% height of the overlay so it appears as a second
    // layer on top of the original div content.
    setTimeout(() => {
      try {
        const iframe = overlay.querySelector('iframe');
        const tweet = overlay.querySelector('.twitter-tweet');
        if (iframe) {
          iframe.style.width = '90%';
          iframe.style.height = '100%';
          iframe.style.maxWidth = 'none';
          iframe.style.boxSizing = 'border-box';
          iframe.style.margin = '0';
          iframe.style.padding = '0';
          // make iframe visually on top and allow interaction
          iframe.style.position = 'relative';
          iframe.style.zIndex = '11';
        } else if (tweet) {
          tweet.style.width = '90%';
          tweet.style.height = '100%';
        }
      } catch (e) { /* ignore styling errors */ }
    }, 800);
  }
  // initial render will populate the in-place block

  if (nextBtn) {
    nextBtn.style.cursor = 'pointer';
    nextBtn.addEventListener('click', function (e) {
      e.preventDefault();
      idx = (idx + 1) % tweets.length;
      render();
    });
  }

  render();
});

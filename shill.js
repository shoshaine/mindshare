document.addEventListener('DOMContentLoaded', function () {
  const textarea = document.getElementById('style-SSZSa');
  if (!textarea) return;

  // Labels (these match the existing exported IDs)
  const mustLabelContainer = document.getElementById('style-1wIhX'); // contains "must include \"$HIVEMIND\""
  const lengthLabelContainer = document.getElementById('style-noMzF'); // contains "more than 10 symbols"
  const postContainer = document.getElementById('style-tYIG1'); // Post button wrapper

  // Helper: find the nearest preceding SVG indicator (the exported layout places them as previous siblings)
  function findIndicatorFor(labelContainer) {
    if (!labelContainer) return null;
    const prev = labelContainer.previousElementSibling;
    if (!prev) return null;
    const path = prev.querySelector('path');
    return path || null;
  }

  const mustIndicatorPath = findIndicatorFor(mustLabelContainer);
  const lengthIndicatorPath = findIndicatorFor(lengthLabelContainer);

  function setIndicator(pathEl, ok) {
    if (!pathEl) return;
    try {
      pathEl.setAttribute('fill', ok ? '#00ff2f' : '#ff0000');
    } catch (e) {
      // ignore
    }
  }

  function check() {
    const v = (textarea.value || '');
    const hasHivemind = v.indexOf('$HIVEMIND') !== -1;
    // "more than 10 symbols" — treat as character count > 10
    const longEnough = v.length > 10;

    setIndicator(mustIndicatorPath, hasHivemind);
    setIndicator(lengthIndicatorPath, longEnough);

    if (hasHivemind && longEnough) {
      postContainer && postContainer.classList.add('enabled');
      textarea.classList.add('valid');
    } else {
      postContainer && postContainer.classList.remove('enabled');
      textarea.classList.remove('valid');
    }
  }

  // debounce small input bursts for performance
  let t;
  textarea.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(check, 120);
  });

  // initial state
  check();

  // Prevent accidental Enter form submits (if any) — keep Post click controlled by the UI
  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // allow ctrl+enter for submit if desired in future
      return;
    }
  });

  // Optional: visual affordance on Post click — only allow when enabled
  if (postContainer) {
    postContainer.addEventListener('click', function (ev) {
      if (!postContainer.classList.contains('enabled')) {
        ev.preventDefault();
        ev.stopPropagation();
        // tiny feedback
        postContainer.classList.add('disabled-flash');
        setTimeout(() => postContainer.classList.remove('disabled-flash'), 220);
        return;
      }

      // When enabled, open a Twitter/X intent with the textarea content so the user can post.
      ev.preventDefault();
      ev.stopPropagation();
      const text = textarea.value || '';
      // Prefer twitter.com intent which still works for X; encode the text.
      const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
      // open in a new tab/window
      window.open(url, '_blank');
    });
  }
});

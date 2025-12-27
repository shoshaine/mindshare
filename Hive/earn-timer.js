document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('style-BROEm');
  if (!container) return;
  const label = container.querySelector('.tn-ypq') || container;

  const INTERVAL = 5 * 60; // 5 minutes in seconds

  function secondsSinceUtcMidnight() {
    const now = new Date();
    return now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  }

  function formatTime(s) {
    const mm = Math.floor(s / 60).toString().padStart(1, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return mm + ':' + ss;
  }

  function update() {
    const sec = secondsSinceUtcMidnight();
    let rem = INTERVAL - (sec % INTERVAL);
    if (rem <= 0) rem = INTERVAL;
    // Show as minutes:seconds, e.g. 5:00 -> 0:00
    label.textContent = 'Claim in ' + formatTime(rem);
  }

  // initial update + interval tick
  update();
  setInterval(update, 1000);
});

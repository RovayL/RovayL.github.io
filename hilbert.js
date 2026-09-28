/* Adapted from Yavor's original Hilbert curve animation. */
(() => {
  const overlay = document.getElementById('link-loader');
  const canvas = document.getElementById('hilbertCanvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const grid = 32, count = grid * grid, size = 160;
  const path = Array.from({ length: count }, (_, distance) => {
    let x = 0, y = 0, d = distance;
    for (let s = 1; s < grid; s *= 2) {
      const rx = 1 & (d >> 1), ry = 1 & (d ^ rx);
      if (ry === 0) {
        if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
        [x, y] = [y, x];
      }
      x += s * rx; y += s * ry; d >>= 2;
    }
    return { x: (x + .5) * size / grid, y: (grid - y - .5) * size / grid };
  });
  const red = [255, 40, 40], blue = [0, 0, 255];
  let frame = 0, started = 0, timer = 0;
  function draw(now) {
    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = 4.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const head = Math.floor((now - started) * 1.2) % count;
    for (let i = 1; i < count; i++) {
      const pos = ((head - i) % count + count) % count;
      if (pos === count - 1) continue;
      const t = i / (count / 2), mix = t <= 1 ? t : 2 - t;
      ctx.strokeStyle = `rgb(${blue.map((v, k) => Math.round(v * (1 - mix) + red[k] * mix)).join(',')})`;
      ctx.beginPath(); ctx.moveTo(path[pos].x, path[pos].y);
      ctx.lineTo(path[pos + 1].x, path[pos + 1].y); ctx.stroke();
    }
    frame = requestAnimationFrame(draw);
  }
  function hide() {
    clearTimeout(timer); cancelAnimationFrame(frame);
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self') || reducedMotion.matches) return;
    const url = new URL(link.href, location.href);
    if (!['http:', 'https:', 'file:'].includes(url.protocol)) return;
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) return;
    event.preventDefault(); hide();
    overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false');
    started = performance.now(); frame = requestAnimationFrame(draw);
    // A brief transition, rather than a simulated network-loading indicator.
    timer = setTimeout(() => {
      location.assign(url.href);
      timer = setTimeout(hide, 1000); // Also clear if a PDF download leaves this page open.
    }, 320);
  });
  addEventListener('pageshow', hide);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
})();

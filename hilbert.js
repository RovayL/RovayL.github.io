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

  // Miniature display: coordinates match the monitor in the cropped masthead.
  const miniCanvas = document.getElementById('tintin-screen');
  const miniCtx = miniCanvas?.getContext('2d');
  let miniFrame = 0;
  const screen = [{x:80.4,y:13.6},{x:138.4,y:8.8},{x:138.4,y:54.4},{x:80.8,y:58.8}];
  function screenPoint(u, v) {
    const top = {x:screen[0].x*(1-u)+screen[1].x*u,y:screen[0].y*(1-u)+screen[1].y*u};
    const bottom = {x:screen[3].x*(1-u)+screen[2].x*u,y:screen[3].y*(1-u)+screen[2].y*u};
    return {x:top.x*(1-v)+bottom.x*v,y:top.y*(1-v)+bottom.y*v};
  }
  // Sample every fourth vertex for a legible order-4 curve at this small size.
  const miniPath = path.filter((_, i) => i % 4 === 0).map(p => screenPoint(.07 + .86*(Math.floor(p.x/(size/16))+.5)/16, .07 + .86*(Math.floor(p.y/(size/16))+.5)/16));
  function drawMini(now) {
    miniCtx.setTransform(2, 0, 0, 2, 0, 0);
    miniCtx.clearRect(0, 0, 158, 112);
    miniCtx.save();
    miniCtx.beginPath(); miniCtx.moveTo(screen[0].x,screen[0].y);
    screen.slice(1).forEach(p => miniCtx.lineTo(p.x,p.y));
    miniCtx.closePath(); miniCtx.clip();
    miniCtx.fillStyle = '#050609'; miniCtx.fillRect(75,5,70,60);
    miniCtx.lineWidth = 2.5; miniCtx.lineCap = 'round'; miniCtx.lineJoin = 'round';
    const offset = reducedMotion.matches ? 0 : now * .00035;
    for (let i = 1; i < miniPath.length; i++) {
      const t = (i / miniPath.length + offset) % 1;
      const mix = (1 - Math.cos(t * Math.PI * 2)) / 2;
      miniCtx.strokeStyle = `rgb(${blue.map((v,k) => Math.round(v*(1-mix)+red[k]*mix)).join(',')})`;
      miniCtx.beginPath(); miniCtx.moveTo(miniPath[i-1].x,miniPath[i-1].y);
      miniCtx.lineTo(miniPath[i].x,miniPath[i].y); miniCtx.stroke();
    }
    miniCtx.restore();
    if (!reducedMotion.matches && !document.hidden) miniFrame = requestAnimationFrame(drawMini);
  }
  function restartMini() {
    cancelAnimationFrame(miniFrame);
    if (miniCtx) drawMini(performance.now());
  }
  document.addEventListener('visibilitychange', restartMini);
  reducedMotion.addEventListener('change', restartMini);
  restartMini();

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

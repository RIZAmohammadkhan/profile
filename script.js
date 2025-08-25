// --- ✅ NEW: Page Load Transition ---
// This code will run on every page, making it fade in smoothly.
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
});

// This script handles the custom cursor on ALL pages.
const cursor = document.querySelector('.cursor');

if (cursor) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let posX = mouseX;
  let posY = mouseY;
  const ease = 0.08;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const interactive = Array.from(document.querySelectorAll('a, button'));
  interactive.forEach(el => {
    el.addEventListener('pointerenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('cursor--hover'));
  });

  function raf() {
    posX += (mouseX - posX) * ease;
    posY += (mouseY - posY) * ease;
    cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(raf);
  }
  raf();
}
// Liquid directional fill for .resume-btn
(function () {
  const btn = document.querySelector('.resume-btn');
  if (!btn) return;

  // track last pointer position so we can know the entry direction/point
  let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener('pointermove', (e) => {
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
  }, { passive: true });

  // helper to clamp percent between 0% and 100%
  function clampPercent(n) {
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  function setOriginFromPoint(clientX, clientY) {
    const rect = btn.getBoundingClientRect();
    // compute point relative to the button in percent
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    // clamp and set CSS vars
    btn.style.setProperty('--x', `${clampPercent(px)}%`);
    btn.style.setProperty('--y', `${clampPercent(py)}%`);
    // compute required size: distance from point to farthest corner, times 2 (+ padding)
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    // four corners: (0,0), (rect.width,0), (0,rect.height), (rect.width,rect.height)
    const d1 = Math.hypot(localX - 0, localY - 0);
    const d2 = Math.hypot(localX - rect.width, localY - 0);
    const d3 = Math.hypot(localX - 0, localY - rect.height);
    const d4 = Math.hypot(localX - rect.width, localY - rect.height);
    const maxD = Math.max(d1, d2, d3, d4);
    const size = Math.ceil(maxD * 2 + 12); // +12 px padding to be safe
    btn.style.setProperty('--size', `${size}px`);
  }

  // show fill from the lastPointer (or entry position)
  btn.addEventListener('pointerenter', (e) => {
    // prefer lastPointer (where cursor was just before entering) for clearer directional feeling
    // but only if it's outside or near the edge; it's still fine either way
    setOriginFromPoint(lastPointer.x, lastPointer.y);
    // ensure browser computes the var changes first, then add the class to animate
    requestAnimationFrame(() => btn.classList.add('is-filled'));
  });

  // remove fill and animate contraction to the leave point
  btn.addEventListener('pointerleave', (e) => {
    // use the actual leave coordinates for exit origin
    setOriginFromPoint(e.clientX, e.clientY || lastPointer.x);
    // remove the filled state -> shrink
    btn.classList.remove('is-filled');
  });

  // touch / press support: on pointerdown fill from that touch point and keep it while pressed
  btn.addEventListener('pointerdown', (e) => {
    setOriginFromPoint(e.clientX, e.clientY);
    btn.classList.add('is-filled');
  });
  btn.addEventListener('pointerup', (e) => {
    // contract toward release point
    setOriginFromPoint(e.clientX, e.clientY || lastPointer.x);
    btn.classList.remove('is-filled');
  });

  // optional: keyboard activation (space/enter) — center the blob
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // center origin when keyboard triggered
      const rect = btn.getBoundingClientRect();
      setOriginFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      btn.classList.add('is-filled');
      // remove after short delay so keyboard users get the visual
      setTimeout(() => btn.classList.remove('is-filled'), 550);
    }
  });
})();

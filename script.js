// --- ✅ NEW: Page Load Transition ---
// This code will run on every page, making it fade in smoothly.
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
});

// This script handles the custom cursor on ALL pages.
const cursor = document.querySelector('.cursor');
// ✅ NEW: Check if the primary input method is a fine pointer (like a mouse)
const isFinePointer = window.matchMedia('(pointer: fine)').matches;

// ✅ MODIFIED: Only run cursor logic if the element exists AND it's a fine pointer device
if (cursor && isFinePointer) {
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
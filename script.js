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
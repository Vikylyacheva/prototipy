const gallery = document.querySelector('.room-gallery');
const frames = [...gallery.querySelectorAll('img')];
const [prev, next, pause] = gallery.querySelectorAll('button');
const counter = gallery.querySelector('.gallery-controls span');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let index = 0, playing = !reduced.matches, timer;
function render() {
  clearTimeout(timer);
  frames.forEach((frame, n) => {
    frame.classList.toggle('current', n === index);
    frame.setAttribute('aria-hidden', String(n !== index));
  });
  counter.textContent = (index + 1) + ' / ' + frames.length;
  pause.textContent = playing ? 'Ⅱ' : '▶';
  pause.setAttribute('aria-label', playing ? 'Приостановить показ' : 'Продолжить показ');
  if (playing && !document.hidden) timer = setTimeout(() => move(1), 4200);
}
function move(direction) {
  index = (index + direction + frames.length) % frames.length;
  render();
}
prev.onclick = () => move(-1);
next.onclick = () => move(1);
pause.onclick = () => { playing = !playing; render(); };
let startX;
gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
gallery.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - startX;
  if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
}, {passive:true});
document.addEventListener('visibilitychange', render);
render();
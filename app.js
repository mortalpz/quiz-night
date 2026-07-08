const slides = window.QUIZ_SLIDES || [];
let i = 0;
let remaining = 0;
let timerTotal = 0;
let interval = null;

const slideEl = document.getElementById('slide');
const counter = document.getElementById('counter');
const timerBtn = document.getElementById('timerBtn');

function esc(s) {
  return String(s || '').replace(/[&<>]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[c]));
}

function escAttr(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]));
}

function formatTime(seconds) {
  seconds = Number(seconds) || 0;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  timerBtn.textContent = '▶ Таймер';
}

function setupTimer(sec) {
  stopTimer();
  timerTotal = Number(sec) || 0;
  remaining = timerTotal;
}

function startTimer() {
  if (!timerTotal) return;
  stopTimer();
  timerBtn.textContent = '⏸ Пауза';
  interval = setInterval(tick, 1000);
}

function render() {
  stopTimer();

  const s = slides[i];
  if (!s) {
    slideEl.innerHTML = '<div class="text"><h1>Няма слайдове</h1></div>';
    counter.textContent = '0 / 0';
    return;
  }

  setupTimer(s.timer);

  const hasBodyHtml = Boolean(s.bodyHtml);
  const bodyText = s.body || '';
  const bodySourceForSize = hasBodyHtml ? s.bodyHtml : bodyText;
  const bodyContent = hasBodyHtml ? String(s.bodyHtml).trim() : esc(bodyText);

  slideEl.className = 'slide' + (s.answer ? ' answer' : '');

  const bodyClass =
    (bodySourceForSize.length > 650 ? ' small' : '') +
    (s.answer ? ' answerBody' : '') +
    (hasBodyHtml ? ' htmlBody' : '');

  const timerHtml = s.timer
    ? `<div class="timer" style="--p:100%"><span id="timerText">${formatTime(s.timer)}</span></div>`
    : '';

  const images = (s.images || [])
    .filter(src => !String(src).toLowerCase().endsWith('.wdp'))
    .map(src => `<img src="${escAttr(src)}" alt="" />`)
    .join('');

  const audios = (s.audios || [])
    .map(src => `<audio controls preload="metadata" src="${escAttr(src)}"></audio>`)
    .join('');

  const videos = (s.videos || [])
    .map(src => `<video controls preload="metadata" src="${escAttr(src)}"></video>`)
    .join('');

  slideEl.innerHTML = `
    ${timerHtml}
    <div class="badge"></div>
    <div class="text">
      <h1>${esc(s.title)}</h1>
      <div class="body${bodyClass}">${bodyContent}</div>
    </div>
    <div class="mediaBox">
      ${videos}
      ${images}
      ${audios}
      ${(!images && !audios && !videos) ? '<div class="emptyMedia">?</div>' : ''}
    </div>
  `;

  counter.textContent = `${i + 1} / ${slides.length}`;

  if (s.timer) {
    startTimer();
  }
}

function tick() {
  if (!timerTotal) return;

  remaining = Math.max(0, remaining - 1);
  const pct = (remaining / timerTotal) * 100;
  const box = slideEl.querySelector('.timer');
  const txt = document.getElementById('timerText');

  if (box) box.style.setProperty('--p', pct + '%');
  if (txt) txt.textContent = formatTime(remaining);

  if (remaining <= 0) stopTimer();
}

function toggleTimer() {
  if (!timerTotal) return;
  if (interval) {
    stopTimer();
    return;
  }
  timerBtn.textContent = '⏸ Пауза';
  interval = setInterval(tick, 1000);
}

function go(delta) {
  i = Math.min(slides.length - 1, Math.max(0, i + delta));
  render();
}

document.getElementById('prev').onclick = () => go(-1);
document.getElementById('next').onclick = () => go(1);
timerBtn.onclick = toggleTimer;
document.getElementById('resetTimer').onclick = () => {
  setupTimer((slides[i] || {}).timer);
  render();
};

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') go(1);
  if (e.key === 'ArrowLeft') go(-1);
  if (e.key.toLowerCase() === 't') toggleTimer();
});

render();

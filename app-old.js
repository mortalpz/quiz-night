const slides = window.QUIZ_SLIDES || [];
let i = 0;
let remaining = 0;
let timerTotal = 0;
let interval = null;

const slideEl = document.getElementById('slide');
const counter = document.getElementById('counter');
const timerBtn = document.getElementById('timerBtn');

function esc(s){return (s||'').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function stopTimer(){ if(interval){ clearInterval(interval); interval=null; } timerBtn.textContent='▶ Таймер'; }
function setupTimer(sec){ stopTimer(); timerTotal = sec || 0; remaining = timerTotal; }
function startTimer(){
  if(!timerTotal) return;
  stopTimer();
  timerBtn.textContent='⏸ Пауза';
  interval = setInterval(tick, 1000);
}
function render(){
  stopTimer();
  const s = slides[i];
  setupTimer(s.timer);
  slideEl.className = 'slide' + (s.answer ? ' answer' : '');
  const bodyClass = (s.body.length > 650 ? ' small' : '') + (s.answer ? ' answerBody' : '');
  const timerHtml = s.timer ? `<div class="timer" style="--p:100%"><span id="timerText">${s.timer}</span></div>` : '';
  const images = (s.images||[]).filter(x=>!x.endsWith('.wdp')).map(src=>`<img src="${src}" alt="" />`).join('');
  const audios = (s.audios||[]).map(src=>`<audio controls src="${src}"></audio>`).join('');
  const videos = (s.videos||[]).map(src=>`<video controls src="${src}"></video>`).join('');
  slideEl.innerHTML = `${timerHtml}<div class="badge"></div><div class="text"><h1>${esc(s.title)}</h1><div class="body${bodyClass}">${esc(s.body)}</div></div><div class="mediaBox">${videos}${images}${audios || ''}${(!images&&!audios&&!videos)?'<div class="emptyMedia">?</div>':''}</div>`;
  //slideEl.innerHTML = `${timerHtml}<div class="badge">Слайд ${s.number}</div><div class="text"><h1>${esc(s.title)}</h1><div class="body${bodyClass}">${esc(s.body)}</div></div><div class="mediaBox">${videos}${images}${audios || ''}${(!images&&!audios&&!videos)?'<div class="emptyMedia">?</div>':''}</div>`;
  counter.textContent = `${i+1}`;
  //counter.textContent = `${i+1} / ${slides.length}`;
	if (s.timer) {
	startTimer();
	}
}
function tick(){
  if(!timerTotal) return;
  remaining = Math.max(0, remaining-1);
  const pct = (remaining/timerTotal)*100;
  const box = slideEl.querySelector('.timer');
  const txt = document.getElementById('timerText');
  if(box) box.style.setProperty('--p', pct+'%');
  if(txt) txt.textContent = remaining;
  if(remaining <= 0) stopTimer();
}
function toggleTimer(){
  if(!timerTotal) return;
  if(interval){ stopTimer(); return; }
  timerBtn.textContent='⏸ Пауза';
  interval = setInterval(tick,1000);
}
function go(delta){ i = Math.min(slides.length-1, Math.max(0, i+delta)); render(); }

document.getElementById('prev').onclick=()=>go(-1);
document.getElementById('next').onclick=()=>go(1);
timerBtn.onclick=toggleTimer;
document.getElementById('resetTimer').onclick=()=>{ setupTimer((slides[i]||{}).timer); render(); };
document.addEventListener('keydown', e=>{ if(e.key==='ArrowRight'||e.key===' ') go(1); if(e.key==='ArrowLeft') go(-1); if(e.key.toLowerCase()==='t') toggleTimer(); });
render();

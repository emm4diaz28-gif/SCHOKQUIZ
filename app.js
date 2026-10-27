// ===== ESTADO GLOBAL =====
let gameMode = 'individual'; // 'individual' | 'test'
let playerScore = 0;
let curCat = '', curQs = [], curIdx = 0;
let answered = false, answers = [], timerInt = null;
let timeLeft = 20, totalTime = 0;
let curQuestion = null;

// ===== ESP32 (ALERTAS POR WIFI) =====
const ESP_STORAGE_KEY = 'techquiz_esp32';
let espConfig = { enabled: false, ip: '' };

function loadEspConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(ESP_STORAGE_KEY));
    if (saved) espConfig = { enabled: !!saved.enabled, ip: saved.ip || '' };
  } catch (e) { /* sin almacenamiento disponible */ }
  document.getElementById('esp-enabled').checked = espConfig.enabled;
  document.getElementById('esp-ip').value = espConfig.ip;
}

function saveEspConfig() {
  espConfig.enabled = document.getElementById('esp-enabled').checked;
  espConfig.ip = document.getElementById('esp-ip').value.trim()
    .replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  try { localStorage.setItem(ESP_STORAGE_KEY, JSON.stringify(espConfig)); } catch (e) {}
}

// Envía una orden al ESP32: 'error', 'ok' o 'test'. Devuelve true si el ESP32 respondió.
async function espSend(path, force) {
  if (!force && (!espConfig.enabled || !espConfig.ip)) return false;
  if (!espConfig.ip) return false;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2000);
  try {
    // no-cors: no leemos la respuesta, pero si el ESP32 no existe el fetch falla
    await fetch('http://' + espConfig.ip + '/' + path, { mode: 'no-cors', signal: ctrl.signal, cache: 'no-store' });
    return true;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(t);
  }
}

async function probarEsp() {
  const st = document.getElementById('esp-status');
  saveEspConfig();
  if (!espConfig.ip) { st.style.color = '#dc2626'; st.textContent = 'Escribe la IP primero'; return; }
  if (location.protocol === 'https:') {
    st.style.color = '#dc2626';
    st.textContent = 'Abre la página con http:// (https bloquea al ESP32)';
    return;
  }
  st.style.color = '#888';
  st.textContent = 'Probando...';
  const ok = await espSend('test', true);
  st.style.color = ok ? '#16a34a' : '#dc2626';
  st.textContent = ok ? '✓ ESP32 respondió' : '✗ Sin respuesta';
}

// ===== NAVEGACIÓN =====
function showScreen(id, extra) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (extra) gameMode = extra;
  if (id === 's-catsel') populateCategorySelects();
  if (id === 's-admin-login') document.getElementById('adm-login-err').style.display = 'none';
}

// ===== PERSISTENCIA DE PREGUNTAS =====
const QUESTIONS_STORAGE_KEY = 'techquiz_questions';

function saveQuestions() {
  try { localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(QUESTIONS)); } catch (e) {}
}

function loadQuestions() {
  try {
    const saved = JSON.parse(localStorage.getItem(QUESTIONS_STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      Object.keys(QUESTIONS).forEach(k => delete QUESTIONS[k]);
      Object.assign(QUESTIONS, saved);
    }
  } catch (e) { /* si falla, se usan las de data.js */ }
}

function resetQuestions() {
  if (confirm('Se borrarán los cambios guardados en este navegador y se volverá a las preguntas originales de data.js. ¿Continuar?')) {
    try { localStorage.removeItem(QUESTIONS_STORAGE_KEY); } catch (e) {}
    location.reload();
  }
}

// Descarga un data.js nuevo con todo lo que hay actualmente (para reemplazar el archivo original)
function exportDataJs() {
  const txt =
    '// Generado desde el panel de administrador\n' +
    'const LEVELS = ' + JSON.stringify(LEVELS, null, 2) + ';\n\n' +
    'const QUESTIONS = ' + JSON.stringify(QUESTIONS, null, 2) + ';\n\n' +
    'const RANKING_DATA = ' + JSON.stringify(RANKING_DATA, null, 2) + ';\n\n' +
    'const USERS_DATA = ' + JSON.stringify(USERS_DATA, null, 2) + ';\n';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript' }));
  a.download = 'data.js';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

// ===== CATEGORÍAS DINÁMICAS =====
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function getCategories() {
  return Object.keys(QUESTIONS);
}

function fillSelect(select, cats) {
  const prev = select.value;
  select.innerHTML = '';
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    select.appendChild(o);
  });
  if (cats.includes(prev)) select.value = prev;
}

function populateCategorySelects() {
  // Quiz: solo categorías que tengan al menos una pregunta
  fillSelect(document.getElementById('sel-cat'), getCategories().filter(c => QUESTIONS[c].length > 0));
  // Admin (nueva pregunta): todas las categorías
  fillSelect(document.getElementById('nq-cat'), getCategories());
}

function refreshAdmin() {
  renderAdminCats();
  renderAdminQs();
  populateCategorySelects();
}

function renderAdminCats() {
  const list = document.getElementById('adm-c-list');
  list.innerHTML = '';
  const cats = getCategories();
  if (cats.length === 0) {
    list.innerHTML = '<p style="color:#999;font-size:13px;padding:1rem">No hay categorías. Agrega una arriba.</p>';
    return;
  }
  cats.forEach(cat => {
    const n = QUESTIONS[cat].length;
    const div = document.createElement('div');
    div.className = 'admin-q-item';
    div.innerHTML = `<div style="flex:1">
      <div class="admin-q-text">${escapeHtml(cat)}</div>
      <div class="admin-q-badges"><span class="badge blue">${n} pregunta${n === 1 ? '' : 's'}</span></div>
    </div>`;
    const btn = document.createElement('button');
    btn.className = 'btn-del';
    btn.textContent = '🗑';
    btn.title = 'Eliminar categoría';
    btn.onclick = () => deleteCategory(cat);
    div.appendChild(btn);
    list.appendChild(div);
  });
}

function addCategory() {
  const input = document.getElementById('nc-name');
  const name = input.value.trim().replace(/\s+/g, ' ');
  if (!name) { alert('Escribe el nombre de la categoría.'); return; }
  if (getCategories().some(c => c.toLowerCase() === name.toLowerCase())) {
    alert('Ya existe una categoría con ese nombre.');
    return;
  }
  QUESTIONS[name] = [];
  input.value = '';
  saveQuestions();
  refreshAdmin();
  document.getElementById('nq-cat').value = name;

  const msg = document.getElementById('nc-msg');
  msg.style.display = 'inline-block';
  setTimeout(() => msg.style.display = 'none', 2500);
}

function deleteCategory(cat) {
  const n = QUESTIONS[cat].length;
  const text = n > 0
    ? `La categoría "${cat}" tiene ${n} pregunta(s) que también se eliminarán. ¿Continuar?`
    : `¿Eliminar la categoría "${cat}"?`;
  if (confirm(text)) {
    delete QUESTIONS[cat];
    saveQuestions();
    refreshAdmin();
  }
}

// ===== LOGIN =====
function doLogin() {
  showScreen('s-catsel');
  updateLevelDisplay();
}

// Credenciales del administrador
const ADMIN_USER = 'Emma';
const ADMIN_PASS = '25DZ25z';

function doAdminLogin() {
  const user = document.getElementById('adm-user').value.trim();
  const pass = document.getElementById('adm-pass').value;
  const err = document.getElementById('adm-login-err');
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    err.style.display = 'none';
    document.getElementById('adm-user').value = '';
    document.getElementById('adm-pass').value = '';
    goAdmin();
  } else {
    err.style.display = 'block';
    document.getElementById('adm-pass').value = '';
  }
}

function goAdmin() {
  showScreen('s-admin');
  refreshAdmin();
  renderAdminUsers();
}

// ===== NIVEL DEL JUGADOR =====
function getLevel(score) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevelPoints(score) {
  const lv = getLevel(score);
  const idx = LEVELS.indexOf(lv);
  if (idx < LEVELS.length - 1) return LEVELS[idx + 1].min - score;
  return 0;
}

function updateLevelDisplay() {
  const lv = getLevel(playerScore);
  document.getElementById('player-level-name').textContent = lv.name;
  document.getElementById('player-points-disp').textContent = playerScore;
  const next = getNextLevelPoints(playerScore);
  document.getElementById('points-next').textContent = next > 0 ? next : '¡Nivel máximo!';
}

// ===== INICIO QUIZ =====
function beginQuiz() {
  curCat = document.getElementById('sel-cat').value;
  const pool = QUESTIONS[curCat] || [];
  if (pool.length === 0) { alert('No hay preguntas disponibles en esta categoría.'); return; }
  curQs = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(5, pool.length));
  curIdx = 0; answers = []; totalTime = 0;
  showScreen('s-quiz');
  loadQuestion();
}

// ===== CARGAR PREGUNTA =====
function loadQuestion() {
  clearInterval(timerInt);
  if (curIdx >= curQs.length) { finishQuiz(); return; }

  showScreen('s-quiz'); // volver a la pantalla de la pregunta (venimos de la explicación)
  curQuestion = curQs[curIdx];
  answered = false;

  // Topbar
  const lv = getLevel(playerScore);
  document.getElementById('qt-score').textContent = playerScore;
  document.getElementById('qt-level').textContent = lv.emoji + ' ' + lv.name;

  // Imagen / emoji pregunta
  document.getElementById('q-img').textContent = curQuestion.emoji || '⚡';

  // Badge número
  document.getElementById('q-num-badge').innerHTML =
    (curIdx + 1) + '<br><span style="font-size:10px;font-weight:400">+' + calcPoints(20) + '</span>';

  // Texto pregunta
  document.getElementById('quiz-q').textContent = curQuestion.q;

  // Opciones
  const optsDiv = document.getElementById('quiz-opts');
  optsDiv.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  curQuestion.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.textContent = labels[i] + '. ' + o;
    b.onclick = () => selectAnswer(i, b);
    optsDiv.appendChild(b);
  });

  // Timer
  timeLeft = 20;
  updateTimer();
  timerInt = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) { clearInterval(timerInt); if (!answered) timeOut(); }
  }, 1000);
}

function calcPoints(t) {
  // Más puntos si responde rápido
  return Math.max(50, Math.round(200 * (t / 20)));
}

function updateTimer() {
  const el = document.getElementById('qt-timer');
  el.textContent = timeLeft;
  el.className = 'qtop-timer' + (timeLeft <= 5 ? ' danger' : timeLeft <= 8 ? ' warn' : '');
}

function timeOut() {
  answered = true;
  totalTime += 20;
  const btns = document.querySelectorAll('.opt-btn');
  btns.forEach((b, i) => {
    b.disabled = true;
    if (i === curQuestion.ans) b.classList.add('reveal');
    else b.classList.add('wrong');
  });
  answers.push({ correct: false, time: 20, points: 0 });
  espSend('error');
  showExplain(false);
}

function selectAnswer(i, btn) {
  if (answered) return;
  answered = true;
  clearInterval(timerInt);
  const elapsed = 20 - timeLeft;
  totalTime += elapsed;
  const correct = i === curQuestion.ans;
  const pts = correct ? calcPoints(timeLeft) : 0;

  document.querySelectorAll('.opt-btn').forEach((b, j) => {
    b.disabled = true;
    if (j === curQuestion.ans) b.classList.add('correct');
    else if (j === i && !correct) b.classList.add('wrong');
  });

  if (correct) {
    playerScore += pts;
    document.getElementById('qt-score').textContent = playerScore;
  }

  answers.push({ correct, time: elapsed, points: pts });
  espSend(correct ? 'ok' : 'error');
  setTimeout(() => showExplain(correct), 800);
}

// ===== PANTALLA EXPLICACIÓN =====
function showExplain(correct) {
  document.getElementById('exp-q').textContent = curQuestion.q;
  document.getElementById('exp-short').textContent = curQuestion.exp || 'Sin explicación disponible.';
  document.getElementById('exp-remaining').textContent = curQs.length - curIdx - 1;
  showScreen('s-explain');
}

function showDetailed() {
  document.getElementById('det-q').textContent = curQuestion.q;
  document.getElementById('det-text').textContent = curQuestion.detail || curQuestion.exp || 'Sin información adicional.';
  showScreen('s-detailed');
}

function nextQuestion() {
  curIdx++;
  loadQuestion();
}

function confirmExit() {
  if (confirm('¿Seguro que quieres salir? Perderás el progreso de esta partida.')) {
    clearInterval(timerInt);
    showScreen('s-main');
  }
}

// ===== RESULTADO FINAL =====
function finishQuiz() {
  clearInterval(timerInt);
  const correct = answers.filter(a => a.correct).length;
  const total = curQs.length;
  const pct = Math.round(correct / total * 100);
  const avgTime = total > 0 ? (totalTime / total).toFixed(1) : 0;
  const next = getNextLevelPoints(playerScore);

  document.getElementById('res-score').textContent = playerScore;
  document.getElementById('res-next').textContent = next > 0 ? next : '¡Nivel máximo alcanzado!';
  document.getElementById('res-acc').textContent = pct + '%';
  document.getElementById('res-time').textContent = avgTime + ' segundos';

  // Animar barras
  setTimeout(() => {
    document.getElementById('res-bar-acc').style.width = pct + '%';
    const timeMax = 20;
    const timePct = Math.min(100, Math.round((parseFloat(avgTime) / timeMax) * 100));
    document.getElementById('res-bar-time').style.width = timePct + '%';
  }, 200);

  showScreen('s-result');
}

// ===== ADMIN: PREGUNTAS =====
function renderAdminQs() {
  const list = document.getElementById('adm-q-list');
  list.innerHTML = '';
  let total = 0;
  Object.entries(QUESTIONS).forEach(([cat, qs]) => {
    qs.forEach((q, i) => {
      total++;
      const div = document.createElement('div');
      div.className = 'admin-q-item';
      const diffClass = q.diff === 'Básico' ? 'green' : q.diff === 'Intermedio' ? 'amber' : 'coral';
      div.innerHTML = `<div style="flex:1">
        <div class="admin-q-text">${q.emoji || ''} ${escapeHtml(q.q)}</div>
        <div class="admin-q-badges">
          <span class="badge blue">${escapeHtml(cat)}</span>
          <span class="badge ${diffClass}">${escapeHtml(q.diff)}</span>
        </div></div>`;
      const del = document.createElement('button');
      del.className = 'btn-del';
      del.textContent = '🗑';
      del.onclick = () => deleteQ(cat, i);
      div.appendChild(del);
      list.appendChild(div);
    });
  });
  if (total === 0) list.innerHTML = '<p style="color:#999;font-size:13px;padding:1rem">No hay preguntas.</p>';
}

function deleteQ(cat, idx) {
  if (confirm('¿Eliminar esta pregunta?')) {
    QUESTIONS[cat].splice(idx, 1);
    saveQuestions();
    refreshAdmin();
  }
}

function renderAdminUsers() {
  const list = document.getElementById('adm-u-list');
  list.innerHTML = '';
  USERS_DATA.forEach(u => {
    const lv = getLevel(u.score);
    const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const div = document.createElement('div');
    div.className = 'admin-u-item';
    div.innerHTML = `<div class="avatar">${initials}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${u.name}</div>
        <div style="font-size:12px;color:#666">${u.email} · ${u.quizzes} quizzes · ${u.score} pts</div>
      </div>
      <span class="badge blue">${lv.emoji} ${lv.name}</span>`;
    list.appendChild(div);
  });
}

function adminTab(el, target) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['adm-preguntas', 'adm-usuarios', 'adm-categorias', 'adm-nueva'].forEach(id => {
    document.getElementById(id).style.display = id === target ? 'block' : 'none';
  });
}

function addQuestion() {
  const q    = document.getElementById('nq-q').value.trim();
  const cat  = document.getElementById('nq-cat').value;
  const diff = document.getElementById('nq-diff').value;
  const opts = ['nq-a','nq-b','nq-c','nq-d'].map(id => document.getElementById(id).value.trim());
  const ans  = parseInt(document.getElementById('nq-ans').value);
  const exp  = document.getElementById('nq-exp').value.trim();
  const detail = document.getElementById('nq-det').value.trim();
  const emoji  = document.getElementById('nq-emoji').value.trim() || '⚡';

  if (!cat || !QUESTIONS[cat]) { alert('Primero crea una categoría en la pestaña "Categorías".'); return; }
  if (!q || opts.some(o => !o)) { alert('Completa la pregunta y todas las opciones.'); return; }

  QUESTIONS[cat].push({ q, opts, ans, diff, exp, detail, emoji });
  saveQuestions();
  refreshAdmin();

  const msg = document.getElementById('nq-msg');
  msg.style.display = 'inline';
  setTimeout(() => msg.style.display = 'none', 2500);
  ['nq-q','nq-a','nq-b','nq-c','nq-d','nq-exp','nq-det','nq-emoji'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ===== INICIALIZACIÓN =====
loadQuestions();
populateCategorySelects();
loadEspConfig();

/* ============================================================
   Lembretes de água
   - Notificações locais enquanto o site está aberto
   - Intervalo configurável
   - Contador de copos do dia
   ============================================================ */

(function () {
  'use strict';

  const KEY_CONFIG = 'alimentemelhor:lembretes:v1';
  const KEY_COPOS = 'alimentemelhor:copos:v1';

  const btnAtivar = document.getElementById('btn-ativar');
  const btnDesativar = document.getElementById('btn-desativar');
  const statusEl = document.getElementById('status');
  const intervaloSel = document.getElementById('intervalo');
  const proxLembreteEl = document.getElementById('proximo-lembrete');
  const copoBtn = document.getElementById('copo-btn');
  const copoContEl = document.getElementById('copo-contador');
  const copoResetBtn = document.getElementById('copo-reset');

  const state = {
    ativo: false,
    intervaloMin: 60,
    proximo: null
  };

  let timerId = null;

  function carregarConfig() {
    try {
      const raw = localStorage.getItem(KEY_CONFIG);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) {}
  }

  function salvarConfig() {
    try { localStorage.setItem(KEY_CONFIG, JSON.stringify(state)); } catch (e) {}
  }

  function hoje() { return new Date().toISOString().slice(0, 10); }

  function carregarCopos() {
    try {
      const raw = localStorage.getItem(KEY_COPOS);
      const obj = raw ? JSON.parse(raw) : {};
      return obj[hoje()] || 0;
    } catch (e) { return 0; }
  }

  function salvarCopos(qtd) {
    try {
      const raw = localStorage.getItem(KEY_COPOS);
      const obj = raw ? JSON.parse(raw) : {};
      obj[hoje()] = qtd;
      // limpar dias antigos (>30d)
      const limite = new Date(); limite.setDate(limite.getDate() - 30);
      const limIso = limite.toISOString().slice(0, 10);
      Object.keys(obj).forEach(d => { if (d < limIso) delete obj[d]; });
      localStorage.setItem(KEY_COPOS, JSON.stringify(obj));
    } catch (e) {}
  }

  function atualizarUI() {
    if (state.ativo) {
      statusEl.innerHTML = `<strong class="color-green">Lembretes ativos.</strong> Você receberá um lembrete a cada ${state.intervaloMin} minutos enquanto o site estiver aberto.`;
      btnAtivar.style.display = 'none';
      btnDesativar.style.display = 'inline-flex';
      if (state.proximo) {
        const diff = Math.max(0, state.proximo - Date.now());
        const mins = Math.ceil(diff / 60000);
        proxLembreteEl.textContent = `Próximo em ${mins} min`;
      }
    } else {
      statusEl.innerHTML = 'Lembretes desativados.';
      btnAtivar.style.display = 'inline-flex';
      btnDesativar.style.display = 'none';
      proxLembreteEl.textContent = '';
    }
    copoContEl.textContent = carregarCopos();
  }

  async function pedirPermissao() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  function agendarProximo() {
    if (timerId) clearTimeout(timerId);
    const ms = state.intervaloMin * 60 * 1000;
    state.proximo = Date.now() + ms;
    timerId = setTimeout(disparar, ms);
    atualizarUI();
  }

  function disparar() {
    if (!state.ativo) return;
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Hora da água 💧', {
        body: 'Que tal um copo de água agora? Seu corpo agradece.',
        icon: 'assets/icons/icon-192.png',
        tag: 'alimentemelhor-agua'
      });
    }
    agendarProximo();
  }

  btnAtivar.addEventListener('click', async () => {
    const ok = await pedirPermissao();
    if (!ok) {
      alert('Para receber lembretes, você precisa permitir notificações. Vá nas configurações do navegador e libere para este site.');
      return;
    }
    state.intervaloMin = parseInt(intervaloSel.value, 10);
    state.ativo = true;
    salvarConfig();
    agendarProximo();
  });

  btnDesativar.addEventListener('click', () => {
    state.ativo = false;
    state.proximo = null;
    if (timerId) clearTimeout(timerId);
    salvarConfig();
    atualizarUI();
  });

  intervaloSel.addEventListener('change', () => {
    state.intervaloMin = parseInt(intervaloSel.value, 10);
    salvarConfig();
    if (state.ativo) agendarProximo();
  });

  copoBtn.addEventListener('click', () => {
    const atual = carregarCopos();
    salvarCopos(atual + 1);
    atualizarUI();
    // Feedback visual rápido
    copoBtn.style.transform = 'scale(0.94)';
    setTimeout(() => copoBtn.style.transform = '', 150);
  });

  copoResetBtn.addEventListener('click', () => {
    if (confirm('Zerar contador de hoje?')) {
      salvarCopos(0);
      atualizarUI();
    }
  });

  // Contagem regressiva de 1 em 1 minuto
  setInterval(() => { if (state.ativo) atualizarUI(); }, 60000);

  // Init
  carregarConfig();
  intervaloSel.value = state.intervaloMin;
  if (state.ativo) agendarProximo();
  atualizarUI();
})();

/* ============================================================
   Acompanhamento de peso — estilo Foodnoms
   ============================================================ */

(function () {
  'use strict';

  const KEY = 'alimentemelhor:peso:v1';

  const form = document.getElementById('peso-form');
  const dataInput = document.getElementById('peso-data');
  const valorInput = document.getElementById('peso-valor');
  const chartCard = document.getElementById('peso-chart-card');
  const listaEl = document.getElementById('peso-lista');
  const btnExport = document.getElementById('btn-export');
  const btnLimparTudo = document.getElementById('btn-limpar-tudo');
  const currentValueEl = document.getElementById('peso-current-value');
  const currentDateEl = document.getElementById('peso-current-date');
  const movingAvgEl = document.getElementById('peso-moving-avg');
  const movingAvgValueEl = document.getElementById('peso-moving-avg-value');
  const segButtons = document.querySelectorAll('.peso-seg-btn');

  let currentPeriod = 'week';

  const hoje = new Date().toISOString().slice(0, 10);
  dataInput.value = hoje;
  dataInput.max = hoje;

  function carregar() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function salvar(dados) {
    try { localStorage.setItem(KEY, JSON.stringify(dados)); } catch (e) {}
  }

  function formatarData(iso) {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function formatarDataLonga(iso) {
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const d = new Date(iso + 'T00:00:00');
    return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
  }

  function formatarPeso(p) {
    return p.toFixed(1).replace('.', ',') + ' kg';
  }

  // Filtrar por período
  function filtrarPorPeriodo(dados) {
    if (!dados.length) return [];
    const hoje = new Date();
    const limite = new Date(hoje);
    if (currentPeriod === 'week') limite.setDate(limite.getDate() - 7);
    else if (currentPeriod === 'month') limite.setMonth(limite.getMonth() - 1);
    else if (currentPeriod === 'year') limite.setFullYear(limite.getFullYear() - 1);
    const limIso = limite.toISOString().slice(0, 10);
    return dados.filter(d => d.data >= limIso);
  }

  // Média móvel de 7 dias (do array ordenado)
  function calcularMediaMovel(ordenado) {
    if (ordenado.length === 0) return null;
    const hojeIso = new Date().toISOString().slice(0, 10);
    const setDiasAtras = new Date();
    setDiasAtras.setDate(setDiasAtras.getDate() - 7);
    const limIso = setDiasAtras.toISOString().slice(0, 10);
    const dosSete = ordenado.filter(d => d.data >= limIso && d.data !== hojeIso);
    if (!dosSete.length) return null;
    const soma = dosSete.reduce((s, d) => s + d.peso, 0);
    return soma / dosSete.length;
  }

  // Gráfico laranja estilo Foodnoms
  function renderGrafico(dados) {
    const filtrados = filtrarPorPeriodo(dados);

    if (!filtrados.length) {
      chartCard.innerHTML = `
        <div class="peso-chart-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 17l5-5 4 4 7-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 5"/>
          </svg>
          <span>${dados.length ? 'Sem registros neste período.' : 'Registre seu primeiro peso abaixo para começar.'}</span>
        </div>
      `;
      return;
    }

    const ordenado = [...filtrados].sort((a, b) => a.data.localeCompare(b.data));
    const pesos = ordenado.map(d => d.peso);
    const min = Math.min(...pesos);
    const max = Math.max(...pesos);
    const range = max - min || 1;
    const padY = range * 0.25 || 1;
    const yMin = Math.floor(min - padY);
    const yMax = Math.ceil(max + padY);

    const W = 700, H = 280;
    const pad = { top: 20, right: 60, bottom: 40, left: 20 };
    const inW = W - pad.left - pad.right;
    const inH = H - pad.top - pad.bottom;

    const x = i => pad.left + (ordenado.length <= 1 ? inW / 2 : (i / (ordenado.length - 1)) * inW);
    const y = p => pad.top + inH - ((p - yMin) / (yMax - yMin)) * inH;

    const path = ordenado.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.peso)}`).join(' ');

    // Grid lines horizontais + labels Y à direita
    const yTicks = [];
    for (let i = 0; i <= 3; i++) {
      const v = yMin + (yMax - yMin) * (i / 3);
      yTicks.push({ y: y(v), label: v.toFixed(1).replace('.', ',') });
    }

    // Labels X (dias da semana ou datas)
    const diasSemana = ['D','S','T','Q','Q','S','S'];
    const labelsX = ordenado.map((d, i) => {
      const dt = new Date(d.data + 'T00:00:00');
      return { x: x(i), label: diasSemana[dt.getDay()] };
    });

    chartCard.innerHTML = `
      <div class="peso-chart">
        <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfico de peso">
          ${yTicks.map(t => `
            <line x1="${pad.left}" x2="${W - pad.right}" y1="${t.y}" y2="${t.y}"
                  stroke="currentColor" stroke-width="1" stroke-dasharray="2,3" opacity="0.15"/>
            <text x="${W - pad.right + 10}" y="${t.y + 4}" text-anchor="start"
                  font-family="Nunito Sans, sans-serif" font-size="11" font-weight="600" fill="currentColor" opacity="0.5">${t.label}</text>
          `).join('')}

          ${labelsX.map(l => `
            <text x="${l.x}" y="${H - 15}" text-anchor="middle"
                  font-family="Nunito Sans, sans-serif" font-size="11" font-weight="600" fill="currentColor" opacity="0.5">${l.label}</text>
          `).join('')}

          <path d="${path}" stroke="#ff6d00" stroke-width="2.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>

          ${ordenado.map((d, i) => `
            <circle cx="${x(i)}" cy="${y(d.peso)}" r="4.5" fill="var(--surface-primary)" stroke="#ff6d00" stroke-width="2.5"/>
          `).join('')}
        </svg>
      </div>
    `;
  }

  function renderCurrentCard(dados) {
    if (!dados.length) {
      currentValueEl.textContent = '— kg';
      currentDateEl.textContent = 'Nenhum registro ainda';
      return;
    }
    const ordenado = [...dados].sort((a, b) => b.data.localeCompare(a.data));
    const ultimo = ordenado[0];
    currentValueEl.textContent = formatarPeso(ultimo.peso);
    currentDateEl.textContent = formatarDataLonga(ultimo.data);
  }

  function renderMediaMovel(dados) {
    const ordenado = [...dados].sort((a, b) => a.data.localeCompare(b.data));
    const media = calcularMediaMovel(ordenado);
    if (media === null) {
      movingAvgEl.style.display = 'none';
      return;
    }
    movingAvgEl.style.display = 'flex';
    movingAvgValueEl.textContent = formatarPeso(media);
  }

  function renderLista(dados) {
    if (!dados.length) {
      listaEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);font-size:var(--text-body-sm);">Sem registros ainda.</p>`;
      return;
    }
    const ordenado = [...dados].sort((a, b) => b.data.localeCompare(a.data));
    listaEl.innerHTML = ordenado.map(d => `
      <div class="peso-item">
        <div class="peso-item-info">
          <span class="peso-item-data">${formatarData(d.data)}</span>
          <span class="peso-item-valor">${formatarPeso(d.peso)}</span>
        </div>
        <button type="button" class="peso-item-btn" data-data="${d.data}">Remover</button>
      </div>
    `).join('');

    listaEl.querySelectorAll('.peso-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const data = btn.dataset.data;
        const atual = carregar().filter(d => d.data !== data);
        salvar(atual);
        atualizar();
      });
    });
  }

  function atualizar() {
    const dados = carregar();
    renderCurrentCard(dados);
    renderGrafico(dados);
    renderMediaMovel(dados);
    renderLista(dados);
  }

  // Segmentado
  segButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      segButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      renderGrafico(carregar());
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = dataInput.value;
    const peso = parseFloat(valorInput.value.replace(',', '.'));
    if (!data) return;
    if (isNaN(peso) || peso < 20 || peso > 400) {
      alert('Informe um peso válido entre 20 e 400 kg.');
      return;
    }
    const atual = carregar().filter(d => d.data !== data);
    atual.push({ data, peso });
    salvar(atual);
    valorInput.value = '';
    dataInput.value = hoje;
    atualizar();
  });

  btnExport.addEventListener('click', () => {
    const dados = carregar();
    if (!dados.length) { alert('Sem registros para exportar.'); return; }
    const ordenado = [...dados].sort((a, b) => a.data.localeCompare(b.data));
    const linhas = ['data,peso_kg'];
    ordenado.forEach(d => linhas.push(`${d.data},${d.peso.toFixed(1)}`));
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alimente-melhor-peso.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  btnLimparTudo.addEventListener('click', () => {
    if (confirm('Isso vai apagar TODO o seu histórico de peso deste dispositivo. Tem certeza?')) {
      localStorage.removeItem(KEY);
      atualizar();
    }
  });

  atualizar();
})();

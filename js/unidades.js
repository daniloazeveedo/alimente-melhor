/* ============================================================
   Busca de unidades de saúde
   - Aceita CEP (consulta ViaCEP → bairro/logradouro)
   - Aceita nome de bairro, unidade ou rua (busca textual)
   - Filtra a lista e destaca os resultados
   ============================================================ */

(function () {
  'use strict';

  const buscaInput = document.getElementById('busca');
  const buscaError = document.getElementById('busca-error');
  const btnLimpar = document.getElementById('btn-limpar');
  const resumoEl = document.getElementById('resumo');
  const listaEl = document.getElementById('lista-unidades');
  const filtroTipoEl = document.getElementById('filtro-tipo');
  const atualizadoEl = document.getElementById('atualizado-em');

  let dados = null;

  // Remove acentos e passa pra minúsculo — pra comparação
  function normalizar(str) {
    return (str || '').toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim();
  }

  // Detecta se a entrada parece um CEP
  function ehCep(str) {
    const digitos = (str || '').replace(/\D/g, '');
    return digitos.length === 8;
  }

  // Consulta ViaCEP → retorna { bairro, logradouro, localidade } ou null
  async function consultarCep(cep) {
    const digitos = cep.replace(/\D/g, '');
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      if (!resp.ok) return null;
      const json = await resp.json();
      if (json.erro) return null;
      return {
        bairro: json.bairro || '',
        logradouro: json.logradouro || '',
        localidade: json.localidade || ''
      };
    } catch (e) {
      return null;
    }
  }

  // Junta USF + UBS + outros num array com marcador de tipo
  function todasAsUnidades() {
    const arr = [];
    (dados.usf || []).forEach(u => arr.push({ ...u, tipo: 'USF' }));
    (dados.ubs || []).forEach(u => arr.push({ ...u, tipo: 'UBS' }));
    (dados.outros || []).forEach(u => arr.push({ ...u, tipo: u.tipo || 'Outro' }));
    return arr;
  }

  // Retorna score de match: quanto maior, mais relevante
  function pontuar(unidade, termos) {
    if (!termos.length) return 0;
    const alvo = normalizar(
      [unidade.nome, unidade.endereco, unidade.tipo].filter(Boolean).join(' ')
    );
    let score = 0;
    for (const t of termos) {
      if (!t) continue;
      if (normalizar(unidade.nome).includes(t)) score += 10;
      if (alvo.includes(t)) score += 3;
      // Match parcial (primeiras 4 letras)
      if (t.length >= 4 && alvo.includes(t.substring(0, 4))) score += 1;
    }
    return score;
  }

  // Renderiza uma unidade
  function renderUnidade(u) {
    const tem = v => v && v.trim();
    const responsaveis = [];
    if (tem(u.enfermeiro)) responsaveis.push(`<div class="resp-item"><span class="resp-cargo">Enfermeiro(a)</span><span class="resp-nome">${u.enfermeiro}</span></div>`);
    if (tem(u.medico)) responsaveis.push(`<div class="resp-item"><span class="resp-cargo">Médico(a)</span><span class="resp-nome">${u.medico}</span></div>`);
    if (tem(u.dentista)) responsaveis.push(`<div class="resp-item"><span class="resp-cargo">Dentista</span><span class="resp-nome">${u.dentista}</span></div>`);

    const observacao = u.observacao
      ? `<p class="unidade-obs">${u.observacao}</p>`
      : '';

    const email = tem(u.email)
      ? `<a href="mailto:${u.email}" class="unidade-link">${u.email}</a>`
      : '';

    const telHref = (u.telefone || '').split('/')[0].replace(/\D/g, '');

    return `
      <article class="unidade-card">
        <div class="unidade-header">
          <span class="unidade-tag tipo-${u.tipo.toLowerCase().replace(/[^a-z]/g, '')}">${u.tipo}</span>
          <h3 class="unidade-nome">${u.nome}</h3>
        </div>

        <div class="unidade-info">
          <div class="info-linha">
            <span class="info-label">Endereço</span>
            <span class="info-valor">${u.endereco || '—'}</span>
          </div>
          <div class="info-linha">
            <span class="info-label">Telefone</span>
            <span class="info-valor">
              ${telHref ? `<a href="tel:${telHref}" class="unidade-link">${u.telefone}</a>` : (u.telefone || '—')}
            </span>
          </div>
          ${email ? `
          <div class="info-linha">
            <span class="info-label">E-mail</span>
            <span class="info-valor">${email}</span>
          </div>` : ''}
        </div>

        ${responsaveis.length ? `
          <div class="unidade-responsaveis">
            <h4>Equipe de referência</h4>
            <div class="resp-grid">${responsaveis.join('')}</div>
          </div>
        ` : ''}

        ${observacao}
      </article>
    `;
  }

  // Renderiza a lista
  function renderizar(resultados, contexto) {
    if (!resultados.length) {
      resumoEl.innerHTML = `<p class="sem-resultados">Nenhuma unidade encontrada para a sua busca. Tente outro termo, ou <button type="button" class="link-btn" id="mostrar-todas">veja todas as unidades</button>.</p>`;
      listaEl.innerHTML = '';
      const btn = document.getElementById('mostrar-todas');
      if (btn) btn.addEventListener('click', () => { buscaInput.value = ''; aplicarBusca(); });
      return;
    }

    resumoEl.innerHTML = contexto || `<p class="contagem">${resultados.length} ${resultados.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}.</p>`;
    listaEl.innerHTML = resultados.map(renderUnidade).join('');
  }

  // Aplica filtro de tipo (USF/UBS/todos)
  function filtrarPorTipo(lista) {
    const tipo = filtroTipoEl.value;
    if (tipo === 'todos') return lista;
    if (tipo === 'usf') return lista.filter(u => u.tipo === 'USF');
    if (tipo === 'ubs') return lista.filter(u => u.tipo === 'UBS');
    if (tipo === 'outros') return lista.filter(u => u.tipo !== 'USF' && u.tipo !== 'UBS');
    return lista;
  }

  // Busca principal
  async function aplicarBusca() {
    if (!dados) return;
    buscaError.textContent = '';

    const termo = buscaInput.value.trim();
    let todas = filtrarPorTipo(todasAsUnidades());

    // Sem termo → mostrar todas
    if (!termo) {
      todas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      renderizar(todas, `<p class="contagem">Mostrando todas as ${todas.length} unidades. Digite acima para buscar por CEP, bairro ou nome.</p>`);
      return;
    }

    // Se é CEP, consulta ViaCEP
    if (ehCep(termo)) {
      resumoEl.innerHTML = `<p class="contagem">Consultando o CEP…</p>`;
      const info = await consultarCep(termo);
      if (!info) {
        buscaError.textContent = 'CEP não encontrado. Confira o número e tente de novo.';
        renderizar([], '');
        return;
      }
      const termosBusca = [normalizar(info.bairro), normalizar(info.logradouro)].filter(Boolean);
      const pontuadas = todas
        .map(u => ({ u, s: pontuar(u, termosBusca) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map(x => x.u);

      const cabecalho = `
        <p class="contagem">
          <strong>CEP ${termo}</strong> — bairro <strong>${info.bairro || '—'}</strong>, ${info.logradouro || 'endereço não informado'}.
        </p>
        <p class="dica">${pontuadas.length ? 'Unidades ordenadas por proximidade textual com o seu bairro.' : 'Nenhuma unidade encontrada nesse bairro exato. Mostrando todas para você escolher.'}</p>
      `;
      renderizar(pontuadas.length ? pontuadas : todas, cabecalho);
      return;
    }

    // Busca textual comum
    const termos = normalizar(termo).split(/\s+/).filter(Boolean);
    const pontuadas = todas
      .map(u => ({ u, s: pontuar(u, termos) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.u);

    renderizar(pontuadas);
  }

  // Inicialização
  async function inicializar() {
    try {
      const resp = await fetch('data/unidades.json');
      dados = await resp.json();
      atualizadoEl.textContent = dados.atualizado_em || '';
      aplicarBusca();
    } catch (e) {
      resumoEl.innerHTML = `<p class="sem-resultados">Não foi possível carregar a lista de unidades. Recarregue a página.</p>`;
    }
  }

  // Eventos
  let timer;
  buscaInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(aplicarBusca, 300);
  });

  filtroTipoEl.addEventListener('change', aplicarBusca);

  btnLimpar.addEventListener('click', () => {
    buscaInput.value = '';
    buscaInput.focus();
    aplicarBusca();
  });

  inicializar();
})();

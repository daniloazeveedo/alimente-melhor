/* ============================================================
   Favoritar receitas — localStorage
   ============================================================ */

(function () {
  'use strict';

  const KEY = 'alimentemelhor:favoritos:v1';

  function carregar() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function salvar(ids) {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) {}
  }

  function toggle(id) {
    const atual = carregar();
    const i = atual.indexOf(id);
    if (i >= 0) atual.splice(i, 1);
    else atual.push(id);
    salvar(atual);
    return atual.includes(id);
  }

  function estaFavoritada(id) {
    return carregar().includes(id);
  }

  // Adiciona botão de favoritar em cada card
  function decorarCards() {
    const cards = document.querySelectorAll('.recipe-card');
    cards.forEach((card, i) => {
      const id = card.dataset.id || `receita-${i}`;
      card.dataset.id = id;
      if (card.querySelector('.fav-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fav-btn';
      btn.setAttribute('aria-label', 'Favoritar receita');
      btn.innerHTML = svgHeart(estaFavoritada(id));

      // Colocar no topo do card, canto direito
      card.style.position = 'relative';
      card.appendChild(btn);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const agora = toggle(id);
        btn.innerHTML = svgHeart(agora);
        btn.classList.toggle('ativo', agora);
        aplicarFiltro();
      });

      if (estaFavoritada(id)) btn.classList.add('ativo');
    });
  }

  function svgHeart(preenchido) {
    if (preenchido) {
      return `<svg width="22" height="22" viewBox="0 1 24 22" fill="#ff5406" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10z"/></svg>`;
    }
    return `<svg width="22" height="22" viewBox="0 1 24 22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10z"/></svg>`;
  }

  function aplicarFiltro() {
    const filtro = document.getElementById('receitas-filtro');
    if (!filtro) return;
    const soFav = filtro.value === 'favoritas';
    const favs = carregar();

    document.querySelectorAll('.recipe-card').forEach(card => {
      const id = card.dataset.id;
      const mostrar = !soFav || favs.includes(id);
      card.style.display = mostrar ? '' : 'none';
    });

    const grid = document.querySelector('.recipe-grid');
    if (soFav && !favs.length && grid) {
      let vazio = grid.querySelector('.favoritas-vazio');
      if (!vazio) {
        vazio = document.createElement('p');
        vazio.className = 'favoritas-vazio';
        vazio.style.cssText = 'grid-column: 1/-1; text-align: center; padding: var(--space-4); color: var(--color-graphite); opacity: 0.6;';
        vazio.textContent = 'Você ainda não favoritou nenhuma receita. Toque no coração de uma receita para começar.';
        grid.appendChild(vazio);
      }
      vazio.style.display = '';
    } else {
      const vazio = document.querySelector('.favoritas-vazio');
      if (vazio) vazio.style.display = 'none';
    }
  }

  function inicializar() {
    decorarCards();
    const filtro = document.getElementById('receitas-filtro');
    if (filtro) {
      filtro.addEventListener('change', aplicarFiltro);
      aplicarFiltro();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
})();

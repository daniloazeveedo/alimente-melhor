/* ============================================================
   Menu mobile + Botão flutuante de WhatsApp
   ============================================================ */

(function () {
  'use strict';

  const TEMA_KEY = 'alimentemelhor:theme';

  const iconeSol = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="2"/><path d="M12 2v2.5 M12 19.5V22 M4.2 4.2l1.8 1.8 M18 18l1.8 1.8 M2 12h2.5 M19.5 12H22 M4.2 19.8L6 18 M18 6l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const iconeLua = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

  function temaDoSistema() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function temaEfetivo() {
    try {
      const salvo = localStorage.getItem(TEMA_KEY);
      if (salvo === 'light' || salvo === 'dark') return salvo;
    } catch (e) {}
    return temaDoSistema();
  }

  function aplicarTema(tema) {
    document.body.classList.remove('force-light', 'force-dark');
    document.body.classList.add(tema === 'dark' ? 'force-dark' : 'force-light');
  }

  function injetarToggleTema() {
    const container = document.querySelector('.site-header .container');
    if (!container) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';

    function atualizarBotao() {
      const atual = temaEfetivo();
      btn.innerHTML = atual === 'dark' ? iconeSol : iconeLua;
      btn.setAttribute('aria-label', atual === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    }

    let salvo = null;
    try { salvo = localStorage.getItem(TEMA_KEY); } catch (e) {}
    if (salvo === 'light' || salvo === 'dark') aplicarTema(salvo);

    atualizarBotao();

    btn.addEventListener('click', () => {
      const novo = temaEfetivo() === 'dark' ? 'light' : 'dark';
      aplicarTema(novo);
      try { localStorage.setItem(TEMA_KEY, novo); } catch (e) {}
      atualizarBotao();
    });

    const referencia = container.querySelector('.btn-filled');
    if (referencia) container.insertBefore(btn, referencia);
    else container.appendChild(btn);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        let temPreferenciaSalva = false;
        try { temPreferenciaSalva = !!localStorage.getItem(TEMA_KEY); } catch (e) {}
        if (!temPreferenciaSalva) atualizarBotao();
      });
    }
  }

  function injetarMenuMobile() {
    const container = document.querySelector('.site-header .container');
    if (!container) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mobile-menu-toggle';
    btn.setAttribute('aria-label', 'Abrir menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';

    const btnFilled = container.querySelector('.btn-filled');
    if (btnFilled) container.insertBefore(btn, btnFilled);
    else container.appendChild(btn);

    const nav = container.querySelector('.site-nav');
    if (!nav) return;

    btn.addEventListener('click', () => {
      const aberto = nav.classList.toggle('mobile-open');
      btn.classList.toggle('open', aberto);
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function injetarBotaoCompartilhar() {
    if (document.body.dataset.noShare === 'true') return;

    const btn = document.createElement('a');
    btn.className = 'share-fab';
    btn.href = 'https://wa.me/?text=' + encodeURIComponent(
      'Achei esse site com dicas de alimentação saudável, calculadora de IMC e lista de UBSs de Marília. É grátis e feito pela FATEC: ' + location.origin + location.pathname.replace(/[^/]*$/, '')
    );
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Compartilhar por WhatsApp');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Enviar por WhatsApp
    `;
    document.body.appendChild(btn);
  }

  function inicializar() {
    injetarToggleTema();
    injetarMenuMobile();
    injetarBotaoCompartilhar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
})();

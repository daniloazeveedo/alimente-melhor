/* ============================================================
   Onboarding — navegação entre telas de boas-vindas
   ============================================================ */

(function () {
  'use strict';

  const KEY = 'alimentemelhor:onboarding-visto';

  const screens = Array.from(document.querySelectorAll('.onb-screen'));
  const fill = document.getElementById('onb-progress-fill');
  const nextBtn = document.getElementById('onb-next-btn');
  const backBtn = document.getElementById('onb-back-btn');
  const skipBtn = document.getElementById('onb-skip-btn');

  let passo = 0;

  function renderizar() {
    screens.forEach((tela, i) => tela.classList.toggle('active', i === passo));
    fill.style.width = (((passo + 1) / screens.length) * 100) + '%';
    backBtn.style.visibility = passo === 0 ? 'hidden' : 'visible';

    const label = passo === screens.length - 1 ? 'Começar agora' : 'Continuar';
    nextBtn.innerHTML = label + ' <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14 M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function finalizar() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    window.location.href = 'index.html';
  }

  nextBtn.addEventListener('click', () => {
    if (passo === screens.length - 1) { finalizar(); return; }
    passo++;
    renderizar();
  });

  backBtn.addEventListener('click', () => {
    if (passo > 0) { passo--; renderizar(); }
  });

  skipBtn.addEventListener('click', finalizar);

  renderizar();
})();

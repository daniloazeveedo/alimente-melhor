/* ============================================================
   Rotação das frases do hero
   Troca a palavra ativa a cada 2,8 segundos com fade
   ============================================================ */

(function () {
  'use strict';

  const words = document.querySelectorAll('.rotating-word .word');
  if (words.length < 2) return;

  let current = 0;
  setInterval(() => {
    words[current].classList.remove('active');
    current = (current + 1) % words.length;
    words[current].classList.add('active');
  }, 2800);
})();

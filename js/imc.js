/* ============================================================
   Calculadora de IMC
   Classificação segundo OMS
   ============================================================ */

(function () {
  'use strict';

  const form = document.getElementById('imc-form');
  const pesoInput = document.getElementById('peso');
  const alturaInput = document.getElementById('altura');
  const errorEl = document.getElementById('form-error');
  const resultCard = document.getElementById('result-card');
  const imcValueEl = document.getElementById('imc-value');
  const classificationEl = document.getElementById('classification');
  const messageEl = document.getElementById('result-message');

  // Classificações OMS + cores da paleta Foodnoms
  // Regra: verde = positivo, laranja/vermelho = alerta escalonado
  const faixas = [
    {
      max: 18.5,
      nome: 'Abaixo do peso',
      cor: 'color-blue',
      mensagem: 'Seu IMC está abaixo da faixa considerada saudável. É importante procurar orientação de um profissional para avaliar se há necessidade de ajustes na alimentação.'
    },
    {
      max: 25,
      nome: 'Peso saudável',
      cor: 'color-green',
      mensagem: 'Seu IMC está na faixa saudável. Continue com uma alimentação equilibrada, baseada em comida de verdade, e mantenha-se ativo no dia a dia.'
    },
    {
      max: 30,
      nome: 'Sobrepeso',
      cor: 'color-orange',
      mensagem: 'Seu IMC indica sobrepeso. Pequenas mudanças no dia a dia — mais frutas, verduras e menos ultraprocessados — já fazem diferença. Considere procurar a UBS mais próxima para orientação.'
    },
    {
      max: 35,
      nome: 'Obesidade grau I',
      cor: 'color-red-orange',
      mensagem: 'Seu IMC indica obesidade grau I. Recomendamos procurar acompanhamento na UBS mais próxima. Um nutricionista e um médico podem ajudar a montar um plano seguro e eficaz para você.'
    },
    {
      max: 40,
      nome: 'Obesidade grau II',
      cor: 'color-red-orange',
      mensagem: 'Seu IMC indica obesidade grau II. É muito importante buscar acompanhamento médico e nutricional. O SUS oferece esse atendimento gratuitamente na sua UBS.'
    },
    {
      max: Infinity,
      nome: 'Obesidade grau III',
      cor: 'color-red',
      mensagem: 'Seu IMC indica obesidade grau III (também chamada de mórbida). Procure a UBS mais próxima o quanto antes para iniciar acompanhamento. Tratamento é possível e faz diferença na sua saúde.'
    }
  ];

  function classificar(imc) {
    return faixas.find(f => imc < f.max);
  }

  function limparClasses(el) {
    el.classList.remove('color-blue', 'color-green', 'color-orange', 'color-red-orange', 'color-red');
  }

  function showError(msg) {
    errorEl.textContent = msg;
    resultCard.classList.remove('visible');
  }

  function clearError() {
    errorEl.textContent = '';
  }

  // Limpa erro ao editar
  [pesoInput, alturaInput].forEach(input => {
    input.addEventListener('input', clearError);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const peso = parseFloat(pesoInput.value.replace(',', '.'));
    const alturaStr = alturaInput.value.replace(',', '.');
    let altura = parseFloat(alturaStr);

    // Aceita altura em cm (ex: 172) e converte
    if (altura > 3) altura = altura / 100;

    if (isNaN(peso) || peso <= 0 || peso > 500) {
      showError('Informe um peso válido em quilos.');
      pesoInput.focus();
      return;
    }

    if (isNaN(altura) || altura < 0.5 || altura > 2.5) {
      showError('Informe uma altura válida em metros (ex: 1,72).');
      alturaInput.focus();
      return;
    }

    clearError();

    const imc = peso / (altura * altura);
    const imcArredondado = imc.toFixed(1).replace('.', ',');
    const faixa = classificar(imc);

    // Atualiza resultado
    imcValueEl.textContent = imcArredondado;
    limparClasses(imcValueEl);
    imcValueEl.classList.add(faixa.cor);

    classificationEl.textContent = faixa.nome;
    limparClasses(classificationEl);
    classificationEl.classList.add(faixa.cor);

    messageEl.textContent = faixa.mensagem;

    resultCard.classList.add('visible');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();

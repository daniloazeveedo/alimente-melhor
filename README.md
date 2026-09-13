# Alimente Melhor

Site + PWA educativo sobre alimentação saudável, com foco no combate à obesidade.
Projeto Interdisciplinar 2 — 2º termo — 2º semestre 2026 — FATEC Marília.

## O que tem

- **Landing** (`index.html`) — apresentação do projeto
- **Calculadora de IMC** (`calculadora.html`) — cálculo funcional com classificação OMS e cores por faixa
- **Receitas** (`receitas.html`) — 6 pratos saudáveis, simples e baratos
- **Guia alimentar** (`guia.html`) — os 10 passos do Guia Alimentar do Ministério da Saúde
- **PWA** — funciona offline depois da primeira visita, pode ser adicionado à tela inicial do celular como app

## Estrutura

```
alimente-melhor/
├── index.html
├── calculadora.html
├── receitas.html
├── guia.html
├── manifest.json          # config PWA
├── sw.js                  # service worker (cache offline)
├── css/
│   ├── variables.css      # tokens (cores, tipografia, spacing)
│   └── style.css          # estilos
├── js/
│   └── imc.js             # lógica da calculadora
└── assets/icons/
    ├── icon.svg
    ├── icon-192.png
    └── icon-512.png
```

## Como rodar localmente

Precisa servir por HTTP (o service worker não funciona em `file://`):

```bash
# Opção 1 — Python
cd alimente-melhor
python3 -m http.server 8000

# Opção 2 — Node
npx serve alimente-melhor
```

Depois abra `http://localhost:8000`.

## Como publicar no GitHub Pages (grátis)

1. Cria um repositório no GitHub chamado `alimente-melhor`
2. Sobe os arquivos:
   ```bash
   cd alimente-melhor
   git init
   git add .
   git commit -m "primeira versão"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/alimente-melhor.git
   git push -u origin main
   ```
3. No repositório: **Settings → Pages → Source: main branch → Save**
4. Em alguns minutos o site fica no ar em: `https://SEU-USUARIO.github.io/alimente-melhor/`
5. Gere o QR code desse endereço em qualquer gerador (ex: qrcode.com) e coloque no banner

## Sistema de design

Baseado no guia de estilo Foodnoms:

- **Cores**: paleta fechada em `css/variables.css`
- **Tipografia**: Nunito Sans (substituto oficial de Aquawax Pro)
- **Border radius**: 26px em todo botão, card, input, tag
- **Zero sombra, zero gradiente** — sistema flat
- **Padrão two-tone** nos headlines: cor de resultado + Graphite

## Uso das cores no IMC (regra do sistema)

- **Verdant Green** (`#00b33f`) — peso saudável
- **Sky Blue** (`#00a9dd`) — abaixo do peso
- **Sunset Orange** (`#ff6d00`) — sobrepeso
- **Signal Red-Orange** (`#ff3400`) — obesidade grau I e II
- **Alert Red** (`#ff001e`) — obesidade grau III

## Aviso importante

Todo o conteúdo é educativo. O site NÃO oferece prescrição de dietas ou
planos individualizados — isso é atribuição exclusiva de nutricionistas
(CRN) e médicos (CRM). O site sempre direciona o usuário à UBS mais
próxima para acompanhamento profissional pelo SUS.

## Créditos e referências

- Ministério da Saúde. **Guia Alimentar para a População Brasileira**. 2ª ed. Brasília, 2014.
- Pesquisa Vigitel 2025 — Ministério da Saúde
- Sistema de estilo baseado em Foodnoms (design tokens fornecidos pelo grupo)

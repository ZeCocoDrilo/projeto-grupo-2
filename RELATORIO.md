# Relatório de correções — Career Dreamer

Todas as 13 issues do `ISSUES.md` foram resolvidas. Abaixo estão os erros encontrados (incluindo alguns que não estavam nas issues), a correção aplicada, as melhorias e como tudo foi testado.

## 1. Erros encontrados e correções

| Issue | Erro encontrado | Causa no código | Correção |
|---|---|---|---|
| #01 | Botão não faz nada | `<button type="button">` nunca dispara o evento `submit` | Trocado para `type="submit"` |
| #02 | Nome só aceita números | `<input type="number">` | `type="text"`, `required`, `minlength="2"`, `maxlength="60"`, `autocomplete="name"`. O JS também confere o nome sem espaços nas pontas (espaços passam no `required`) |
| #03 | Formulário espremido, botão gigante | `.formulario` com `flex-direction: row` | `flex-direction: column` e `.formulario .botao { width: 100% }` |
| #04 | Página minúscula no celular | Faltava `<meta name="viewport">` no `index.html` | Meta viewport adicionada (a `resultado.html` já tinha) |
| #04 | Rolagem horizontal | `.container { width: 960px }` fixo | `width: min(960px, 100% - 2rem)` |
| #05 | Chrome oferece traduzir do inglês | `<html lang="en">` | `lang="pt-BR"` |
| #06 | Erros de português | "Vocasional", "interêsses" (2x) | "Vocacional", "interesses". Demais textos revisados |
| #07 | Rótulos quase invisíveis | `.campo label { color: #cfd3e3 }` em fundo branco (contraste ≈ 1,5:1) | `color: var(--cor-tinta)` (≈ 15:1, bem acima do mínimo de 4,5:1 da WCAG AA) |
| #08 | Clicar no rótulo não foca o campo | `<label>` sem `for` e inputs com `id` sem rótulo associado | `label for="nome/hobbies/interesses"` |
| #08 | Teclado: sem indicação de foco | `*:focus { outline: none }` | Removido; criado `:focus-visible` com contorno de 3 px (links, botões, campos) |
| #09 | Página sem estrutura | Só `div`s | `header`, `main`, `footer`, `section`, `h1`, `h2`, `ol/li` para os passos, `p` para textos e dicas. Os seletores CSS existentes já cobriam essas tags, então o visual ficou igual |
| #10 | Formulário aceita vazio / só vírgulas | `split(',')` sem limpeza; `length === 0` nunca é verdadeiro | `split` + `trim` + `filter`; campos `required`; se não sobrar item, aviso no próprio campo (`setCustomValidity` + `reportValidity`) |
| #11 | `alert()` feio | `alert('Tente mais tarde')` | `<dialog>` nativo estilizado (classes `.modal` que já existiam no CSS), título "Tente mais tarde", botão "Entendi", fecha com Esc |
| #12 | Sem integração com a API | Havia só um TODO | `fetch` POST em `CONFIG.API_URL`; modal se a URL estiver vazia; botão desabilitado com "Analisando seu perfil..." durante o envio; timeout de `CONFIG.TEMPO_LIMITE_MS`; erro/timeout mostram modal sem apagar o formulário; sucesso grava no `sessionStorage` e vai para `resultado.html` |
| #13 | Resultado em branco | `resultado.js` só tinha TODOs | Implementado: lê `?exemplo` ou `sessionStorage`; mostra nome e síntese; ordena por `match_score` (maior primeiro); clona o `<template>`; barra, etiquetas, roteiro numerado; selo "Melhor combinação" na primeira; mensagem amigável com botão de voltar quando não há dados |

### Erros extras (não estavam nas issues)

- **`config.js`**: aspa simples solta no comentário (`...abaixo.'`). Removida.
- **Cabeçalho da `resultado.html` no celular**: marca + botão "Novo mapeamento" (sem quebra de linha) estouravam 25 px para a direita em 360 px. Adicionado `flex-wrap: wrap` em `.topo__conteudo`. Foi pego só nos testes.
- **Placeholder com contraste insuficiente**: `#6e7590` sobre o fundo dos campos dava ≈ 4,25:1. Trocado por `#5f6680` (≈ 5,3:1).
- **Dicas dos campos** não estavam ligadas aos campos: adicionado `aria-describedby`, então o leitor de tela lê "Separe cada hobby com vírgula".
- **Estrutura de pastas**: os arquivos chegaram soltos, mas o HTML referencia `css/` e `js/`. Reorganizei como descrito no README.

## 2. Melhorias aplicadas

- Validação com recursos nativos do HTML5, como pede o README, com JS só para o que o HTML não cobre (itens vazios entre vírgulas, nome só com espaços).
- Proteção contra envio duplicado: além de desabilitar o botão, o `submit` é ignorado enquanto há requisição em andamento (testado forçando um segundo envio: a API recebeu 1 chamada).
- Resposta da API validada (`recommended_careers` precisa ser lista); formato inesperado vira erro tratado, e não uma tela quebrada.
- Textos da API inseridos com `textContent`, nunca `innerHTML`. Testado com `<b>` no título: aparece como texto.
- `match_score` limitado a 0–100; ordenação em cópia do array.
- `aria-busy` no formulário durante o envio; `aria-hidden` nos elementos decorativos; modal com `aria-labelledby/describedby`.
- Código com `const`, arrow functions, `async/await`, template strings e nomes em português, conforme o README. Sem dependências novas (KISS/YAGNI).

## 3. Como foi testado

Testes automatizados em Chromium (Playwright), em 360 px e 1280 px:

- Sem rolagem horizontal no celular, nas duas páginas.
- Campos em coluna, botão com a largura total do cartão, rótulos com a cor escura, clique no rótulo foca o campo, contorno de foco aparece.
- Hobbies `, , ,` bloqueia o envio e avisa no campo; nome com 1 letra é bloqueado.
- Com `API_URL` vazia: modal "Tente mais tarde", fecha com Esc, dados preservados.
- API simulada: sucesso (corpo enviado limpo e aparado, redireciona, resultado ordenado), erro 500 e timeout (modal, botão reabilitado, dados mantidos).
- `resultado.html?exemplo`: 4 carreiras (97, 89, 82, 74 %), 1 selo, 5 etiquetas e 4 passos na primeira; `resultado.html` sem dados mostra a mensagem amigável.
- Nenhum erro de JavaScript no console.

## 4. O que não foi verificado

- **Lighthouse e leitor de tela reais** não foram executados; a conformidade de acessibilidade foi conferida pela estrutura e por cálculo de contraste, não pela ferramenta. Vale rodar o Lighthouse (F12) antes de entregar.
- **API real**: sem URL, testei com um servidor simulado seguindo o "Contrato da API" do README. Falta testar com o backend de verdade (atenção a CORS e ao "despertar" de ~1 min em plano gratuito).
- As mensagens de validação nativas (ex.: tamanho mínimo do nome) aparecem no idioma do navegador da pessoa.
- Não havia repositório git, então não criei commits. Sugestão de mensagens: `fix #01: botão passa a enviar o formulário`, e assim por diante.

## 5. Para ativar a API

Edite `js/config.js` e preencha `API_URL` com o endereço completo do endpoint.

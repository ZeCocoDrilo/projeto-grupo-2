/**
 * Página de resultado (resultado.html).
 *
 * Lê o JSON que a API devolveu (salvo no sessionStorage pelo formulário)
 * e mostra o perfil na tela.
 * Para testar SEM o backend, abra: resultado.html?exemplo
 */
const secaoResultado = document.querySelector('#resultado');
const secaoSemResultado = document.querySelector('#sem-resultado');
const modeloCarreira = document.querySelector('#modelo-carreira');
const listaCarreiras = document.querySelector('#lista-carreiras');

/** Descobre de onde vêm os dados: exemplo (?exemplo) ou sessionStorage. */
const obterDados = () => {
  if (new URLSearchParams(window.location.search).has('exemplo')) {
    return DADOS_EXEMPLO;
  }
  try {
    return JSON.parse(sessionStorage.getItem(CONFIG.CHAVE_RESULTADO));
  } catch {
    return null;
  }
};

const dadosSaoValidos = (dados) =>
  Boolean(dados) &&
  typeof dados.user_name === 'string' &&
  Array.isArray(dados.recommended_careers) &&
  dados.recommended_careers.length > 0;

/** Preenche uma lista (<ul>/<ol>) com um <li> para cada texto. */
const preencherLista = (lista, textos = []) => {
  textos.forEach((texto) => {
    const item = document.createElement('li');
    item.textContent = texto;
    lista.append(item);
  });
};

/** Cria o card de uma carreira a partir do <template>. */
const criarCartaoCarreira = (carreira, ehPrimeira) => {
  const cartao = modeloCarreira.content.firstElementChild.cloneNode(true);
  const nota = Math.min(100, Math.max(0, Number(carreira.match_score) || 0));

  cartao.querySelector('.carreira__titulo').textContent = carreira.title;
  cartao.querySelector('.carreira__percentual').textContent = `${nota}%`;
  cartao.querySelector('.carreira__resumo').textContent = carreira.summary;
  preencherLista(cartao.querySelector('.chips'), carreira.key_skills);
  preencherLista(cartao.querySelector('.roteiro'), carreira.learning_path);

  if (ehPrimeira) {
    cartao.classList.add('carreira--principal');
    cartao.querySelector('.carreira__selo').hidden = false;
  }

  // A largura é aplicada depois de inserir na página para a barra animar.
  const barra = cartao.querySelector('.barra__nivel');
  requestAnimationFrame(() => barra.style.setProperty('--nivel', `${nota}%`));

  return cartao;
};

const mostrarResultado = (dados) => {
  document.querySelector('#nome-usuario').textContent = dados.user_name;
  document.querySelector('#sintese').textContent = dados.career_identity_statement ?? '';

  // Da mais compatível para a menos compatível (sem alterar o array original).
  const carreiras = [...dados.recommended_careers].sort(
    (a, b) => b.match_score - a.match_score
  );
  carreiras.forEach((carreira, indice) => {
    listaCarreiras.append(criarCartaoCarreira(carreira, indice === 0));
  });

  secaoResultado.hidden = false;
};

const dados = obterDados();
if (dadosSaoValidos(dados)) {
  mostrarResultado(dados);
} else {
  secaoSemResultado.hidden = false;
}

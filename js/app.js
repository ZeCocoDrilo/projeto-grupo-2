/**
 * Página do formulário (index.html).
 * Valida os dados, envia para a API configurada em CONFIG.API_URL
 * e leva a pessoa para resultado.html.
 */
const formulario = document.querySelector('#form-perfil');
const botaoEnviar = formulario.querySelector('button[type="submit"]');
const modal = document.querySelector('#modal-aviso');
const modalMensagem = document.querySelector('#modal-mensagem');

const TEXTO_BOTAO = botaoEnviar.textContent;

/** Abre o modal "Tente mais tarde" com a mensagem informada. */
const abrirModal = (mensagem) => {
  modalMensagem.textContent = mensagem;
  modal.showModal();
};

/** Transforma "a, b, , c" em ["a", "b", "c"]: sem espaços sobrando e sem itens vazios. */
const separarLista = (texto) =>
  texto
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');

/**
 * Valida a lista de um campo. Se não sobrar nenhum item, avisa no próprio campo.
 * Retorna a lista limpa ou null quando inválida.
 */
const lerLista = (campo, nomeDoCampo) => {
  const lista = separarLista(campo.value);
  if (lista.length === 0) {
    campo.setCustomValidity(`Informe ao menos um item em ${nomeDoCampo}.`);
    campo.reportValidity();
    return null;
  }
  return lista;
};

/** Mostra ou esconde o estado de carregamento do botão. */
const definirCarregando = (carregando) => {
  botaoEnviar.disabled = carregando;
  botaoEnviar.textContent = carregando ? 'Analisando seu perfil...' : TEXTO_BOTAO;
  formulario.setAttribute('aria-busy', String(carregando));
};

/** Envia o perfil para a API e devolve o JSON da resposta. */
const enviarParaApi = async (perfil) => {
  const resposta = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil),
    signal: AbortSignal.timeout(CONFIG.TEMPO_LIMITE_MS),
  });

  if (!resposta.ok) {
    throw new Error(`A API respondeu com o status ${resposta.status}.`);
  }

  const dados = await resposta.json();
  if (!Array.isArray(dados.recommended_careers)) {
    throw new Error('A resposta da API veio em um formato inesperado.');
  }
  return dados;
};

// Limpa a mensagem de erro personalizada assim que a pessoa volta a digitar.
formulario.addEventListener('input', (evento) => {
  evento.target.setCustomValidity('');
});

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  // Evita clique duplo enquanto a requisição está em andamento.
  if (botaoEnviar.disabled) return;

  const { nome, hobbies, interesses } = formulario.elements;

  // Espaços em branco passam no "required" nativo, então conferimos o nome aparado.
  if (nome.value.trim().length < 2) {
    nome.setCustomValidity('Informe seu nome com pelo menos 2 letras.');
    nome.reportValidity();
    return;
  }

  const listaHobbies = lerLista(hobbies, 'Hobbies');
  if (!listaHobbies) return;

  const listaInteresses = lerLista(interesses, 'Áreas de interesse');
  if (!listaInteresses) return;

  const perfil = {
    name: nome.value.trim(),
    hobbies: listaHobbies,
    interests: listaInteresses,
  };

  if (!CONFIG.API_URL) {
    abrirModal('O serviço de análise ainda não está disponível. Volte em breve.');
    return;
  }

  definirCarregando(true);
  try {
    const resultado = await enviarParaApi(perfil);
    sessionStorage.setItem(CONFIG.CHAVE_RESULTADO, JSON.stringify(resultado));
    window.location.href = 'resultado.html';
  } catch (erro) {
    console.error('Falha ao consultar a API:', erro);
    const demorou = erro.name === 'TimeoutError';
    abrirModal(
      demorou
        ? 'O serviço demorou demais para responder. Seus dados continuam no formulário; tente novamente em instantes.'
        : 'Não foi possível gerar seu perfil agora. Seus dados continuam no formulário; tente novamente em instantes.'
    );
    definirCarregando(false);
  }
});

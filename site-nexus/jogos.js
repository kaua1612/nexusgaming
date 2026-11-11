// ---------- JOGOS GRÁTIS (GamerPower) ----------
const API_JOGOS = 'https://www.gamerpower.com/api/giveaways?type=game&sort-by=popularity';
const MAX_JOGOS = 39;
 
function formatarData(texto) {

  if (!texto || texto === 'N/A') return '';
  const data = new Date(texto.replace(' ', 'T'));
  return data.toLocaleDateString('pt-BR');
}
 
function criarCardJogo(jogo) {
  const card = document.createElement('div');
  card.className = 'card';
 
  const img = document.createElement('img');
  img.src = jogo.image || jogo.thumbnail;
  img.alt = jogo.title;
 
  const titulo = document.createElement('h3');
  titulo.textContent = jogo.title;
 
  const info = document.createElement('p');
  const partes = [jogo.platforms];
  if (jogo.worth && jogo.worth !== 'N/A') partes.push('Valor: ' + jogo.worth);
  const fim = formatarData(jogo.end_date);
  if (fim) partes.push('Até ' + fim);
  info.textContent = partes.join(' • ');
 
  const link = document.createElement('a');
  link.href = jogo.open_giveaway_url;
  link.textContent = 'Resgatar de graça';
  link.target = '_blank';
  link.rel = 'noopener';
 
  card.append(img, titulo, info, link);
  return card;
}
 
async function carregarJogosGratis() {
  const lista = document.getElementById('lista-jogos-gratis');
  if (!lista) return;
 
  lista.textContent = 'Carregando jogos grátis...';
 
  try {
    const resposta = await fetch(API_JOGOS);
    const jogos = await resposta.json();
 
    // Quando não há resultados, a API devolve um objeto em vez de uma lista
    if (!Array.isArray(jogos) || jogos.length === 0) {
      lista.textContent = 'Nenhum jogo grátis no momento.';
      return;
    }
 
    lista.textContent = '';
    jogos
      .filter(jogo => jogo.status === 'Active')
      .slice(0, MAX_JOGOS)
      .forEach(jogo => lista.appendChild(criarCardJogo(jogo)));
  } catch (erro) {
    console.error('Erro ao carregar jogos grátis:', erro);
    lista.textContent = 'Não foi possível carregar os jogos agora.';
  }
}
 
carregarJogosGratis();
setInterval(carregarJogosGratis, 1800000);
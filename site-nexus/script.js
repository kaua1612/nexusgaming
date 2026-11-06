// ---------- MENU ----------
function toggleMenu() {
  const body = document.body;
  const ehCelular = window.matchMedia('(max-width: 700px)').matches;
 
  if (ehCelular) {
    body.classList.toggle('menu-aberto');
  } else {
    body.classList.toggle('menu-fechado');
  }
}
 
// ---------- NOTÍCIAS AUTOMÁTICAS ----------
// Pra adicionar outro site, é só colocar o link do feed nesta lista
const FEEDS = [
  'https://br.ign.com/feed.xml',
  'https://meups.com.br/feed',
  'https://adrenaline.com.br/rss',
  'https://www.tecmundo.com.br/rss',
  'https://www.techtudo.com.br/rss.xml',
  'https://www.unrealengine.com/rss',
];
 
const MAX_NOTICIAS = 40;
 
function urlDaApi(feed) {
  return 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed);
}
 
// A description vem com HTML dentro, então pego só o texto
function extrairTexto(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return doc.body.textContent.trim();
}
 
// Cada site entrega a imagem de um jeito, então tento vários lugares
function extrairImagem(noticia) {
  if (noticia.enclosure?.link) return noticia.enclosure.link;
  if (noticia.thumbnail) return noticia.thumbnail;
 
  const html = noticia.content || noticia.description || '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  return img ? img.src : '';
}
 
function criarCard(noticia, fonte) {
  const card = document.createElement('div');
  card.className = 'card';
 
  const imagem = extrairImagem(noticia);
  if (imagem) {
    const img = document.createElement('img');
    img.src = imagem;
    img.alt = noticia.title;
    card.appendChild(img);
  }
 
  const titulo = document.createElement('h3');
  titulo.textContent = noticia.title;
 
  const resumo = document.createElement('p');
  const texto = extrairTexto(noticia.description);
  resumo.textContent = texto.length > 140 ? texto.slice(0, 140) + '...' : texto;
 
  const link = document.createElement('a');
  link.href = noticia.link;
  link.textContent = 'Ler matéria completa';
  link.target = '_blank';
  link.rel = 'noopener';
 
  card.append(titulo, resumo, link);
  return card;
}
 
async function buscarFeed(feed) {
  const resposta = await fetch(urlDaApi(feed));
  const dados = await resposta.json();
 
  if (dados.status !== 'ok') {
    throw new Error('Feed com erro: ' + feed);
  }
 
  return dados.items.map(item => ({ ...item, fonte: dados.feed.title }));
}
 
async function carregarNoticias() {
  const lista = document.getElementById('lista-noticias');
  if (!lista) return; // outras páginas não têm essa div
 
  lista.textContent = 'Carregando notícias...';
 
  // Busca todos os feeds juntos; se um falhar, os outros continuam
  const resultados = await Promise.allSettled(FEEDS.map(buscarFeed));
 
  const noticias = [];
  resultados.forEach((resultado, i) => {
    if (resultado.status === 'fulfilled') {
      noticias.push(...resultado.value);
    } else {
      console.error('Falha no feed ' + FEEDS[i] + ':', resultado.reason);
    }
  });
 
  if (noticias.length === 0) {
    lista.textContent = 'Não foi possível carregar as notícias agora.';
    return;
  }
 
  // Mais novas primeiro
  const data = n => new Date(n.pubDate.replace(' ', 'T')).getTime();
  noticias.sort((a, b) => data(b) - data(a));
 
  lista.textContent = '';
  noticias.slice(0, MAX_NOTICIAS).forEach(noticia => {
    lista.appendChild(criarCard(noticia));
  });
}
 
carregarNoticias();
setInterval(carregarNoticias,1800000);
 
/* ===== PARTE DO JUARY: BASE DO MENU (requisito 1) =====
   Abrir/fechar o menu, rodar o conteúdo e mostrar a secção escolhida. */

const toggleBtn = document.getElementById('menu-toggle');

function setMenu(open) {
  document.body.classList.toggle('show-nav', open);
  toggleBtn.setAttribute('aria-expanded', open);
  toggleBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

// Mostra apenas a secção indicada (item1, item2 ou item3)
function showSection(id) {
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.toggle('active', p.id === id);
  });
  window.scrollTo(0, 0);
  // Avisa os itens (ex.: Favoritos atualiza a lista ao ser aberto)
  document.dispatchEvent(new CustomEvent('section:shown', { detail: id }));
}

toggleBtn.addEventListener('click', () => {
  setMenu(!document.body.classList.contains('show-nav'));
});

document.querySelectorAll('.menu a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(link.dataset.target);
    setMenu(false);
  });
});

// Fechar com a tecla Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});


/* ===== PARTE DO JUARY: filmes e pesquisa =====
   API_URL e API_KEY vêm do config.js (nunca fazer commit desse ficheiro). */

const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
// Se o config.js não definir SEARCH_URL, constrói-se a partir da API_KEY
const SEARCH_API = (typeof SEARCH_URL !== 'undefined')
  ? SEARCH_URL
  : `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const mainTitle = document.getElementById('main-title');

// Guarda os filmes mostrados (usado pelos Favoritos)
window.movieCache = {};

async function getMovies(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    showMovies(data.results);
  } catch (error) {
    main.innerHTML = '<p>Erro ao carregar os filmes.</p>';
    console.error(error);
  }
}

function escapeHTML(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// Cria o cartão de um filme (também usado pelos Favoritos)
function createMovieCard(movie) {
  const { id, title, poster_path, vote_average, overview } = movie;

  const movieEl = document.createElement('div');
  movieEl.classList.add('movie');
  movieEl.dataset.id = id;
  movieEl.innerHTML = `
    <img src="${IMG_PATH + poster_path}" alt="${escapeHTML(title)}">
    <div class="movie-info">
      <h3>${escapeHTML(title)}</h3>
      <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
    </div>
    <div class="overview">
      <h3>Sinopse</h3>
      ${escapeHTML(overview || 'Sem sinopse disponível.')}
    </div>
  `;
  return movieEl;
}

function showMovies(movies) {
  main.innerHTML = '';

  const valid = movies.filter((movie) => movie.poster_path);
  if (valid.length === 0) {
    main.innerHTML = '<p>Nenhum filme encontrado.</p>';
    return;
  }

  valid.forEach((movie) => {
    window.movieCache[movie.id] = movie;
    main.appendChild(createMovieCard(movie));
  });
}

function getClassByRate(vote) {
  if (vote >= 8) return 'green';
  if (vote >= 5) return 'orange';
  return 'red';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const term = search.value.trim();
  showSection('item1'); // a pesquisa mostra sempre os resultados no Início
  if (term) {
    mainTitle.textContent = `Resultados para "${term}"`;
    getMovies(SEARCH_API + encodeURIComponent(term));
  } else {
    mainTitle.textContent = 'Filmes populares';
    getMovies(API_URL);
  }
});

getMovies(API_URL);

/* ===== PARTE DO JUARY: ITEM 1 (Início) ===== */
(function () {
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 20 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('saudacao').textContent = saudacao + '! Pronto para descobrir um filme?';

  document.getElementById('btn-populares').addEventListener('click', () => {
    document.getElementById('search').value = '';
    document.getElementById('main-title').textContent = 'Filmes populares';
    getMovies(API_URL);
  });
})();

/* ===== PARTE DO MARLEY: ITEM 2 (Favoritos, guardados no localStorage) ===== */
(function () {
  const KEY = 'movieweb_favoritos';
  const lista = document.getElementById('favoritos-lista');
  const vazio = document.getElementById('fav-vazio');
  const contador = document.getElementById('fav-count');
  const limpar = document.getElementById('fav-clear');

  function carregar() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function guardar(favs) {
    try {
      localStorage.setItem(KEY, JSON.stringify(favs));
    } catch (e) {
      console.error('Não foi possível guardar os favoritos', e);
    }
  }

  const eFavorito = (id) => carregar().some((m) => m.id === id);

  function alternar(movie) {
    let favs = carregar();
    if (favs.some((m) => m.id === movie.id)) {
      favs = favs.filter((m) => m.id !== movie.id);
    } else {
      favs.push(movie);
    }
    guardar(favs);
  }

  function atualizarBotao(btn) {
    const fav = eFavorito(Number(btn.dataset.id));
    btn.classList.toggle('active', fav);
    btn.title = fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    btn.innerHTML = fav
      ? '<i class="fa-solid fa-star"></i>'
      : '<i class="fa-regular fa-star"></i>';
  }

  function adicionarBotao(card) {
    if (card.querySelector('.fav-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fav-btn';
    btn.dataset.id = card.dataset.id;
    card.appendChild(btn);
    atualizarBotao(btn);
  }

  function desenharFavoritos() {
    const favs = carregar();
    lista.innerHTML = '';
    favs.forEach((movie) => {
      const card = createMovieCard(movie);
      adicionarBotao(card);
      lista.appendChild(card);
    });
    contador.textContent = favs.length;
    vazio.hidden = favs.length > 0;
    limpar.hidden = favs.length === 0;
  }

  // Clique na estrela (funciona nos resultados e na lista de favoritos)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const movie = window.movieCache[id] || carregar().find((m) => m.id === id);
    if (!movie) return;
    alternar(movie);
    document.querySelectorAll('#main .fav-btn').forEach(atualizarBotao);
    desenharFavoritos();
  });

  limpar.addEventListener('click', () => {
    if (confirm('Remover todos os favoritos?')) {
      guardar([]);
      document.querySelectorAll('#main .fav-btn').forEach(atualizarBotao);
      desenharFavoritos();
    }
  });

  // Sempre que aparecem novos filmes no Início, juntar-lhes a estrela
  new MutationObserver(() => {
    document.querySelectorAll('#main .movie').forEach(adicionarBotao);
  }).observe(document.getElementById('main'), { childList: true });

  document.addEventListener('section:shown', (e) => {
    if (e.detail === 'item2') desenharFavoritos();
  });

  desenharFavoritos();
})();

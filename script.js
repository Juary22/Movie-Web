const API_KEY = '1d390951604673f91df50355c99c78fb';
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const main = document.getElementById('main');

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

function showMovies(movies) {
  main.innerHTML = '';

  movies
    .filter((movie) => movie.poster_path)
    .forEach((movie) => {
      const { title, poster_path, vote_average, overview } = movie;

      const movieEl = document.createElement('div');
      movieEl.classList.add('movie');
      movieEl.innerHTML = `
        <img src="${IMG_PATH + poster_path}" alt="${title}">
        <div class="movie-info">
          <h3>${title}</h3>
          <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
        </div>
        <div class="overview">
          <h3>Sinopse</h3>
          ${overview || 'Sem sinopse disponível.'}
        </div>
      `;

      main.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
  if (vote >= 8) return 'green';
  if (vote >= 5) return 'orange';
  return 'red';
}

getMovies(API_URL);
// FR009: Fetch Pokémon List 
const pokemonListContainer = document.getElementById('pokemonList');

async function fetchPokemonList() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
    const data = await response.json();
    const pokemonArray = data.results;

    for (let pokemon of pokemonArray) {
      const res = await fetch(pokemon.url);
      const details = await res.json();
      displayPokemon(details);
    }
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
  }
}

function displayPokemon(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <p>HP: ${pokemon.stats[0].base_stat} | Attack: ${pokemon.stats[1].base_stat}</p>
  `;
  pokemonListContainer.appendChild(card);
}

fetchPokemonList();

// FR010: Search with Dialog
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

const dialog = document.createElement('dialog');
document.body.appendChild(dialog);

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.toLowerCase().trim();

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const pokemon = await response.json();

    dialog.innerHTML = `
      <h3>${pokemon.name}</h3>
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <p>HP: ${pokemon.stats[0].base_stat} | Attack: ${pokemon.stats[1].base_stat}</p>
      <button id="closeDialog">Close</button>
    `;
    dialog.showModal();

    document.getElementById('closeDialog').addEventListener('click', () => {
      dialog.close();
    });

  } catch (error) {
    dialog.innerHTML = `<p>${error.message}</p><button id="closeDialog">Close</button>`;
    dialog.showModal();
    document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
  }
});

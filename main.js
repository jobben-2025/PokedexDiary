// Shared constants & helpers for localStorage (FR012)
const STORAGE_KEY = 'pokedexFavorites';

function getStoredPokemon() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredPokemon(pokemonArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemonArray));
}

// Create a minimal Pokémon object that we store in localStorage
function toStoredPokemon(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.front_default,
    stats: pokemon.stats.map((s) => ({
      name: s.stat.name,
      base: s.base_stat,
    })),
    // notes field will be used on the Pokédex page (FR014)
    notes: '',
  };
}

// Handle catching logic + button UI feedback
function catchPokemon(pokemonData, buttonElement) {
  const stored = getStoredPokemon();
  const alreadyCaught = stored.some((p) => p.id === pokemonData.id);

  if (alreadyCaught) {
    if (buttonElement) {
      buttonElement.textContent = 'Caught ✓';
      buttonElement.disabled = true;
    }
    return;
  }

  stored.push(pokemonData);
  saveStoredPokemon(stored);

  if (buttonElement) {
    buttonElement.textContent = 'Caught ✓';
    buttonElement.disabled = true;
  }
}

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

// FR011: Pokémon Cards (image, name, stats) + Catch button (FR012)
function displayPokemon(pokemon) {
  const storedPokemon = getStoredPokemon();
  const pokemonData = toStoredPokemon(pokemon);
  const alreadyCaught = storedPokemon.some((p) => p.id === pokemonData.id);

  const card = document.createElement('div');
  card.className = 'pokemon-card';

  // show HP, Attack, Defense
  const hp = pokemon.stats[0].base_stat;
  const attack = pokemon.stats[1].base_stat;
  const defense = pokemon.stats[2].base_stat;

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <p>HP: ${hp} | Attack: ${attack} | Defense: ${defense}</p>
    <!-- add data-pokemon-id so we can find this button later -->
    <button class="catch-btn" data-pokemon-id="${pokemon.id}">
      ${alreadyCaught ? 'Caught ✓' : 'Catch'}
    </button>
  `;

  const catchBtn = card.querySelector('.catch-btn');
  if (alreadyCaught) {
    catchBtn.disabled = true;
  } else {
    catchBtn.addEventListener('click', () => {
      catchPokemon(pokemonData, catchBtn);
    });
  }

  pokemonListContainer.appendChild(card);
}

fetchPokemonList();

// FR010: Search with Dialog (+ Catch in dialog for FR012)
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

    const pokemonData = toStoredPokemon(pokemon);
    const stored = getStoredPokemon();
    const alreadyCaught = stored.some((p) => p.id === pokemonData.id);

    const hp = pokemon.stats[0].base_stat;
    const attack = pokemon.stats[1].base_stat;
    const defense = pokemon.stats[2].base_stat;

    dialog.innerHTML = `
      <h3>${pokemon.name}</h3>
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <p>HP: ${hp} | Attack: ${attack} | Defense: ${defense}</p>
      <button id="catchDialogBtn">${alreadyCaught ? 'Caught ✓' : 'Catch'}</button>
      <button id="closeDialog">Close</button>
    `;
    dialog.showModal();

    const closeBtn = document.getElementById('closeDialog');
    const catchDialogBtn = document.getElementById('catchDialogBtn');

    closeBtn.addEventListener('click', () => {
      dialog.close();
    });

    if (alreadyCaught) {
      catchDialogBtn.disabled = true;
    } else {
      catchDialogBtn.addEventListener('click', () => {
        // Catch in storage + update dialog button
        catchPokemon(pokemonData, catchDialogBtn);

        // ALSO update the corresponding button in the list, if it exists
        const listButton = document.querySelector(
          `.catch-btn[data-pokemon-id="${pokemonData.id}"]`
        );
        if (listButton) {
          listButton.textContent = 'Caught ✓';
          listButton.disabled = true;
        }
      });
    }

  } catch (error) {
    dialog.innerHTML = `
      <p>${error.message}</p>
      <button id="closeDialog">Close</button>
    `;
    dialog.showModal();
    document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
  }
});

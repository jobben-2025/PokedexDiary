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
      buttonElement.textContent = 'Caught!';
      buttonElement.disabled = true;
    }
    return;
  }

  stored.push(pokemonData);
  saveStoredPokemon(stored);

  if (buttonElement) {
    buttonElement.textContent = 'Caught!';
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

// FR011: Pokémon Cards (trading-card style) + Catch button (FR012)
function displayPokemon(pokemon) {
  const storedPokemon = getStoredPokemon();
  const pokemonData = toStoredPokemon(pokemon);
  const alreadyCaught = storedPokemon.some((p) => p.id === pokemonData.id);

  const card = document.createElement('div');

  // Pokémon trading card style using Tailwind
  card.className =
    'pokemon-card max-w-xs mx-auto rounded-xl border-4 border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 text-slate-900 shadow-lg shadow-slate-900/60 p-1';

  // show HP, Attack, Defense
  const hp = pokemon.stats[0].base_stat;
  const attack = pokemon.stats[1].base_stat;
  const defense = pokemon.stats[2].base_stat;

  const baseBtnClasses =
    'catch-btn group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold shadow transition active:scale-95';
  const notCaughtClasses =
    'border-slate-800 bg-slate-900/90 text-slate-100 hover:bg-slate-800';
  const caughtClasses =
    'border-emerald-700 bg-emerald-500/90 text-slate-900 cursor-default';

  const buttonClasses =
    baseBtnClasses + ' ' + (alreadyCaught ? caughtClasses : notCaughtClasses);

  card.innerHTML = `
    <div class="w-full h-full bg-gradient-to-b from-sky-100 to-sky-200 rounded-lg border border-yellow-500 px-2 pt-2 pb-3 flex flex-col">
      <!-- Header: name + HP -->
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-sm capitalize tracking-tight">
          ${pokemon.name}
        </span>
        <span class="text-xs font-bold text-red-600">
          HP ${hp}
        </span>
      </div>

      <!-- Image frame -->
      <div class="bg-slate-900/90 rounded-md flex items-center justify-center mb-2 py-2">
        <img
          src="${pokemon.sprites.front_default}"
          alt="${pokemon.name}"
          class="w-20 h-20 drop-shadow-lg"
        >
      </div>

      <!-- Stats box -->
      <div class="bg-yellow-50/90 rounded-md border border-yellow-200 px-2 py-1 mb-2">
        <p class="text-[10px] leading-snug text-slate-800">
          <span class="font-semibold">Attack:</span> ${attack}
          ·
          <span class="font-semibold">Defense:</span> ${defense}
        </p>
      </div>

      <!-- Catch button -->
      <div class="mt-auto flex justify-center">
        <button
          class="${buttonClasses}"
          data-pokemon-id="${pokemon.id}"
        >
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 border border-slate-800 overflow-hidden">
            <!-- Pokéball icon -->
            <svg viewBox="0 0 32 32" class="w-5 h-5">
              <circle cx="16" cy="16" r="15" fill="#ef4444" stroke="#111827" stroke-width="2"></circle>
              <path d="M3 16h26" stroke="#111827" stroke-width="2"></path>
              <circle cx="16" cy="16" r="6" fill="#f9fafb" stroke="#111827" stroke-width="2"></circle>
            </svg>
          </span>
          <span>${alreadyCaught ? 'Caught!' : 'Catch'}</span>
        </button>
      </div>
    </div>
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

// FR010: Search with Dialog (+ Hero-style preview + Catch in dialog for FR012)
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
      <div class="bg-slate-900 text-slate-100">
        <!-- Hero image area -->
        <div class="bg-gradient-to-r from-yellow-400 via-amber-400 to-red-500 px-6 pt-6 pb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xl font-extrabold capitalize tracking-tight drop-shadow">
              ${pokemon.name}
            </h3>
            <span class="text-sm font-bold text-red-900 bg-yellow-200/90 px-2 py-1 rounded-full">
              HP ${hp}
            </span>
          </div>
          <div class="flex justify-center">
            <div class="bg-slate-900/80 rounded-2xl border border-amber-300 px-6 py-4 shadow-lg">
              <img
                src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}"
                alt="${pokemon.name}"
                class="w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]"
              >
            </div>
          </div>
        </div>

        <!-- Info + actions -->
        <div class="px-6 py-4 space-y-3">
          <p class="text-xs text-slate-300">
            <span class="font-semibold">Attack:</span> ${attack}
            ·
            <span class="font-semibold">Defense:</span> ${defense}
          </p>

          <div class="flex gap-3 justify-end mt-2">
            <button
              id="closeDialog"
              class="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-500 text-slate-200 hover:bg-slate-800 active:scale-95 transition"
            >
              Close
            </button>
            <button
              id="catchDialogBtn"
              class="px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 ${
                alreadyCaught
                  ? 'bg-emerald-500/90 text-slate-900 border border-emerald-700 cursor-default'
                  : 'bg-yellow-400 text-slate-900 border border-yellow-500 hover:bg-yellow-300 active:scale-95'
              }"
            >
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900/80 border border-slate-900 overflow-hidden">
                <svg viewBox="0 0 32 32" class="w-5 h-5">
                  <circle cx="16" cy="16" r="15" fill="#ef4444" stroke="#f9fafb" stroke-width="2"></circle>
                  <path d="M3 16h26" stroke="#f9fafb" stroke-width="2"></path>
                  <circle cx="16" cy="16" r="6" fill="#f9fafb" stroke="#111827" stroke-width="2"></circle>
                </svg>
              </span>
              <span>${alreadyCaught ? 'Caught!' : 'Catch'}</span>
            </button>
          </div>
        </div>
      </div>
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
          listButton.textContent = 'Caught!';
          listButton.disabled = true;
        }
      });
    }

  } catch (error) {
    dialog.innerHTML = `
      <div class="bg-slate-900 text-slate-100 px-6 py-4 space-y-3">
        <p class="text-sm">${error.message}</p>
        <div class="flex justify-end">
          <button
            id="closeDialog"
            class="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-500 text-slate-200 hover:bg-slate-800 active:scale-95 transition"
          >
            Close
          </button>
        </div>
      </div>
    `;
    dialog.showModal();
    document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
  }
});

// Shared constants & helpers for localStorage (FR012) - COPIED FROM main.js
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

// FR012: Save helper is needed to update the array
function saveStoredPokemon(pokemonArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemonArray));
}

// FR013: Handle 'Set Free' (Delete) functionality
function setFreePokemon(pokemonId) {
    let storedPokemon = getStoredPokemon();
    
    // Filter out the Pokémon with the matching ID
    storedPokemon = storedPokemon.filter(p => p.id !== pokemonId);

    // Save the new array back to localStorage
    saveStoredPokemon(storedPokemon);

    // Refresh the page to show the immediate effect
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    
    const pokemonListElement = document.getElementById('pokemon-list');
    const loadingMessage = document.getElementById('loading-message');

    /**
     * Finds a specific stat value by name in the Pokemon's stats array.
     * @param {Array<Object>} statsArray - The stats array from the stored Pokemon object.
     * @param {string} statName - The name of the stat to find (e.g., 'hp', 'attack').
     * @returns {number | string} The base stat value or 'N/A' if not found.
     */
    const getStat = (statsArray, statName) => {
        const stat = statsArray.find(s => s.name === statName);
        return stat ? stat.base : 'N/A';
    };

    /**
     * FR014: Handle note saving on input change.
     */
    function savePokemonNote(pokemonId, noteContent) {
        const storedPokemon = getStoredPokemon();
        
        // Find the specific Pokemon to update
        const pokemonToUpdate = storedPokemon.find(p => p.id === pokemonId);

        if (pokemonToUpdate) {
            // Update the notes field of the found Pokemon
            pokemonToUpdate.notes = noteContent;
            // Save the entire updated array back to localStorage
            saveStoredPokemon(storedPokemon);
            // NOTE: No page reload is necessary for just saving a note.
        }
    }

    /**
     * Renders all Pokemon cards from the provided data array.
     * @param {Array<Object>} pokemonArray - Array of Pokemon objects from localStorage.
     */
    const renderPokemonCards = (pokemonArray) => {
        if (loadingMessage) {
            loadingMessage.remove(); // Hide loading message once data is available
        }
        
        pokemonListElement.innerHTML = ''; // Clear the container before rendering

        // If no Pokemon are caught, display a message
        if (pokemonArray.length === 0) {
             pokemonListElement.innerHTML = '<p class="text-center text-blue-400 col-span-full">No Pokémon have been caught yet!</p>';
             return;
        }

        pokemonArray.forEach(pokemon => {
            const card = document.createElement('div');
            // Add a data-id attribute for easy identification
            card.setAttribute('data-pokemon-id', pokemon.id);

            // Card styling
            card.className = "bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-blue-600/50 hover:shadow-blue-500/50 transition-shadow duration-300 flex flex-col";
            
            // Extract stats
            const hp = getStat(pokemon.stats, 'hp');
            const attack = getStat(pokemon.stats, 'attack');
            const defense = getStat(pokemon.stats, 'defense');
            const specialAttack = getStat(pokemon.stats, 'special-attack');

            // Generate the card content HTML, including note box and delete button
            card.innerHTML = `
                <div class="flex flex-col items-center">
                    <img src="${pokemon.image}" alt="${pokemon.name}" class="w-24 h-24 object-contain mb-2 filter drop-shadow-lg">
                    <h2 class="text-xl font-bold text-blue-300 mb-1">${pokemon.name}</h2>
                    <span class="text-sm text-blue-400 bg-gray-900 px-3 py-1 rounded-full mb-3">ID: ${pokemon.id}</span> 
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">HP:</span>
                        <span class="text-blue-200">${hp}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">ATK:</span>
                        <span class="text-blue-200">${attack}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">DEF:</span>
                        <span class="text-blue-200">${defense}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">Sp. ATK:</span>
                        <span class="text-blue-200">${specialAttack}</span>
                    </div>
                </div>

                <div class="mt-auto pt-3 border-t border-gray-600">
                    <label for="note-${pokemon.id}" class="block text-sm font-medium text-blue-400 mb-1">Trainer's Note:</label>
                    <textarea 
                        id="note-${pokemon.id}" 
                        data-pokemon-id="${pokemon.id}"
                        class="pokemon-note-input w-full p-2 text-sm text-gray-100 bg-gray-800 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                        rows="2" 
                        placeholder="Add a note here..."
                    >${pokemon.notes || ''}</textarea>
                </div>
                
                <button 
                    class="set-free-btn mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    data-pokemon-id="${pokemon.id}"
                >
                    Set Free
                </button>
            `;
            
            pokemonListElement.appendChild(card);

            // Add Event Listener for 'Set Free' button (FR013)
            const setFreeBtn = card.querySelector('.set-free-btn');
            setFreeBtn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.pokemonId);
                // Call the new delete function
                setFreePokemon(id);
            });

            // Add Event Listener for Notes Textarea (FR014)
            const noteInput = card.querySelector('.pokemon-note-input');
            noteInput.addEventListener('input', (e) => {
                const id = parseInt(e.target.dataset.pokemonId);
                // Call the new save note function
                savePokemonNote(id, e.target.value);
            });
        });
    };

    // --- Main Logic: Fetch and Render ---
    try {
        // Use the shared function to get the data
        const pokemonData = getStoredPokemon();
        renderPokemonCards(pokemonData);
        
    } catch (error) {
        console.error("Error fetching or parsing Pokemon data from localStorage:", error);
        pokemonListElement.innerHTML = '<p class="text-center text-red-400 col-span-full">Error loading Pokedex data. Check console for details.</p>';
    }
});
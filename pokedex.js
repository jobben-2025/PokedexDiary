// preview file:    file:///Users/ben/Desktop/WBS%20Coding%20School/Github_SE04/PokedexDiary/pokedex.html

document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data Setup (For immediate testing) ---
    // If 'pokemonData' doesn't exist in localStorage, create it with mock data
    if (!localStorage.getItem('pokemonData')) {
        const mockData = [
            { id: 1, name: "Bulbasaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", hp: 45, attack: 49, defense: 49, specialAttack: 65, type: "Grass/Poison" },
            { id: 4, name: "Charmander", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", hp: 39, attack: 52, defense: 43, specialAttack: 60, type: "Fire" },
            { id: 7, name: "Squirtle", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", hp: 44, attack: 48, defense: 65, specialAttack: 50, type: "Water" },
            { id: 25, name: "Pikachu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", hp: 35, attack: 55, defense: 40, specialAttack: 50, type: "Electric" },
            { id: 150, name: "Mewtwo", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png", hp: 106, attack: 110, defense: 90, specialAttack: 154, type: "Psychic" },
            { id: 143, name: "Snorlax", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", hp: 160, attack: 110, defense: 65, specialAttack: 65, type: "Normal" },
            // Add more entries to test scrolling
            { id: 26, name: "Raichu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png", hp: 60, attack: 90, defense: 55, specialAttack: 90, type: "Electric" },
            { id: 37, name: "Vulpix", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png", hp: 38, attack: 41, defense: 40, specialAttack: 50, type: "Fire" },
            { id: 94, name: "Gengar", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png", hp: 60, attack: 65, defense: 60, specialAttack: 130, type: "Ghost/Poison" },
        ];
        localStorage.setItem('pokemonData', JSON.stringify(mockData));
    }
    // --- End Mock Data Setup ---

    const pokemonListElement = document.getElementById('pokemon-list');
    const loadingMessage = document.getElementById('loading-message');

    /**
     * Renders all Pokemon cards from the provided data array.
     * @param {Array<Object>} pokemonArray - Array of Pokemon objects.
     */
    const renderPokemonCards = (pokemonArray) => {
        if (loadingMessage) {
            loadingMessage.remove(); // Hide loading message once data is available
        }
        
        pokemonArray.forEach(pokemon => {
            const card = document.createElement('div');
            // Card styling: Light inner screen, dark blue text, subtle hover effect
            card.className = "bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-blue-600/50 hover:shadow-blue-500/50 transition-shadow duration-300";
            
            // Generate the card content HTML
            card.innerHTML = `
                <div class="flex flex-col items-center">
                    <img src="${pokemon.image}" alt="${pokemon.name}" class="w-24 h-24 object-contain mb-2 filter drop-shadow-lg">
                    <h2 class="text-xl font-bold text-blue-300 mb-1">${pokemon.name}</h2>
                    <span class="text-sm text-blue-400 bg-gray-900 px-3 py-1 rounded-full mb-3">${pokemon.type}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">HP:</span>
                        <span class="text-blue-200">${pokemon.hp}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">ATK:</span>
                        <span class="text-blue-200">${pokemon.attack}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">DEF:</span>
                        <span class="text-blue-200">${pokemon.defense}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-blue-400">Sp. ATK:</span>
                        <span class="text-blue-200">${pokemon.specialAttack}</span>
                    </div>
                </div>
            `;
            
            pokemonListElement.appendChild(card);
        });
    };

    // --- Main Logic: Fetch and Render ---
    try {
        const storedData = localStorage.getItem('pokemonData');
        
        if (storedData) {
            const pokemonData = JSON.parse(storedData);
            renderPokemonCards(pokemonData);
        } else {
            // This case should ideally not happen due to the mock setup, but it's good practice.
            pokemonListElement.innerHTML = '<p class="text-center text-red-400 col-span-full">No Pokemon data found in localStorage. Please ensure the \'pokemonData\' key is set.</p>';
        }
    } catch (error) {
        console.error("Error fetching or parsing Pokemon data from localStorage:", error);
        pokemonListElement.innerHTML = '<p class="text-center text-red-400 col-span-full">Error loading Pokedex data. Check console for details.</p>';
    }
});
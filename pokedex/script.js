//Search
let pokemonNames = [];
async function loadPokemonNames() {
  const res = await fetch(
    "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0"
  );

  const data = await res.json();

  pokemonNames = data.results.map(p => p.name);
}
loadPokemonNames();
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

searchInput.addEventListener("input", () => {

  const value = searchInput.value.toLowerCase();

  if (!value) {
    suggestions.classList.add("hidden");
    return;
  }

  const matches = pokemonNames
    .filter(name => name.startsWith(value))
    .slice(0, 8); // limit suggestions

  renderSuggestions(matches);
});
function renderSuggestions(list) {

  suggestions.innerHTML = "";

  if (!list.length) {
    suggestions.classList.add("hidden");
    return;
  }

  list.forEach(name => {

    const item = document.createElement("div");

    item.className =
      "p-2 hover:bg-gray-100 cursor-pointer capitalize";

    item.textContent = name;

    item.onclick = () => {
      searchInput.value = name;
      suggestions.classList.add("hidden");
      searchPokemon();
    };

    suggestions.appendChild(item);
  });

  suggestions.classList.remove("hidden");
}
document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) &&
      !suggestions.contains(e.target)) {
    suggestions.classList.add("hidden");
  }
});

document.getElementById("searchBtn").onclick = searchPokemon;

document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") searchPokemon();
});

async function searchPokemon() {
  const value = document.getElementById("searchInput").value.toLowerCase();
  if (!value) return;
  grid.innerHTML = "";
  try {
    await getPokemonCard(`https://pokeapi.co/api/v2/pokemon/${value}`);
  } catch {
    grid.innerHTML = `<p class="text-red-600 text-xl">Not found</p>`;
  }
}

//Random Generation

document.getElementById("surpriseBtn").onclick = loadRandomPokemon;
async function loadRandomPokemon() {
    grid.innerHTML = "";
    const randomIds = new Set();
    while (randomIds.size < 12) {
        randomIds.add(Math.floor(Math.random() * 1025) + 1);
    }
    for (const id of randomIds) {
        await getPokemonCard(`https://pokeapi.co/api/v2/pokemon/${id}`);
    }
}

//Sorting

document.getElementById("sortOrder").onchange = function () {
    const order = this.value;
    const cards = Array.from(document.querySelectorAll(".pokemon-card"));
    cards.sort((a, b) => {
        const nameA = a.dataset.name;
        const nameB = b.dataset.name;
        const idA = Number(a.dataset.id);
        const idB = Number(b.dataset.id);
        switch (order) {
            case "name-asc":
                return nameA.localeCompare(nameB);
            case "name-desc":
                return nameB.localeCompare(nameA);
            case "id-desc":
                return idB - idA;
            default:
                return idA - idB;
        }
    });
    grid.innerHTML = "";
    cards.forEach(c => grid.appendChild(c));
};

//URLSerachParams
function updateURL(page, pokemonId = null) {
    const params = new URLSearchParams();
    params.set("p", page);
    if (pokemonId) {
        params.set("id", pokemonId);
    }
    history.pushState(null, "", `?${params.toString()}`);
}

function getURLState() {
    const params = new URLSearchParams(window.location.search);
    return {
        page: parseInt(params.get("p")) || 1,
        id: params.get("id")
    };
}

//Poke Grid
const grid = document.getElementById("pokemonGrid");
let currentPage = 1;
const limit = 20;
const TOTAL_POKEMON = 1025;
const totalPages = Math.ceil(TOTAL_POKEMON / limit);

const pokemonCache = [];
async function loadPokemon(page = 1) {
    grid.innerHTML = "";
    const offset = (page - 1) * limit;
    const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await res.json();
    for (const p of data.results) {
        await getPokemonCard(p.url);
    }
    currentPage = page;
    const state = getURLState();
    updateURL(page, state.id);
}
const state = getURLState();

if (state.id) {
    showDetails(state.id);
} else {
    loadPokemon(state.page);
}

//Poke Card

const typeColors = {
  normal:"bg-gray-400 border border-solid border-gray-700 text-gray-700",
  fire:"bg-red-400 border border-solid border-red-800 text-red-800",
  water:"bg-blue-400 border border-solid border-blue-900 text-blue-900",
  electric:"bg-yellow-400 border border-solid border-yellow-700 text-yellow-700",
  grass:"bg-green-400 border border-solid border-green-800 text-green-800",
  ice:"bg-cyan-300 border border-solid border-cyan-600 text-cyan-700",
  fighting:"bg-red-700 border border-solid border-red-900 text-red-900",
  poison:"bg-purple-400 border border-solid border-purple-900 text-purple-900",
  ground:"bg-yellow-700 border border-solid border-yellow-900 text-yellow-900",
  flying:"bg-indigo-400 border border-solid border-indigo-900 text-indigo-900",
  psychic:"bg-pink-500 border border-solid border-pink-800 text-pink-800",
  bug:"bg-lime-400 border border-solid border-lime-700 text-lime-700",
  rock:"bg-stone-500 border border-solid border-stone-800 text-stone-800",
  ghost:"bg-violet-600 border border-solid border-violet-900 text-violet-900",
  dragon:"bg-indigo-700 border border-solid border-indigo-900 text-indigo-900",
  dark:"bg-gray-800 border border-solid border-black text-black",
  steel:"bg-slate-400 border border-solid border-slate-700 text-slate-700",
  fairy:"bg-pink-300 border border-solid border-pink-600 text-pink-600"
};

async function getPokemonCard(url) {
    const res = await fetch(url);
    const data = await res.json();
    pokemonCache.push(data);
    const card = document.createElement("div");
    card.className =
        "pokemon-card bg-gray-300 rounded-xl shadow p-4 text-center cursor-pointer border-solid border-gray-700 text-gray-700 hover:scale-105 transition ";
    card.dataset.name = data.name;
    card.dataset.id = data.id;
    const types = data.types
        .map(t => {
            const typeName = t.type.name;
            const color = typeColors[typeName] || "bg-gray-200/20 border-gray-400";

            return `
      <span class="${color} 
        px-3 py-1 rounded-full text-sm font-semibold
        border backdrop-blur-sm">
        ${typeName}
      </span>
    `;
        })
        .join(" ");
    card.innerHTML = `
    <img src="${data.sprites.other['official-artwork'].front_default}"
         class="w-28 h-28 mx-auto">
    <h3 class="capitalize font-bold text-lg">${data.name}</h3>
    <p class="text-gray-500">#${data.id}</p>
    <div class="flex gap-2 justify-center mt-2 capitalize">${types}</div>
  `;
    card.onclick = () => {
        updateURL(currentPage, data.id);
        showDetails(data.id);
    };
    grid.appendChild(card);
}

//prev and next buttons

document.getElementById("prevPage").onclick = () => {
    if (currentPage > 1) {
        loadPokemon(currentPage - 1);
    }
};

document.getElementById("nextPage").onclick = () => {
    if (currentPage < totalPages) {
        loadPokemon(currentPage + 1);
    }
}


//Poke details

async function showDetails(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const p = await res.json();

    const modal = document.getElementById("modal");
    const content = document.getElementById("modalContent");

    const statsHTML = p.stats.map(s => `
    <div>
      <p class="text-sm">${s.stat.name}</p>
      <div class="bg-gray-200 h-3 rounded">
        <div class="bg-orange-500 h-3 rounded"
             style="width:${Math.min(s.base_stat, 100)}%"></div>
      </div>
    </div>
  `).join("");

    const abilities = p.abilities
        .map(a => a.ability.name)
        .join(", ");

    content.innerHTML = `
    <button onclick="closeModal()" class="float-right text-xl">X</button>

    <img src="${p.sprites.other['official-artwork'].front_default}"
         class="w-48 mx-auto">

    <h2 class="text-2xl font-bold capitalize text-center">${p.name}</h2>
    <p class="text-center text-gray-500">#${p.id}</p>

    <p class="mt-3"><b>Height:</b> ${p.height}</p>
    <p><b>Weight:</b> ${p.weight}</p>
    <p><b>Abilities:</b> ${abilities}</p>

    <h3 class="font-bold mt-4">Stats</h3>
    ${statsHTML}
  `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
    updateURL(currentPage);
}

// signup

const signUpButton = document.getElementById("signUpButton");
signUpButton.onclick = handleSignup;
function handleSignup() {
    const email = document.getElementById("signUpEmail").value.trim();
    const country = document.getElementById("signUpCountry").value;
    const birthday = document.getElementById("signupDOB").value;
    if (!email) {
        alert("Email is required");
        return;
    }
    if (!validateEmail(email)) {
        alert("Enter valid email");
        return;
    }
    if (!birthday) {
        alert("Birthday required");
        return;
    }
    const signupData = {
        email,
        country,
        birthday,
        time: new Date().toISOString()
    };
    localStorage.setItem(
        "pokedex_signup",
        JSON.stringify(signupData)
    );
    alert("Signup successful 🎉");
    signUpButton.disabled = true;
    signUpButton.classList.add("opacity-50", "cursor-not-allowed");
}
function validateEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

window.addEventListener("popstate", () => {
    const state = getURLState();

    if (state.id) {
        showDetails(state.id);   // only 1 call
    } else {
        closeModal();
        loadPokemon(state.page);
    }
});
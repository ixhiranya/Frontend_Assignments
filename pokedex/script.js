//Search

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

//Poke Grid
const grid = document.getElementById("pokemonGrid");
const loadBtn = document.getElementById("loadMoreBtn");

let offset = 0;
const limit = 20;

const pokemonCache = [];
async function loadPokemon() {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  const data = await res.json();
  for (const p of data.results) {
    await getPokemonCard(p.url);
  }
  offset += limit;
}
loadPokemon();

//Poke Card

async function getPokemonCard(url) {
  const res = await fetch(url);
  const data = await res.json();
  pokemonCache.push(data);
  const card = document.createElement("div");
  card.className =
    "pokemon-card bg-white rounded-xl shadow p-4 text-center cursor-pointer hover:scale-105 focus:outline-red-Adhyega2 transition";
  card.dataset.name = data.name;
  card.dataset.id = data.id;
  const types = data.types
    .map(t => `<span class="bg-gray-200 px-2 py-1 rounded text-sm">${t.type.name}</span>`)
    .join(" ");
  card.innerHTML = `
    <img src="${data.sprites.other['official-artwork'].front_default}"
         class="w-28 h-28 mx-auto">
    <h3 class="capitalize font-bold text-lg">${data.name}</h3>
    <p class="text-gray-500">#${data.id}</p>
    <div class="flex gap-2 justify-center mt-2 capitalize">${types}</div>
  `;
  card.onclick = () => showDetails(data.id);
  grid.appendChild(card);
}

//load more

loadBtn.onclick = loadPokemon;

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
        <div class="bg-red-500 h-3 rounded"
             style="width:${Math.min(s.base_stat,100)}%"></div>
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

const container = document.getElementById("pokemonDetails");

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadPokemonDetails() {

  const id = getIdFromURL();

  if (!id) {
    container.innerHTML = "No Pokémon selected";
    return;
  }

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${id}`
  );

  const p = await res.json();

  const statsHTML = p.stats.map(s => `
    <div>
      <p class="text-sm">${s.stat.name}</p>
      <div class="bg-gray-200 h-3 rounded">
        <div class="bg-orange-500 h-3 rounded"
             style="width:${Math.min(s.base_stat,100)}%"></div>
      </div>
    </div>
  `).join("");

  const abilities = p.abilities
    .map(a => a.ability.name)
    .join(", ");

  container.innerHTML = `
    <img src="${p.sprites.other['official-artwork'].front_default}"
         class="w-56 mx-auto">

    <h2 class="text-3xl font-bold text-center capitalize">
      ${p.name}
    </h2>

    <p class="text-center text-gray-500">#${p.id}</p>

    <p><b>Height:</b> ${p.height}</p>
    <p><b>Weight:</b> ${p.weight}</p>
    <p><b>Abilities:</b> ${abilities}</p>

    <h3 class="font-bold mt-4">Stats</h3>
    ${statsHTML}
  `;
}

loadPokemonDetails();
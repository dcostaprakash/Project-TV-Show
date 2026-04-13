// Global episodes store
let allEpisodes = [];

// Runs on page load
async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes... please wait ⏳</p>";

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    allEpisodes = data;
    makePageForEpisodes(allEpisodes);
    setupSearch();
    setupDropdown();
  } catch (error) {
    rootElem.innerHTML =
      "<p>❌ Error loading data. Please try again later.</p>";
  }
}

// Render episodes
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  document.getElementById("episodeCount").textContent =
    `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "card";

    // Episode code
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const code = `S${season}E${number}`;

    // Title
    const title = document.createElement("h3");
    title.className = "title";
    title.textContent = `${episode.name} - ${code}`;

    // Image
    const img = document.createElement("img");
    if (episode.image && episode.image.medium) {
      img.src = episode.image.medium;
    }
    img.alt = episode.name;

    // Summary
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    // Append
    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);

    rootElem.appendChild(card);
  });

  // TVMaze credit
  const credit = document.createElement("p");
  credit.innerHTML = `Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(credit);
}

// 🔍 SEARCH FUNCTION
function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((ep) => {
      return (
        ep.name.toLowerCase().includes(searchTerm) ||
        (ep.summary || "").toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);
  });
}

// 🔽 DROPDOWN FUNCTION
function setupDropdown() {
  const select = document.getElementById("episodeSelect");

  select.innerHTML = "";

  allEpisodes.forEach((ep) => {
    const option = document.createElement("option");

    const season = String(ep.season).padStart(2, "0");
    const number = String(ep.number).padStart(2, "0");

    option.value = ep.id;
    option.textContent = `S${season}E${number} - ${ep.name}`;

    select.appendChild(option);
  });

  select.onchange = function () {
    const selectedId = Number(select.value);

    const selectedEpisode = allEpisodes.filter((ep) => {
      return ep.id === selectedId;
    });

    makePageForEpisodes(selectedEpisode);
  };
}

// Load app
window.onload = setup;

let allEpisodes = [];
let allShows = [];
let episodeCache = {}; // prevents duplicate fetches

function setup() {
  const root = document.getElementById("root");
  root.textContent = "Loading shows...";

  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      // sort alphabetically (case insensitive)
      allShows = shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      populateShowSelector(allShows);

      root.textContent = "Please select a show";
    })
    .catch(() => {
      root.textContent = "Error loading shows";
    });

  setupSearch();
}

function populateShowSelector(shows) {
  const selector = document.getElementById("show-selector");

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  });

  selector.addEventListener("change", handleShowSelect);
}

function handleShowSelect(event) {
  const showId = event.target.value;

  if (!showId) return;

  if (episodeCache[showId]) {
    loadEpisodes(episodeCache[showId]);
  } else {
    const root = document.getElementById("root");
    root.textContent = "Loading episodes...";

    fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
      .then((res) => res.json())
      .then((episodes) => {
        episodeCache[showId] = episodes; // cache it
        loadEpisodes(episodes);
      })
      .catch(() => {
        root.textContent = "Error loading episodes";
      });
  }
}

function loadEpisodes(episodes) {
  allEpisodes = episodes;

  populateEpisodeSelector(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episode-selector");

  selector.innerHTML = `<option value="all">All Episodes</option>`;

  episodes.forEach((ep) => {
    const option = document.createElement("option");

    const code = formatEpisodeCode(ep);

    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;

    selector.appendChild(option);
  });

  selector.addEventListener("change", handleEpisodeSelect);
}

function handleEpisodeSelect(event) {
  const selectedId = event.target.value;

  if (selectedId === "all") {
    makePageForEpisodes(allEpisodes);
  } else {
    const selected = allEpisodes.filter(
      (ep) => ep.id == selectedId
    );
    makePageForEpisodes(selected);
  }
}

function setupSearch() {
  const input = document.getElementById("search-input");

  input.addEventListener("input", () => {
    const searchTerm = input.value.toLowerCase();

    const filtered = allEpisodes.filter((ep) => {
      return (
        ep.name.toLowerCase().includes(searchTerm) ||
        ep.summary.toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filtered);
  });
}

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");
  const count = document.getElementById("count");

  root.innerHTML = "";

  count.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;

  episodeList.forEach((ep) => {
    const code = formatEpisodeCode(ep);

    const card = document.createElement("div");

    card.innerHTML = `
      <h3>${ep.name} - ${code}</h3>
      <img src="${ep.image.medium}" />
      <p>${ep.summary}</p>
    `;

    root.appendChild(card);
  });
}

function formatEpisodeCode(ep) {
  const season = String(ep.season).padStart(2, "0");
  const number = String(ep.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;
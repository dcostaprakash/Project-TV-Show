let allEpisodes = [];
let allShows = [];
let episodeCache = {}; // prevents duplicate fetches
let currentView = "shows";

function setup() {
  const root = document.getElementById("root");
  root.textContent = "Loading shows...";

  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      // sort alphabetically (case insensitive)
      allShows = shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );

      populateShowSelector(allShows);

      makePageForShows(allShows);
    })
    .catch(() => {
      root.textContent = "Error loading shows";
    });

  setupSearch();
  document.getElementById("back-button").addEventListener("click", () => {
    makePageForShows(allShows);
  });
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
  currentView = "episodes";
  resetUIState();
  allEpisodes = episodes;

  document.getElementById("back-button").style.display = "block";

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

  selector.onchange = handleEpisodeSelect;
}

function handleEpisodeSelect(event) {
  const selectedId = event.target.value;

  if (selectedId === "all") {
    makePageForEpisodes(allEpisodes);
  } else {
    const selected = allEpisodes.filter((ep) => ep.id == selectedId);
    makePageForEpisodes(selected);
  }
}

function setupSearch() {
  const input = document.getElementById("search-input");

  input.addEventListener("input", () => {
    const searchTerm = input.value.toLowerCase();

    // SHOW SEARCH MODE
    if (currentView === "shows") {
      const filteredShows = allShows.filter((show) => {
        return (
          (show.name || "").toLowerCase().includes(searchTerm) ||
          (show.summary || "").toLowerCase().includes(searchTerm) ||
          (show.genres || []).join(" ").toLowerCase().includes(searchTerm)
        );
      });
      makePageForShows(filteredShows);
    }
    // EPISODE SEARCH MODE
    else {
      const filteredEpisodes = allEpisodes.filter((ep) => {
        return (
          (ep.name || "").toLowerCase().includes(searchTerm) ||
          (ep.summary || "").toLowerCase().includes(searchTerm)
        );
      });

      makePageForEpisodes(filteredEpisodes);
    }
  });
}

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");
  const count = document.getElementById("count");

  root.innerHTML = "";

  count.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;

  episodeList.forEach((ep) => {
    const card = document.createElement("div");
    card.className = "card";

    const code = formatEpisodeCode(ep);

    const title = document.createElement("h3");
    title.textContent = `${ep.name} - ${code}`;

    const img = document.createElement("img");

    if (ep.image && ep.image.medium) {
      img.src = ep.image.medium;
      img.alt = ep.name;
    } else {
      img.alt = "No image available";
    }

    const summary = document.createElement("p");
    summary.innerHTML = ep.summary || "No summary available.";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);

    root.appendChild(card);
  });
}

function makePageForShows(showList) {
  currentView = "shows";
  resetUIState();
  document.getElementById("back-button").style.display = "none";
  const root = document.getElementById("root");
  const count = document.getElementById("count");

  root.innerHTML = "";
  count.textContent = `Displaying ${showList.length} shows`;

  showList.forEach((show) => {
    const card = document.createElement("div");
    card.className = "card show-card";

    card.addEventListener("click", () => {
      handleShowSelect({ target: { value: show.id } });
    });

    const title = document.createElement("h2");
    title.textContent = show.name;

    const content = document.createElement("div");
    content.className = "show-content";

    const img = document.createElement("img");
    if (show.image && show.image.medium) {
      img.src = show.image.medium;
      img.alt = show.name;
    }

    const summary = document.createElement("p");
    summary.innerHTML = show.summary || "No summary available";

    const info = document.createElement("div");
    info.className = "info-box";
    info.innerHTML = `
  <p><strong>Rating:</strong> ${show.rating.average || "N/A"}</p>
  <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
  <p><strong>Status:</strong> ${show.status}</p>
  <p><strong>Runtime:</strong> ${show.runtime || "N/A"}</p>
`;

    content.appendChild(img);
    content.appendChild(summary);
    content.appendChild(info);

    card.appendChild(title);
    card.appendChild(content);

    root.appendChild(card);
  });
}

function formatEpisodeCode(ep) {
  const season = String(ep.season).padStart(2, "0");
  const number = String(ep.number).padStart(2, "0");
  return `S${season}E${number}`;
}

function resetUIState() {
  const searchInput = document.getElementById("search-input");
  const showSelector = document.getElementById("show-selector");
  const episodeSelector = document.getElementById("episode-selector");

  // reset search
  searchInput.value = "";

  // reset dropdowns
  showSelector.value = "";
  episodeSelector.value = "all";
}
window.onload = setup;

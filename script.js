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

      makePageForShows(allShows);
    })
    .catch(() => {
      root.textContent = "Error loading shows";
    });

  setupSearch();
  document.getElementById("back-button").addEventListener("click", () => {
    setEpisodeModeUI(false);
    makePageForShows(allShows);
  });
}

function makePageForShows(showList) {
  currentView = "shows";
  resetUIState();

  document.getElementById("back-button").style.display = "none";

  const root = document.getElementById("root");
  const count = document.getElementById("count");

  root.innerHTML = "";
  document.getElementById("episode-selector").style.display = "none";

  // count
  count.textContent = `Found ${showList.length} shows`;

  renderShowDropdown(showList);

  // render cards
  showList.forEach((show) => {
    const card = document.createElement("div");
    card.className = "card show-card";

    card.addEventListener("click", () => {
      handleShowSelect({ target: { value: String(show.id) } });
    });

    const title = document.createElement("h2");
    title.textContent = show.name;

    const content = document.createElement("div");
    content.className = "show-content";

    const img = document.createElement("img");
    if (show.image?.medium) {
      img.src = show.image.medium;
      img.alt = show.name;
    }

    const summary = document.createElement("p");
    summary.innerHTML = show.summary || "No summary available";

    const info = document.createElement("div");
    info.className = "info-box";
    info.innerHTML = `
        <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
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

// input search to get all shows with it
function renderShowCards(showList) {
  const root = document.getElementById("root");
  const count = document.getElementById("count");

  root.innerHTML = "";

  count.textContent = `Found ${showList.length} shows`;

  showList.forEach((show) => {
    const card = document.createElement("div");
    card.className = "card show-card";

    card.addEventListener("click", () => {
      handleShowSelect({ target: { value: String(show.id) } });
    });

    const title = document.createElement("h2");
    title.textContent = show.name;

    const content = document.createElement("div");
    content.className = "show-content";

    const img = document.createElement("img");
    img.src = show.image?.medium || "";
    img.alt = show.name;

    const summary = document.createElement("p");
    summary.innerHTML = show.summary || "No summary available";

    const info = document.createElement("div");
    info.className = "info-box";
    info.innerHTML = `
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
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
function renderShowDropdown(showList) {
  const showSelector = document.getElementById("show-selector");

  showSelector.innerHTML = `<option value="">Select a show...</option>`;
  showSelector.onchange = handleShowSelect;
  showList.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelector.appendChild(option);
  });
}

function handleShowSelect(event) {
  const showId = Number(event.target.value);

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
  document.getElementById("search-input").value = "";

  allEpisodes = episodes;

  document.getElementById("back-button").style.display = "block";
  document.getElementById("episode-selector").style.display = "inline-block";

  populateEpisodeSelector(allEpisodes);
  makePageForEpisodes(allEpisodes);

  setEpisodeModeUI(true);
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
        const name = show.name || "";
        const summary = show.summary || "";
        const genres = (show.genres || []).join(" ");
        return (
          name.toLowerCase().includes(searchTerm) ||
          summary.toLowerCase().includes(searchTerm) ||
          genres.toLowerCase().includes(searchTerm)
        );
      });
      renderShowDropdown(filteredShows);
      renderShowCards(filteredShows);
      //  AUTO-SELECT FIRST RESULT
      const showSelector = document.getElementById("show-selector");
    }
    // EPISODE SEARCH MODE
    else {
      const filteredEpisodes = allEpisodes.filter((ep) => {
        return (
          (ep.name || "").toLowerCase().includes(searchTerm) ||
          (ep.summary || "").toLowerCase().includes(searchTerm)
        );
      });
      populateEpisodeSelector(filteredEpisodes);
      renderEpisodes(filteredEpisodes);
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
function renderShows(showList) {
  makePageForShows(showList);
}

function renderEpisodes(episodeList) {
  makePageForEpisodes(episodeList);
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

  document.getElementById("episode-selector").style.display = "none";
}
function setSearchLocked(isLocked) {
  const searchInput = document.getElementById("search-input");
  const showSelector = document.getElementById("show-selector");

  searchInput.blur();

  searchInput.disabled = isLocked;
  searchInput.readOnly = isLocked;
  searchInput.tabIndex = isLocked ? -1 : 0;

  showSelector.disabled = isLocked;

  searchInput.style.opacity = isLocked ? "0.4" : "1";
  showSelector.style.opacity = isLocked ? "0.4" : "1";
  searchInput.style.pointerEvents = isLocked ? "none" : "auto";
}

function setEpisodeModeUI(isEpisodeMode) {
  const searchInput = document.getElementById("search-input");
  const showSelector = document.getElementById("show-selector");
  const episodeSelector = document.getElementById("episode-selector");

  // SHOW episode dropdown only in episode mode
  episodeSelector.style.display = isEpisodeMode ? "inline-block" : "none";

  // SEARCH BAR should stay active in episode mode
  searchInput.disabled = false;
  searchInput.readOnly = false;
  searchInput.tabIndex = 0;

  searchInput.style.opacity = "1";
  searchInput.style.pointerEvents = "auto";

  searchInput.placeholder = isEpisodeMode
    ? "Search episodes..."
    : "Search shows...";

  if (isEpisodeMode) {
    showSelector.disabled = true;
    showSelector.style.opacity = "0.4";
  } else {
    showSelector.disabled = false; // ← THIS is the fix
    showSelector.style.opacity = "1";
  }
}
window.onload = setup;

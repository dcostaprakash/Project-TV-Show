let allEpisodes = [];

function setup() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "Loading episodes...";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((res) => res.json())
    .then((episodes) => {
      allEpisodes = episodes;

      populateEpisodeSelector(episodes);
      makePageForEpisodes(episodes);

      setupSearch();
    })
    .catch(() => {
      rootElem.textContent = "Error loading episodes";
    });
}

window.onload = setup;

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episode-selector");

  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${formatEpisodeCode(ep)} - ${ep.name}`;
    selector.appendChild(option);
  });

  selector.addEventListener("change", handleEpisodeSelect);
}

function handleEpisodeSelect(event) {
  const selectedId = event.target.value;

  if (selectedId === "all") {
    makePageForEpisodes(allEpisodes);
  } else {
    const selectedEpisode = allEpisodes.filter(
      (ep) => ep.id == selectedId
    );
    makePageForEpisodes(selectedEpisode);
  }
}

function setupSearch() {
  const input = document.getElementById("search-input");

  input.addEventListener("input", () => {
    const searchTerm = input.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((ep) => {
      return (
        ep.name.toLowerCase().includes(searchTerm) ||
        ep.summary.toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length}`;
  rootElem.appendChild(count);

  episodeList.forEach((ep) => {
    const card = document.createElement("div");

    card.innerHTML = `
      <h3>${formatEpisodeCode(ep)} - ${ep.name}</h3>
      <img src="${ep.image.medium}" />
      <p>${ep.summary}</p>
    `;

    rootElem.appendChild(card);
  });
}

function formatEpisodeCode(ep) {
  const season = String(ep.season).padStart(2, "0");
  const number = String(ep.number).padStart(2, "0");
  return `S${season}E${number}`;
}  
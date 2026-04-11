//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "card";

    // Create episode code S01E01
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

    // Append elements
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

window.onload = setup;

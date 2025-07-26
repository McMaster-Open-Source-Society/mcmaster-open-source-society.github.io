document.addEventListener('DOMContentLoaded', async () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const refreshBtn = document.getElementById('refresh-projects');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchAndRender);
  }

  await fetchAndRender();
});

const ORG_API = 'https://api.github.com/orgs/McMaster-Open-Source-Society/repos?per_page=100';

async function fetchAndRender() {
  console.log("→ fetching from", ORG_API);
  let repos = [];
  try {
    const resp = await fetch(ORG_API, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    console.log("GitHub status:", resp.status);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    repos = await resp.json();
    console.log("Got repos:", repos.map(r => r.name));
  } catch (e) {
    console.error("Fetch error:", e);
  }
  renderSixWithPlaceholders(repos);
}

function renderSixWithPlaceholders(repos) {
  // Build up to six cards, marking placeholders with url=null
  const cards = repos.slice(0, 6).map(r => ({
    name: r.name,
    desc: r.description || 'No description provided.',
    url:  r.html_url
  }));
  while (cards.length < 6) {
    cards.push({
      name: 'Coming Soon',
      desc: 'Stay tuned for more projects.',
      url:  null
    });
  }

  const grid = document.getElementById('project-grid');
  if (!grid) return console.warn("No #project-grid found");
  grid.innerHTML = '';

  cards.forEach(c => {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Always add title + description
    let html = `
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
    `;

    // Only include a link for real repos
    if (c.url) {
      html += `
        <a href="${c.url}" target="_blank" rel="noopener">
          Learn more
        </a>
      `;
    }

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

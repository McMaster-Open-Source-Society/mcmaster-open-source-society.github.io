document.addEventListener('DOMContentLoaded', function () {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

const ORG_API = 'https://api.github.com/orgs/McMaster-Open‑Source‑Society/repos?per_page=100';

async function fetchAndRender() {
  try {
    const resp = await fetch(ORG_API, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
    if (!resp.ok) throw new Error(`GitHub API returned ${resp.status}`);
    const repos = await resp.json();
    renderSixWithPlaceholders(repos);
  } catch (e) {
    console.error(e);
    renderSixWithPlaceholders([]); // fallback to placeholders
  }
}

function renderSixWithPlaceholders(repos) {
  // use the real repos first, then fill placeholders
  const cards = repos.slice(0, 6).map(r => ({
    name: r.name,
    desc: r.description || 'No description provided.',
    url: r.html_url
  }));

  while (cards.length < 6) {
    cards.push({
      name: 'Coming Soon',
      desc: 'Stay tuned for more projects.',
      url: '#'
    });
  }

  const grid = document.getElementById('project-grid');
  grid.innerHTML = '';

  cards.forEach(c => {
    const card = document.createElement('div');
    card.className = 'project-card';

    card.innerHTML = `
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <a href="${c.url}" target="_blank" rel="noopener">
        ${c.url === '#' ? 'Learn more' : 'Learn more →'}
      </a>
    `;
    grid.appendChild(card);
  });
}

document.getElementById('refresh-projects')
        .addEventListener('click', fetchAndRender);

window.addEventListener('DOMContentLoaded', () => {
  fetchAndRender();
  document.getElementById('year').textContent = new Date().getFullYear();
});

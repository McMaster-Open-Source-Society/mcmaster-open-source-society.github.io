"use strict";

/* ===== config ===== */
var ORG = "McMaster-Open-Source-Society";
var PAD_WITH_DUMMIES = true; // fill up to 4 with placeholders when not enough repos

/* ===== helpers ===== */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function makeCard(repo) {
  var name = repo && repo.name ? repo.name : "Untitled";
  var desc =
    (repo && repo.description ? String(repo.description).trim() : "") ||
    "No description provided.";
  var url = repo && repo.html_url ? repo.html_url : "#";

  var div = document.createElement("div");
  div.className = "project-card";
  div.innerHTML =
    "<h3>" + escapeHtml(name) + "</h3>" +
    "<p>" + escapeHtml(desc) + "</p>" +
    '<a href="' + url + '" target="_blank" rel="noopener">View Repo</a>';
  return div;
}

function dummyCard(i) {
  return makeCard({
    name: "Coming Soon " + i,
    description: "Placeholder project slot. Add a repo or feature a project here.",
    html_url: "#"
  });
}

/* ===== main loader ===== */
function loadProjects() {
  var grid = document.getElementById("project-grid");
  if (!grid) return;

  grid.innerHTML = "<p>Loading…</p>";

  var API = "https://api.github.com/orgs/" + ORG + "/repos?per_page=100";

  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API error " + res.status);
      return res.json();
    })
    .then(function (repos) {
      var list = Array.isArray(repos) ? repos : [];

      // filter forks/archived, sort by stars then recent activity
      list = list
        .filter(function (r) { return !r.fork && !r.archived; })
        .sort(function (a, b) {
          var stars = (b.stargazers_count || 0) - (a.stargazers_count || 0);
          if (stars !== 0) return stars;
          return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
        })
        .slice(0, 4);

      // pad to 4 with dummies if needed
      if (PAD_WITH_DUMMIES && list.length < 4) {
        var need = 4 - list.length;
        for (var i = 1; i <= need; i++) list.push({ __dummy: true, name: "Coming Soon " + i, description: "Placeholder project slot. Add a repo or feature a project here.", html_url: "#" });
      }

      grid.innerHTML = "";
      if (list.length === 0) {
        grid.innerHTML = "<p>No projects found.</p>";
        return;
      }
      list.forEach(function (repo, idx) {
        // if it was padded, render dummy card
        if (repo.__dummy) {
          grid.appendChild(dummyCard(idx + 1));
        } else {
          grid.appendChild(makeCard(repo));
        }
      });
    })
    .catch(function (err) {
      console.error(err);
      // On error, still show 4 dummy cards so layout looks right
      var grid = document.getElementById("project-grid");
      grid.innerHTML = "";
      for (var i = 1; i <= 4; i++) grid.appendChild(dummyCard(i));
    });
}

/* ===== boot ===== */
document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  loadProjects();

  var btn = document.getElementById("refresh-projects");
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      loadProjects();
    });
  }
});

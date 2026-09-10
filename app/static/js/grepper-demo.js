const SNAPSHOT_URL = "/static/data/grepper-snapshot.json";
const PAGE_SIZE = 20;
const SAMPLE_RESUME = `Senior systems and reliability engineer with experience supporting enterprise infrastructure and production incidents.
Built realistic lab environments with Linux, VMware, networking, VLANs, Fibre Channel, and storage platforms.
Automated operational work using Python, APIs, PowerShell, Bash, Terraform, Git, and CI/CD.
Worked with Kubernetes, containers, observability, troubleshooting, root cause analysis, customer escalations, and technical communication.`;

const SKILLS = [
  "incident response","technical communication","test engineering","fibre channel","root cause","kubernetes","observability",
  "troubleshooting","automation","terraform","networking","storage","vmware","python","linux","ci/cd","containers",
  "customer","cloud","security","api","git","lab","hardware","metrics","tracing","aws","azure","tcp/ip","vlans",
  "javascript","html","css","react","sql","analytics","dashboard","excel","reporting"
];

let snapshot = null;
let jobs = [];
let filteredJobs = [];
let currentPage = 1;
let currentKeywords = [];

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[char]));

function expandSnapshot(data) {
  const variants = ["", " II", " — Platform", " — Systems"];
  const result = [];
  let index = 1;
  data.templates.forEach((template, templateIndex) => {
    data.sources.forEach((source, sourceIndex) => {
      variants.slice(0, data.copies_per_template || 4).forEach((variant, variantIndex) => {
        const location = data.locations[(templateIndex + sourceIndex + variantIndex) % data.locations.length];
        result.push({
          id: `G-${String(index++).padStart(4, "0")}`,
          source,
          title: `${template.title}${variant}`,
          location,
          category: template.category,
          skills: template.skills,
          summary: template.summary
        });
      });
    });
  });
  return result;
}

function extractKeywords(text) {
  const normalized = text.toLowerCase();
  return SKILLS.map((skill) => {
    const pattern = new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const count = (normalized.match(pattern) || []).length;
    if (!count) return null;
    const phraseBonus = skill.includes(" ") ? 1.5 : 1;
    return { skill, weight: Math.min(5, +(1.4 + count * 0.9 + phraseBonus).toFixed(1)), count };
  }).filter(Boolean).sort((a,b) => b.weight - a.weight || a.skill.localeCompare(b.skill)).slice(0, 14);
}

function scoreJob(job, keywords, query) {
  const haystack = `${job.title} ${job.category} ${job.summary} ${job.skills.join(" ")}`.toLowerCase();
  const matched = keywords.filter((item) => haystack.includes(item.skill));
  const weighted = matched.reduce((sum, item) => sum + item.weight, 0);
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const queryHits = queryTerms.filter((term) => haystack.includes(term)).length;
  const score = Math.min(99, Math.round(24 + weighted * 5 + queryHits * 7));
  return { ...job, score, matched };
}

function matchesFilters(job) {
  const query = $("query").value.trim().toLowerCase();
  const location = $("location").value;
  const source = $("source").value;
  const text = `${job.title} ${job.category} ${job.summary} ${job.skills.join(" ")}`.toLowerCase();
  const queryTerms = query.split(/\s+/).filter(Boolean);
  const queryMatch = !queryTerms.length || queryTerms.every((term) => text.includes(term));
  return queryMatch && (!location || job.location === location) && (!source || job.source === source);
}

function renderKeywords() {
  const container = $("keywordChips");
  if (!currentKeywords.length) {
    container.innerHTML = '<span class="g-help">Load or paste a resume to generate weights.</span>';
    return;
  }
  container.innerHTML = currentKeywords.map((item) =>
    `<span class="g-chip">${escapeHtml(item.skill)} <b>${item.weight.toFixed(1)}×</b></span>`
  ).join("");
}

function renderWorkday() {
  filteredJobs = jobs.filter(matchesFilters);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filteredJobs.slice(start, start + PAGE_SIZE);
  $("workdaySummary").textContent = `${filteredJobs.length} matching jobs. To inspect all of them here, you would move through ${totalPages} page${totalPages === 1 ? "" : "s"}.`;
  $("pageNote").textContent = `Page ${currentPage} of ${totalPages} · showing ${visible.length} of ${filteredJobs.length}`;
  $("prevPage").disabled = currentPage <= 1;
  $("nextPage").disabled = currentPage >= totalPages;
  $("workdayList").innerHTML = visible.length ? visible.map((job) => `
    <div class="g-job">
      <div class="g-job-title"><strong>${escapeHtml(job.title)}</strong></div>
      <div class="g-meta"><span>${escapeHtml(job.source)}</span><span>•</span><span>${escapeHtml(job.location)}</span><span>•</span><span>${escapeHtml(job.category)}</span></div>
    </div>`).join("") : '<div class="g-empty">No jobs match this search.</div>';
}

function renderGrepper() {
  const pool = jobs.filter(matchesFilters);
  const started = performance.now();
  const ranked = pool.map((job) => scoreJob(job, currentKeywords, $("query").value)).sort((a,b) => b.score - a.score);
  const elapsed = Math.max(0.1, performance.now() - started);
  $("grepperSummary").textContent = `${ranked.length} matching jobs scored in ${elapsed.toFixed(1)} ms locally. Showing the strongest 12 instead of making you inspect every page.`;
  $("grepperList").innerHTML = ranked.length ? ranked.slice(0, 12).map((job) => {
    const matched = job.matched.slice(0, 6);
    return `
      <div class="g-job">
        <div class="g-job-title"><strong>${escapeHtml(job.title)}</strong><span class="g-score">${job.score}%</span></div>
        <div class="g-meta"><span>${escapeHtml(job.source)}</span><span>•</span><span>${escapeHtml(job.location)}</span><span>•</span><span>${escapeHtml(job.category)}</span></div>
        <div class="g-match">${matched.length ? `Matched: ${matched.map((item) => `<b>${escapeHtml(item.skill)}</b>`).join(", ")}` : "No strong resume-signal match."}</div>
      </div>`;
  }).join("") : '<div class="g-empty">No jobs match this search.</div>';
}

function refreshSearch() {
  currentPage = 1;
  renderWorkday();
  renderGrepper();
}

function rerank() {
  currentKeywords = extractKeywords($("resume").value);
  renderKeywords();
  refreshSearch();
}

function populateFilters() {
  snapshot.locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location; option.textContent = location; $("location").appendChild(option);
  });
  snapshot.sources.forEach((source) => {
    const option = document.createElement("option");
    option.value = source; option.textContent = source; $("source").appendChild(option);
  });
}

function replayCollector() {
  const button = $("replayCollector");
  const bar = $("collectorProgress");
  const status = $("collectorStatus");
  button.disabled = true;
  let page = 0;
  const totalPages = Math.ceil(jobs.length / PAGE_SIZE);
  bar.style.width = "0%";
  const timer = window.setInterval(() => {
    page += 1;
    const captured = Math.min(jobs.length, page * PAGE_SIZE);
    bar.style.width = `${Math.min(100, (page / totalPages) * 100)}%`;
    status.textContent = `Walkthrough: normalized page ${page} of ${totalPages} · ${captured} records`;
    if (page >= totalPages) {
      window.clearInterval(timer);
      status.textContent = `Walkthrough complete · ${jobs.length} records ready for ranking`;
      button.disabled = false;
    }
  }, 90);
}

async function init() {
  const response = await fetch(SNAPSHOT_URL);
  if (!response.ok) throw new Error(`Snapshot failed to load: ${response.status}`);
  snapshot = await response.json();
  jobs = expandSnapshot(snapshot);

  $("jobCount").textContent = jobs.length.toLocaleString();
  $("pageCount").textContent = Math.ceil(jobs.length / PAGE_SIZE);
  $("sourceCount").textContent = snapshot.sources.length;
  $("snapshotDate").textContent = snapshot.generated_at;
  populateFilters();

  $("resume").value = SAMPLE_RESUME;
  currentKeywords = extractKeywords(SAMPLE_RESUME);
  renderKeywords();
  renderWorkday();
  renderGrepper();
}

$("sampleResume").addEventListener("click", () => { $("resume").value = SAMPLE_RESUME; rerank(); });
$("rankBtn").addEventListener("click", rerank);
$("query").addEventListener("input", refreshSearch);
$("location").addEventListener("change", refreshSearch);
$("source").addEventListener("change", refreshSearch);
$("prevPage").addEventListener("click", () => { if (currentPage > 1) { currentPage -= 1; renderWorkday(); } });
$("nextPage").addEventListener("click", () => { currentPage += 1; renderWorkday(); });
$("replayCollector").addEventListener("click", replayCollector);
$("resumeFile").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  $("resume").value = await file.text();
  rerank();
});

init().catch((error) => {
  console.error(error);
  $("collectorStatus").textContent = "Demo snapshot could not be loaded.";
  $("workdayList").innerHTML = '<div class="g-empty">Snapshot unavailable.</div>';
  $("grepperList").innerHTML = '<div class="g-empty">Snapshot unavailable.</div>';
});

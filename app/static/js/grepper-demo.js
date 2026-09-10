const SNAPSHOT_URL = "/static/data/grepper-snapshot.json";
const PAGE_SIZE = 20;
const DISPLAY_LIMIT = 20;
const WORKDAY_DELAY_MS = 1700;
const SAMPLE_RESUME = `Senior systems and reliability engineer with experience supporting enterprise infrastructure and production incidents.
Built realistic lab environments with Linux, VMware, networking, VLANs, Fibre Channel, and storage platforms.
Automated operational work using Python, APIs, PowerShell, Bash, Terraform, Git, and CI/CD.
Worked with Kubernetes, containers, observability, troubleshooting, root cause analysis, customer escalations, and technical communication.`;

const SKILLS = [
  "incident response","technical communication","test engineering","fibre channel","root cause","kubernetes","observability",
  "troubleshooting","automation","terraform","networking","storage","vmware","python","linux","ci/cd","containers",
  "customer","cloud","security","api","git","lab","hardware","metrics","tracing","aws","azure","tcp/ip","vlans",
  "javascript","html","css","react","frontend","design systems","sql","analytics","dashboard","excel","reporting"
];

const TITLE_VARIANTS = [
  "", " II", " III", ", Platform", ", Systems", ", Infrastructure", ", Cloud", ", Automation", ", Tools",
  ", Reliability", ", Operations", ", Performance", ", Data Center", ", Developer Productivity", ", Security",
  ", Storage", ", Compute", ", AI Infrastructure", ", Networking", ", Enterprise"
];
const POSTED_LABELS = ["Posted Today", "Posted 2 Days Ago", "Posted 3 Days Ago", "Posted 5 Days Ago", "Posted 7 Days Ago"];
const TIME_TYPES = ["Full time", "Full time", "Full time", "Full time", "Internship", "Part time"];

let snapshot = null;
let jobs = [];
let filteredJobs = [];
let currentPage = 1;
let currentKeywords = [];
let workdayTimer = null;

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[char]));

function expandSnapshot(data) {
  const result = [];
  let index = 1;
  const copies = Math.min(data.copies_per_template || TITLE_VARIANTS.length, TITLE_VARIANTS.length);

  // Interleave base roles so a 20-result page resembles a mixed careers feed
  // instead of grouping many synthetic variants of one title together.
  TITLE_VARIANTS.slice(0, copies).forEach((variant, variantIndex) => {
    data.sources.forEach((source, sourceIndex) => {
      data.templates.forEach((template, templateIndex) => {
        const location = data.locations[(templateIndex + sourceIndex + variantIndex) % data.locations.length];
        result.push({
          id: `G-${String(index).padStart(5, "0")}`,
          source,
          baseTitle: template.title,
          title: `${template.title}${variant}`,
          location,
          category: template.category,
          skills: template.skills,
          summary: template.summary,
          timeType: TIME_TYPES[(index + templateIndex) % TIME_TYPES.length],
          posted: POSTED_LABELS[(index + sourceIndex) % POSTED_LABELS.length]
        });
        index += 1;
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
  const titleText = job.title.toLowerCase();
  const matched = keywords.filter((item) => haystack.includes(item.skill));
  const matchedWeight = matched.reduce((sum, item) => sum + item.weight, 0);
  const totalWeight = keywords.reduce((sum, item) => sum + item.weight, 0);
  const matchRatio = totalWeight ? matchedWeight / totalWeight : 0;

  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const queryHits = queryTerms.filter((term) => haystack.includes(term)).length;
  const titleHits = queryTerms.filter((term) => titleText.includes(term)).length;
  const queryCoverage = queryTerms.length ? queryHits / queryTerms.length : 0;
  const titleCoverage = queryTerms.length ? titleHits / queryTerms.length : 0;

  const score = Math.min(98, Math.round(
    30 + (matchRatio * 64) + (queryCoverage * 3) + (titleCoverage * 3)
  ));
  return { ...job, score, matched, matchRatio };
}

function matchesFilters(job) {
  const query = $("query").value.trim().toLowerCase();
  const location = $("location").value;
  const source = $("source").value;
  const category = $("category").value;
  const timeType = $("timeType").value;
  const text = `${job.title} ${job.category} ${job.summary} ${job.skills.join(" ")}`.toLowerCase();
  const queryTerms = query.split(/\s+/).filter(Boolean);
  const queryMatch = !queryTerms.length || queryTerms.every((term) => text.includes(term));
  return queryMatch
    && (!location || job.location === location)
    && (!source || job.source === source)
    && (!category || job.category === category)
    && (!timeType || job.timeType === timeType);
}

function renderKeywords() {
  const container = $("keywordChips");
  const signalCount = $("signalCount");
  if (signalCount) signalCount.textContent = currentKeywords.length;

  if (!currentKeywords.length) {
    container.innerHTML = '<span class="g-help">Load or paste a resume to generate weights.</span>';
    return;
  }
  container.innerHTML = currentKeywords.map((item) =>
    `<span class="g-chip">${escapeHtml(item.skill)} <b>${item.weight.toFixed(1)}×</b></span>`
  ).join("");
}

function setWorkdayBusy(isBusy, message = "Loading jobs...") {
  $("workdayPanel").setAttribute("aria-busy", String(isBusy));
  ["query", "location", "timeType", "category", "source", "workdaySearchBtn", "prevPage", "nextPage"].forEach((id) => {
    const control = $(id);
    if (control) control.disabled = isBusy;
  });
  if (!isBusy) return;
  $("pageNote").textContent = message;
  $("workdayList").innerHTML = Array.from({ length: 6 }, () =>
    '<div class="g-wd-skeleton"><span></span><span></span></div>'
  ).join("");
}

function renderWorkday() {
  filteredJobs = jobs.filter(matchesFilters);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filteredJobs.slice(start, start + PAGE_SIZE);
  $("workdaySummary").textContent = `${filteredJobs.length.toLocaleString()} JOBS FOUND`;
  $("pageNote").textContent = `Page ${currentPage} of ${totalPages}`;
  $("workdayList").innerHTML = visible.length ? visible.map((job) => `
    <div class="g-wd-job">
      <a tabindex="-1">${escapeHtml(job.title)}</a>
      <div class="g-wd-posted"><span class="g-wd-clock" aria-hidden="true"></span><span>${escapeHtml(job.posted)}</span></div>
    </div>`).join("") : '<div class="g-empty">No jobs match this search.</div>';
  setWorkdayBusy(false);
  $("prevPage").disabled = currentPage <= 1;
  $("nextPage").disabled = currentPage >= totalPages;
}

function scheduleWorkdayRender(message = "Loading jobs...") {
  if (workdayTimer) window.clearTimeout(workdayTimer);
  setWorkdayBusy(true, message);
  workdayTimer = window.setTimeout(() => {
    workdayTimer = null;
    renderWorkday();
  }, WORKDAY_DELAY_MS);
}

function chooseDisplayResults(ranked, limit = DISPLAY_LIMIT) {
  const selected = [];
  const perBaseTitle = new Map();

  for (const job of ranked) {
    const count = perBaseTitle.get(job.baseTitle) || 0;
    if (count >= 2) continue;
    selected.push(job);
    perBaseTitle.set(job.baseTitle, count + 1);
    if (selected.length === limit) return selected;
  }

  if (selected.length < limit) {
    const selectedIds = new Set(selected.map((job) => job.id));
    for (const job of ranked) {
      if (selectedIds.has(job.id)) continue;
      selected.push(job);
      if (selected.length === limit) break;
    }
  }

  return selected;
}

function renderGrepper() {
  const pool = jobs.filter(matchesFilters);
  const started = performance.now();
  const ranked = pool.map((job) => scoreJob(job, currentKeywords, $("query").value)).sort((a,b) =>
    b.score - a.score || b.matchRatio - a.matchRatio || a.title.localeCompare(b.title)
  );
  const elapsed = Math.max(0.1, performance.now() - started);
  const shown = chooseDisplayResults(ranked, DISPLAY_LIMIT);

  $("grepperSummary").textContent = `${ranked.length.toLocaleString()} jobs scanned against ${currentKeywords.length} weighted resume signals in ${elapsed.toFixed(1)} ms.`;
  $("grepperScanned").textContent = ranked.length.toLocaleString();
  $("grepperShown").textContent = shown.length.toLocaleString();
  $("grepperSignals").textContent = currentKeywords.length.toLocaleString();
  $("grepperTime").textContent = `${elapsed.toFixed(1)} ms`;

  $("grepperList").innerHTML = shown.length ? shown.map((job, index) => {
    const matched = job.matched.slice(0, 6);
    return `
      <article class="g-gr-job${index < 3 ? " is-top" : ""}">
        <div class="g-gr-rank">${index + 1}</div>
        <div class="g-gr-main">
          <div class="g-gr-title-row">
            <strong>${escapeHtml(job.title)}</strong>
            <span class="g-gr-score"><b>${job.score}%</b><small>match</small></span>
          </div>
          <div class="g-gr-score-bar" aria-hidden="true"><span style="--match-score:${job.score}%"></span></div>
          <div class="g-gr-meta">
            <span>${escapeHtml(job.category)}</span>
            <span>${escapeHtml(job.location)}</span>
            <span>${escapeHtml(job.source)}</span>
          </div>
          <div class="g-gr-why">Matched signals</div>
          ${matched.length
            ? `<div class="g-gr-skills">${matched.map((item) => `<span class="g-gr-skill">${escapeHtml(item.skill)} ${item.weight.toFixed(1)}×</span>`).join("")}</div>`
            : '<div class="g-gr-no-match">No resume signal hit.</div>'}
        </div>
      </article>`;
  }).join("") : '<div class="g-empty">No jobs match this search.</div>';
}

function updateGrepperImmediately() {
  renderGrepper();
}

function searchWorkday() {
  currentPage = 1;
  renderGrepper();
  scheduleWorkdayRender("Searching jobs...");
}

function filterChanged() {
  currentPage = 1;
  renderGrepper();
  scheduleWorkdayRender("Updating jobs...");
}

function rerank() {
  currentKeywords = extractKeywords($("resume").value);
  renderKeywords();
  renderGrepper();
}

function addOptions(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function populateFilters() {
  addOptions($("location"), snapshot.locations);
  addOptions($("source"), snapshot.sources);
  addOptions($("timeType"), [...new Set(jobs.map((job) => job.timeType))]);
  addOptions($("category"), [...new Set(jobs.map((job) => job.category))].sort());
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
    status.textContent = `Walkthrough: normalized page ${page} of ${totalPages} · ${captured.toLocaleString()} records`;
    if (page >= totalPages) {
      window.clearInterval(timer);
      status.textContent = `Walkthrough complete · ${jobs.length.toLocaleString()} records ready for ranking`;
      button.disabled = false;
    }
  }, 35);
}

async function init() {
  const response = await fetch(SNAPSHOT_URL);
  if (!response.ok) throw new Error(`Snapshot failed to load: ${response.status}`);
  snapshot = await response.json();
  jobs = expandSnapshot(snapshot);

  $("jobCount").textContent = jobs.length.toLocaleString();
  $("pageCount").textContent = Math.ceil(jobs.length / PAGE_SIZE).toLocaleString();
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
$("query").addEventListener("input", updateGrepperImmediately);
$("query").addEventListener("keydown", (event) => { if (event.key === "Enter") searchWorkday(); });
$("workdaySearchBtn").addEventListener("click", searchWorkday);
["location", "timeType", "category", "source"].forEach((id) => $(id).addEventListener("change", filterChanged));
$("prevPage").addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage -= 1;
  scheduleWorkdayRender(`Loading page ${currentPage}...`);
});
$("nextPage").addEventListener("click", () => {
  currentPage += 1;
  scheduleWorkdayRender(`Loading page ${currentPage}...`);
});
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

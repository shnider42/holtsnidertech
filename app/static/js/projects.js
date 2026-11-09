import { TYPE_LABELS, selectProjects, formatAddedDate, projectLink } from './project-catalog.js';

const page = document.querySelector('.projects-page');
const seed = document.querySelector('#projects-data');

if (page && seed) {
  let projects = JSON.parse(seed.textContent);
  const grid = page.querySelector('#project-grid');
  const form = page.querySelector('.pr-search-form');
  const search = page.querySelector('#project-search');
  const sort = page.querySelector('#project-sort');
  const kind = page.querySelector('#project-kind');
  const savedButton = page.querySelector('#saved-filter');
  const empty = page.querySelector('#project-empty');
  const storageKey = 'holtsnider-projects.v1';
  let persisted = {};
  try { persisted = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { /* Private browsing can disable storage. */ }
  const favorites = new Set(Array.isArray(persisted.favorites) ? persisted.favorites.filter(id => typeof id === 'string') : []);
  let view = persisted.view === 'list' ? 'list' : 'covers';
  let state;
  let visible = [];
  let searchTimer;
  let toastTimer;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const external = (className, href, label) => {
    const link = node('a', className, label);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  };
  const persist = () => {
    try { localStorage.setItem(storageKey, JSON.stringify({ favorites: [...favorites], view })); } catch { /* Keep working for the current visit. */ }
  };
  const toast = message => {
    const element = page.querySelector('#project-toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.classList.add('is-visible');
    toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2500);
  };
  const readUrl = () => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const ordering = params.get('sort');
    return {
      query: (params.get('q') || '').slice(0, 200),
      type: Object.hasOwn(TYPE_LABELS, type) ? type : 'all',
      sort: ['newest', 'oldest', 'name', 'type'].includes(ordering) ? ordering : 'newest',
      favoritesOnly: params.get('saved') === '1',
      kind: type === 'games' ? (params.get('kind') || '') : '',
    };
  };
  const writeUrl = (method = 'replace') => {
    const params = new URLSearchParams();
    if (state.type !== 'all') params.set('type', state.type);
    if (state.query.trim()) params.set('q', state.query.trim());
    if (state.sort !== 'newest') params.set('sort', state.sort);
    if (state.favoritesOnly) params.set('saved', '1');
    if (state.kind && state.type === 'games') params.set('kind', state.kind);
    const queryString = params.toString();
    const next = location.pathname + (queryString ? `?${queryString}` : '') + location.hash;
    if (next !== location.pathname + location.search + location.hash) history[method === 'push' ? 'pushState' : 'replaceState']({}, '', next);
  };
  const copy = async text => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      toast('Links copied.');
    } catch {
      const dialog = page.querySelector('#copy-dialog');
      const content = page.querySelector('#copy-content');
      content.value = text;
      dialog.showModal();
      content.focus();
      content.select();
    }
  };
  const updateSaveButtons = () => {
    page.querySelector('[data-saved-count]').textContent = projects.filter(p => favorites.has(p.id)).length;
    savedButton.setAttribute('aria-pressed', String(state.favoritesOnly));
  };

  function makeCard(project) {
    const href = projectLink(project);
    if (!href) return null;
    const card = node('article', 'pr-project');
    card.dataset.project = project.id;
    const cover = node('div', 'pr-cover');
    const coverLink = external('pr-cover-link', href);
    coverLink.tabIndex = -1;
    coverLink.setAttribute('aria-hidden', 'true');
    const img = node('img');
    // Cover URLs come from the same-origin server, with a checked-in fallback.
    img.src = /^\/static\/img\/projects\/[a-z0-9-]+\.svg$/.test(project.art_url || '') ? project.art_url : '/static/img/projects/dayboard.svg';
    img.alt = '';
    img.width = 640;
    img.height = 300;
    img.loading = 'lazy';
    coverLink.append(img);
    const save = node('button', 'pr-save', favorites.has(project.id) ? '★' : '☆');
    save.type = 'button';
    const setSavedLabel = () => {
      const isSaved = favorites.has(project.id);
      save.textContent = isSaved ? '★' : '☆';
      save.setAttribute('aria-pressed', String(isSaved));
      save.setAttribute('aria-label', `${isSaved ? 'Unsave' : 'Save'} ${project.title}`);
      save.title = isSaved ? 'Remove from saved projects' : 'Save for later';
    };
    setSavedLabel();
    save.addEventListener('click', () => {
      if (favorites.has(project.id)) favorites.delete(project.id); else favorites.add(project.id);
      persist();
      if (state.favoritesOnly) {
        render();
        savedButton.focus();
      } else {
        setSavedLabel();
        updateSaveButtons();
      }
    });
    cover.append(coverLink, save);
    const body = node('div', 'pr-project-body');
    const meta = node('div', 'pr-project-meta');
    const date = node('span', 'pr-project-date', formatAddedDate(project));
    date.title = project.dateSource || 'Date added to the collection';
    meta.append(node('span', '', TYPE_LABELS[project.type]), date);
    const title = node('h3');
    const titleLink = external('', href, project.title + ' ');
    const arrow = node('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    titleLink.append(arrow, node('span', 'pr-sr-only', ' (opens in a new tab)'));
    title.append(titleLink);
    const description = node('p', 'pr-description', project.description);
    const bottom = node('div', 'pr-project-bottom');
    const actions = node('div', 'pr-project-actions');
    const copyButton = node('button', 'pr-project-copy', 'Copy link');
    copyButton.type = 'button';
    copyButton.setAttribute('aria-label', `Copy link to ${project.title}`);
    copyButton.addEventListener('click', () => copy(`${project.title}\n${href}`));
    actions.append(external('', href, project.linkKind === 'source' ? 'View source ↗' : 'Open project ↗'), copyButton);
    bottom.append(node('span', 'pr-subtype', project.subtype), actions);
    body.append(meta, title, description, bottom);
    if (project.id === 'empires') body.append(node('p', 'pr-link-note', 'Choose Empires inside the DSL game.'));
    card.append(cover, body);
    return card;
  }

  function render() {
    visible = selectProjects(projects, state, favorites);
    grid.replaceChildren(...visible.map(makeCard).filter(Boolean));
    grid.dataset.view = view;
    search.value = state.query;
    sort.value = state.sort;
    kind.value = state.kind;
    form.elements.type.value = state.type;
    page.querySelector('.pr-kind-field').hidden = state.type !== 'games';
    for (const link of page.querySelectorAll('[data-type]')) {
      if (link.dataset.type === state.type) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      const total = link.dataset.type === 'all' ? projects.length : projects.filter(p => p.type === link.dataset.type).length;
      link.querySelector('span').textContent = total;
    }
    for (const button of page.querySelectorAll('[data-view]')) {
      if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.view === view));
    }
    page.querySelector('#project-results').textContent = `${visible.length} of ${projects.length} projects${state.favoritesOnly ? ' · Saved' : ''}`;
    page.querySelectorAll('[data-project-total]').forEach(el => { el.textContent = projects.length; });
    empty.hidden = visible.length > 0;
    const emptyTitle = empty.querySelector('h3');
    const emptyText = empty.querySelector('p');
    emptyTitle.textContent = state.favoritesOnly ? 'Your saved projects will appear here.' : 'No projects match just yet.';
    emptyText.textContent = state.favoritesOnly ? 'Use the star on any project to keep it handy on this device.' : 'Try a broader word or explore the full collection.';
    updateSaveButtons();
    page.querySelector('#copy-projects').disabled = !visible.length;
  }

  state = readUrl();
  page.querySelector('[data-js-tools]').hidden = false;
  page.querySelectorAll('[data-type]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    clearTimeout(searchTimer);
    state.type = link.dataset.type;
    state.kind = '';
    state.favoritesOnly = false;
    render();
    writeUrl('push');
  }));
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    // Keep typed state immediately so another control cannot discard the query.
    state.query = search.value;
    searchTimer = setTimeout(() => { render(); writeUrl(); }, 120);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearTimeout(searchTimer);
    state.query = search.value;
    state.sort = sort.value;
    state.kind = state.type === 'games' ? kind.value : '';
    render();
    writeUrl('push');
  });
  sort.addEventListener('change', () => { state.sort = sort.value; render(); writeUrl('push'); });
  kind.addEventListener('change', () => { state.kind = kind.value; render(); writeUrl('push'); });
  savedButton.addEventListener('click', () => { state.favoritesOnly = !state.favoritesOnly; render(); writeUrl('push'); });
  page.querySelectorAll('button[data-view]').forEach(button => button.addEventListener('click', () => {
    view = button.dataset.view;
    persist();
    render();
  }));
  page.querySelector('#copy-projects').addEventListener('click', () => copy(visible.map(p => `${p.title}\n${projectLink(p)}`).join('\n\n')));
  page.querySelector('#select-copy-content').addEventListener('click', () => {
    const content = page.querySelector('#copy-content');
    content.focus();
    content.select();
  });
  page.querySelector('#reset-projects').addEventListener('click', event => {
    event.preventDefault();
    clearTimeout(searchTimer);
    state = { query: '', type: 'all', sort: 'newest', favoritesOnly: false, kind: '' };
    render();
    writeUrl('push');
    search.focus();
  });
  window.addEventListener('popstate', () => { clearTimeout(searchTimer); state = readUrl(); render(); });

  const themeButton = page.querySelector('[data-theme-toggle]');
  const showThemeLabel = () => { themeButton.textContent = document.documentElement.dataset.theme === 'light' ? 'Dark mode' : 'Light mode'; };
  themeButton.hidden = false;
  showThemeLabel();
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    const stylesheet = document.querySelector('#light-theme-stylesheet');
    if (stylesheet) stylesheet.disabled = next !== 'light';
    try { localStorage.setItem('holtsnider-theme', next); } catch { /* Theme still works for this visit. */ }
    showThemeLabel();
  });

  render();
  // The initial page already contains a usable catalog. A fresh same-origin
  // response can add new records after the server's background refresh.
  fetch('/api/projects', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) })
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!data || !Array.isArray(data.projects) || !data.projects.length) return;
      if (JSON.stringify(data.projects) === JSON.stringify(projects)) return;
      projects = data.projects;
      const currentKind = state.kind;
      kind.replaceChildren(new Option('All games', ''), ...[...new Set(projects.filter(p => p.type === 'games').map(p => p.subtype))].sort().map(value => new Option(value, value)));
      state.kind = [...kind.options].some(option => option.value === currentKind) ? currentKind : '';
      render();
    })
    .catch(() => { /* Retain the complete server-rendered catalog. */ });
}

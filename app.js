/**
 * PixelDrop — app.js (Final)
 */

const ITEMS_PER_PAGE = 12;
const RECENT_MAX     = 6;
const NEW_DAYS       = 7;

let activeCats   = ['all'];
let searchQuery  = '';
let currentPage  = 1;
let filteredData = [];

// CONTENTS is defined globally by data.js
// We reference window.CONTENTS directly

function getContents() {
  return window.CONTENTS || [];
}

function isNew(d) {
  if (!d) return false;
  return (Date.now() - new Date(d).getTime()) / 864e5 <= NEW_DAYS;
}
function makeEl(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function lsGet(k, f) { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

/* ── THEME ── */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  lsSet('pd_theme', t);
  const i = document.getElementById('theme-icon');
  const l = document.getElementById('theme-label');
  if (i) i.textContent = t === 'dark' ? '🌙' : '☀️';
  if (l) l.textContent = t === 'dark' ? 'Dark' : 'Light';
}
function toggleTheme() {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

/* ── BOOKMARKS ── */
function getBookmarks() { return lsGet('pd_bookmarks', []); }
function isBookmarked(id) { return getBookmarks().includes(id); }
function toggleBookmark(id, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const bm = getBookmarks(), idx = bm.indexOf(id);
  if (idx === -1) { bm.push(id); showToast('📌 Added to Saved!'); }
  else { bm.splice(idx, 1); showToast('🗑️ Removed from Saved'); }
  lsSet('pd_bookmarks', bm);
  document.querySelectorAll(`[data-bm-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', bm.includes(id));
    btn.setAttribute('aria-pressed', bm.includes(id).toString());
  });
  renderBookmarks();
  renderRecommendations();
}

/* ── RECENTLY VIEWED ── */
function getRecent() { return lsGet('pd_recent', []); }
function addRecent(id) {
  let r = getRecent().filter(i => i !== id);
  r.unshift(id);
  if (r.length > RECENT_MAX) r = r.slice(0, RECENT_MAX);
  lsSet('pd_recent', r);
}

/* ── ACHIEVEMENTS ── */
const ACHIEVEMENTS = [
  { count: 1,  msg: '👀 First explore!',               id: 'ach_1'  },
  { count: 5,  msg: '🔍 Explored 5 content!',          id: 'ach_5'  },
  { count: 10, msg: '🏆 Explored 10 content!',         id: 'ach_10' },
  { count: 25, msg: '⭐ True explorer! 25 content!',   id: 'ach_25' },
  { count: 50, msg: '🔥 50 content? Insane!',          id: 'ach_50' },
];
function checkAchievements() {
  const views = lsGet('pd_views', 0);
  ACHIEVEMENTS.forEach(a => {
    if (views >= a.count && !lsGet(a.id, false)) {
      lsSet(a.id, true);
      setTimeout(() => showToast(a.msg, 'achievement'), 600);
    }
  });
}
function incrementViewCount() {
  lsSet('pd_views', (lsGet('pd_views', 0) || 0) + 1);
  checkAchievements();
}

/* ── TOAST ── */
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = makeEl('div', `toast${type ? ' ' + type : ''}`);
  toast.setAttribute('role', 'alert');
  const icon = makeEl('span', 'toast-icon');
  icon.textContent = type === 'achievement' ? '🏆' : 'ℹ️';
  const text = makeEl('span');
  text.textContent = msg;
  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── BUILD CARD ── */
function buildCard(item) {
  const bookmarked = isBookmarked(item.id);
  const card = makeEl('a', 'content-card glass');
  card.href = `detail.html?id=${item.id}`;
  card.setAttribute('role', 'listitem');

  const thumb = makeEl('div', 'card-thumb');
  const img = makeEl('img');
  img.setAttribute('loading', 'lazy');
  img.setAttribute('alt', item.name || '');
  img.src = item.thumbnail || '';
  img.onerror = function() {
    this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="%23222"/><text x="50%" y="50%" text-anchor="middle" fill="%23555" font-size="14">No Image</text></svg>';
  };

  const badges = makeEl('div', 'card-badges');
  if (item.featured) {
    const fb = makeEl('span', 'badge badge-featured');
    fb.textContent = '⭐ Featured';
    badges.appendChild(fb);
  }
  if (isNew(item.dateAdded)) {
    const nb = makeEl('span', 'badge badge-new');
    nb.textContent = '✨ New';
    badges.appendChild(nb);
  }

  const bmBtn = makeEl('button', `bookmark-btn${bookmarked ? ' active' : ''}`);
  bmBtn.setAttribute('aria-pressed', bookmarked.toString());
  bmBtn.setAttribute('data-bm-id', item.id);
  bmBtn.innerHTML = bookmarked
    ? '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>'
    : '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>';
  bmBtn.addEventListener('click', function(e) {
    if (navigator.vibrate) navigator.vibrate(10);
    toggleBookmark(item.id, e);
  });

  thumb.appendChild(img);
  thumb.appendChild(badges);
  thumb.appendChild(bmBtn);

  const body = makeEl('div', 'card-body');
  const name = makeEl('div', 'card-name');
  name.textContent = item.name || '';
  const meta = makeEl('div', 'card-meta');
  const catBadge = makeEl('span', `badge badge-${item.category}`);
  catBadge.textContent = item.category === 'texture' ? 'Texture Pack' : 'Addon';
  const ver = makeEl('span', 'card-version');
  ver.textContent = item.mcpeVersion || '';
  meta.appendChild(catBadge);
  meta.appendChild(ver);
  body.appendChild(name);
  body.appendChild(meta);
  card.appendChild(thumb);
  card.appendChild(body);

  card.addEventListener('click', function() {
    addRecent(item.id);
    incrementViewCount();
  });

  return card;
}

/* ── RENDER GRID ── */
function renderGrid() {
  const CONTENTS = getContents();
  const grid     = document.getElementById('main-grid');
  const empty    = document.getElementById('empty-state');
  const lmWrap   = document.getElementById('load-more-wrapper');
  const countEl  = document.getElementById('results-count');
  if (!grid) return;

  grid.innerHTML = '';

  if (filteredData.length === 0) {
    if (empty)   empty.style.display   = 'block';
    if (lmWrap)  lmWrap.style.display  = 'none';
    if (countEl) countEl.textContent   = '';
    return;
  }

  if (empty)  empty.style.display  = 'none';
  const pageData = filteredData.slice(0, currentPage * ITEMS_PER_PAGE);
  if (countEl) countEl.textContent = `${filteredData.length} item${filteredData.length !== 1 ? 's' : ''}`;
  pageData.forEach(function(item) { grid.appendChild(buildCard(item)); });
  if (lmWrap) lmWrap.style.display = filteredData.length > pageData.length ? 'flex' : 'none';
}

/* ── RENDER SECTIONS ── */
function renderRecent() {
  const CONTENTS = getContents();
  const ids  = getRecent();
  const sec  = document.getElementById('recently-section');
  const grid = document.getElementById('recently-grid');
  if (!sec || !grid) return;
  const items = ids.map(function(id) { return CONTENTS.find(function(c) { return c.id === id; }); }).filter(Boolean);
  if (items.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = '';
  items.forEach(function(item) { grid.appendChild(buildCard(item)); });
}

function renderBookmarks() {
  const CONTENTS = getContents();
  const ids  = getBookmarks();
  const sec  = document.getElementById('bookmark-section');
  const grid = document.getElementById('bookmark-grid');
  if (!sec || !grid) return;
  const items = ids.map(function(id) { return CONTENTS.find(function(c) { return c.id === id; }); }).filter(Boolean);
  if (items.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = '';
  items.forEach(function(item) { grid.appendChild(buildCard(item)); });
}

function renderRecommendations() {
  const CONTENTS = getContents();
  const sec   = document.getElementById('recommend-section');
  const grid  = document.getElementById('recommend-grid');
  if (!sec || !grid) return;
  const recent = getRecent();
  if (recent.length === 0) { sec.style.display = 'none'; return; }
  const recentCats = recent.map(function(id) {
    var c = CONTENTS.find(function(c) { return c.id === id; });
    return c ? c.category : null;
  }).filter(Boolean);
  if (!recentCats.length) { sec.style.display = 'none'; return; }
  const mostCat = recentCats.sort(function(a,b) {
    return recentCats.filter(function(c){return c===b;}).length - recentCats.filter(function(c){return c===a;}).length;
  })[0];
  const recs = CONTENTS.filter(function(c) { return c.category === mostCat && !recent.includes(c.id); }).slice(0, 4);
  if (!recs.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = '';
  recs.forEach(function(item) { grid.appendChild(buildCard(item)); });
}

/* ── FILTERS ── */
function applyFilters() {
  const CONTENTS = getContents();
  var data = CONTENTS.slice();

  if (!activeCats.includes('all')) {
    data = data.filter(function(c) { return activeCats.includes(c.category); });
  }

  if (searchQuery.trim()) {
    var q = searchQuery.toLowerCase();
    data = data.filter(function(c) {
      return c.name.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(function(t) { return t.toLowerCase().includes(q); })) ||
        (c.description && c.description.toLowerCase().includes(q));
    });
  }

  data.sort(function(a,b) { return new Date(b.dateAdded) - new Date(a.dateAdded); });
  data.sort(function(a,b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });

  filteredData = data;
  renderGrid();
}

function resetFilters() {
  activeCats  = ['all'];
  searchQuery = '';
  currentPage = 1;
  var si = document.getElementById('search-input');
  if (si) si.value = '';
  document.querySelectorAll('.filter-btn').forEach(function(b) {
    var isAll = b.dataset.cat === 'all';
    b.classList.toggle('active', isAll);
    b.setAttribute('aria-pressed', isAll.toString());
  });
  applyFilters();
}

/* ── UTILS ── */
function initBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

function initAntiInspect() {
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') { e.preventDefault(); return; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
    if (e.ctrlKey && ['U','S'].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() {

  // Apply saved theme
  setTheme(lsGet('pd_theme', 'dark'));

  // Run app
  applyFilters();
  renderRecent();
  renderBookmarks();
  renderRecommendations();

  var milestone = document.getElementById('milestone-banner');
  if (milestone && getContents().length >= 100) milestone.style.display = 'flex';

  initBackToTop();
  initAntiInspect();

  // Search
  var searchTimer;
  var si = document.getElementById('search-input');
  if (si) {
    si.addEventListener('input', function(e) {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() {
        searchQuery = e.target.value;
        currentPage = 1;
        applyFilters();
      }, 300);
    });
  }

  // Category filter buttons
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (navigator.vibrate) navigator.vibrate(8);
      var cat = btn.dataset.cat;
      if (cat === 'all') {
        activeCats = ['all'];
      } else {
        activeCats = activeCats.filter(function(c) { return c !== 'all'; });
        if (activeCats.includes(cat)) {
          activeCats = activeCats.filter(function(c) { return c !== cat; });
          if (!activeCats.length) activeCats = ['all'];
        } else {
          activeCats.push(cat);
        }
      }
      document.querySelectorAll('.filter-btn').forEach(function(b) {
        var isActive = activeCats.includes(b.dataset.cat) || (activeCats.includes('all') && b.dataset.cat === 'all');
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive.toString());
      });
      currentPage = 1;
      applyFilters();
    });
  });

  // Load More
  var lmBtn = document.getElementById('load-more-btn');
  if (lmBtn) lmBtn.addEventListener('click', function() { currentPage++; applyFilters(); });

  // Theme toggles
  var tt = document.getElementById('theme-toggle');
  if (tt) tt.addEventListener('click', toggleTheme);
  var nt = document.getElementById('nav-theme-btn');
  if (nt) nt.addEventListener('click', toggleTheme);

  // Bookmark nav
  var nb = document.getElementById('nav-bookmark-btn');
  if (nb) nb.addEventListener('click', function() {
    var sec = document.getElementById('bookmark-section');
    if (sec && sec.style.display !== 'none') sec.scrollIntoView({ behavior: 'smooth' });
    else showToast('📌 Nothing saved yet');
  });

  // Clear recently viewed
  var crb = document.getElementById('clear-recent-btn');
  if (crb) crb.addEventListener('click', function() { lsSet('pd_recent', []); renderRecent(); });

  // Clear bookmarks
  var cbb = document.getElementById('clear-bookmark-btn');
  if (cbb) cbb.addEventListener('click', function() {
    lsSet('pd_bookmarks', []);
    renderBookmarks();
    renderRecommendations();
    showToast('🗑️ All saved items cleared');
    document.querySelectorAll('.bookmark-btn').forEach(function(b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
  });
});

window.resetFilters = resetFilters;

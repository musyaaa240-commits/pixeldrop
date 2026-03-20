/**
 * PixelDrop — app.js
 * Homepage logic
 */

const ITEMS_PER_PAGE  = 12;
const RECENT_MAX      = 6;
const MILESTONE_COUNT = 100;
const NEW_DAYS        = 7;

let activeCats   = ['all'];
let searchQuery  = '';
let currentPage  = 1;
let filteredData = [];

function isNew(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / (1000*60*60*24) <= NEW_DAYS;
}
function setText(el, text) { el.textContent = text; }
function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function lsGet(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

/* ── BOOKMARKS ── */
function getBookmarks()        { return lsGet('pd_bookmarks', []); }
function isBookmarked(id)      { return getBookmarks().includes(id); }
function toggleBookmark(id, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const bm  = getBookmarks();
  const idx = bm.indexOf(id);
  if (idx === -1) { bm.push(id); showToast('📌 Added to Saved!'); }
  else            { bm.splice(idx, 1); showToast('🗑️ Removed from Saved'); }
  lsSet('pd_bookmarks', bm);
  document.querySelectorAll(`[data-bm-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', bm.includes(id));
    btn.setAttribute('aria-pressed', bm.includes(id).toString());
  });
  renderBookmarks();
  renderRecommendations();
}

/* ── RECENTLY VIEWED ── */
function getRecent()   { return lsGet('pd_recent', []); }
function addRecent(id) {
  let r = getRecent().filter(i => i !== id);
  r.unshift(id);
  if (r.length > RECENT_MAX) r = r.slice(0, RECENT_MAX);
  lsSet('pd_recent', r);
}

/* ── ACHIEVEMENTS ── */
const ACHIEVEMENTS = [
  { count: 1,  msg: '👀 First explore!',               id: 'ach_1'  },
  { count: 5,  msg: '🔍 You\'ve explored 5 content!',  id: 'ach_5'  },
  { count: 10, msg: '🏆 You\'ve explored 10 content!', id: 'ach_10' },
  { count: 25, msg: '⭐ True explorer! 25 content!',   id: 'ach_25' },
  { count: 50, msg: '🔥 50 content? You\'re insane!',  id: 'ach_50' },
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
  const toast = el('div', `toast${type ? ' ' + type : ''}`);
  toast.setAttribute('role', 'alert');
  const icon = el('span', 'toast-icon'); setText(icon, type === 'achievement' ? '🏆' : 'ℹ️');
  const text = el('span'); setText(text, msg);
  toast.appendChild(icon); toast.appendChild(text);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── BUILD CARD ── */
function buildCard(item) {
  const bookmarked = isBookmarked(item.id);
  const card = el('a', 'content-card glass');
  card.href = `detail.html?id=${item.id}`;
  card.setAttribute('role', 'listitem');
  card.setAttribute('aria-label', `${item.name} — ${item.category === 'texture' ? 'Texture Pack' : 'Addon'}`);

  const thumb = el('div', 'card-thumb');
  const img   = el('img');
  img.setAttribute('loading', 'lazy');
  img.setAttribute('decoding', 'async');
  img.setAttribute('alt', item.name);
  img.src = item.thumbnail || '';
  img.onerror = function() {
    this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="%23222"/><text x="50%" y="50%" text-anchor="middle" fill="%23555" font-size="14">No Image</text></svg>';
  };

  const badges = el('div', 'card-badges');
  if (item.featured) { const fb = el('span','badge badge-featured'); setText(fb,'⭐ Featured'); badges.appendChild(fb); }
  if (isNew(item.dateAdded)) { const nb = el('span','badge badge-new'); setText(nb,'✨ New'); badges.appendChild(nb); }

  const bmBtn = el('button', `bookmark-btn${bookmarked ? ' active' : ''}`);
  bmBtn.setAttribute('aria-label', bookmarked ? 'Remove from saved' : 'Save');
  bmBtn.setAttribute('aria-pressed', bookmarked.toString());
  bmBtn.setAttribute('data-bm-id', item.id);
  bmBtn.innerHTML = bookmarked
    ? '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>'
    : '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>';
  bmBtn.addEventListener('click', (e) => {
    if (navigator.vibrate) navigator.vibrate(10);
    toggleBookmark(item.id, e);
  });

  thumb.appendChild(img); thumb.appendChild(badges); thumb.appendChild(bmBtn);

  const body = el('div', 'card-body');
  const name = el('div', 'card-name'); setText(name, item.name);
  const meta = el('div', 'card-meta');
  const catBadge = el('span', `badge badge-${item.category}`);
  setText(catBadge, item.category === 'texture' ? 'Texture Pack' : 'Addon');
  const ver = el('span', 'card-version'); setText(ver, item.mcpeVersion || '');
  meta.appendChild(catBadge); meta.appendChild(ver);
  body.appendChild(name); body.appendChild(meta);
  card.appendChild(thumb); card.appendChild(body);
  card.addEventListener('click', () => { addRecent(item.id); incrementViewCount(); });
  return card;
}

/* ── SKELETONS ── */
function renderSkeletons(count = 8) {
  const grid = document.getElementById('skeleton-grid');
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const s = el('div', 'skeleton-card');
    s.innerHTML = `<div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>`;
    grid.appendChild(s);
  }
}

/* ── RENDER GRID ── */
function renderGrid() {
  const grid    = document.getElementById('main-grid');
  const empty   = document.getElementById('empty-state');
  const lmWrap  = document.getElementById('load-more-wrapper');
  const countEl = document.getElementById('results-count');
  grid.innerHTML = '';

  if (filteredData.length === 0) {
    empty.style.display = 'block';
    lmWrap.style.display = 'none';
    setText(countEl, '');
    return;
  }
  empty.style.display = 'none';
  const pageData = filteredData.slice(0, currentPage * ITEMS_PER_PAGE);
  setText(countEl, `${filteredData.length} item${filteredData.length !== 1 ? 's' : ''}`);
  pageData.forEach(item => grid.appendChild(buildCard(item)));
  lmWrap.style.display = filteredData.length > pageData.length ? 'flex' : 'none';
  initFadeIn();
  initLazyImages();
}

/* ── RENDER SECTIONS ── */
function renderRecent() {
  const ids   = getRecent();
  const sec   = document.getElementById('recently-section');
  const grid  = document.getElementById('recently-grid');
  const items = ids.map(id => CONTENTS.find(c => c.id === id)).filter(Boolean);
  if (items.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = '';
  items.forEach(item => grid.appendChild(buildCard(item)));
}

function renderBookmarks() {
  const ids   = getBookmarks();
  const sec   = document.getElementById('bookmark-section');
  const grid  = document.getElementById('bookmark-grid');
  const items = ids.map(id => CONTENTS.find(c => c.id === id)).filter(Boolean);
  if (items.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = '';
  items.forEach(item => grid.appendChild(buildCard(item)));
}

function renderRecommendations() {
  const sec   = document.getElementById('recommend-section');
  const grid  = document.getElementById('recommend-grid');
  const recent = getRecent();
  if (recent.length === 0) { sec.style.display = 'none'; return; }
  const recentCats = recent.map(id => CONTENTS.find(c => c.id === id)?.category).filter(Boolean);
  if (recentCats.length === 0) { sec.style.display = 'none'; return; }
  const mostCat = recentCats.sort((a,b) => recentCats.filter(c=>c===b).length - recentCats.filter(c=>c===a).length)[0];
  const recs = CONTENTS.filter(c => c.category === mostCat && !recent.includes(c.id)).slice(0, 4);
  if (recs.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = '';
  recs.forEach(item => grid.appendChild(buildCard(item)));
}

/* ── APPLY FILTERS ── */
function applyFilters() {
  let data = [...CONTENTS];
  if (!activeCats.includes('all')) data = data.filter(c => activeCats.includes(c.category));
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    data = data.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.tags?.some(t => t.toLowerCase().includes(q)) ||
      c.description?.toLowerCase().includes(q)
    );
  }
  // Newest first by default
  data.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  // Featured on top
  data.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  filteredData = data;
  renderGrid();
}

function resetFilters() {
  activeCats  = ['all'];
  searchQuery = '';
  currentPage = 1;
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.filter-btn').forEach(b => {
    const isAll = b.dataset.cat === 'all';
    b.classList.toggle('active', isAll);
    b.setAttribute('aria-pressed', isAll.toString());
  });
  applyFilters();
}

/* ── THEME ── */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  lsSet('pd_theme', theme);
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon)  icon.textContent  = theme === 'dark' ? '🌙' : '☀️';
  if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
}
function toggleTheme() {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

/* ── BACK TO TOP ── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── FADE IN ── */
function initFadeIn() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.05 });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
}

/* ── LAZY IMAGES ── */
function initLazyImages() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { const img = e.target; if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; } obs.unobserve(img); } });
  }, { rootMargin: '200px' });
  document.querySelectorAll('img[loading="lazy"]').forEach(img => obs.observe(img));
}

/* ── ANTI-INSPECT ── */
function initAntiInspect() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.key === 'F12') { e.preventDefault(); return; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
    if (e.ctrlKey && e.key.toUpperCase() === 'U') { e.preventDefault(); return; }
    if (e.ctrlKey && e.key.toUpperCase() === 'S') { e.preventDefault(); return; }
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Restore theme first
  setTheme(lsGet('pd_theme', 'dark'));

  // Render skeletons
  renderSkeletons(8);

  setTimeout(() => {
    document.getElementById('skeleton-grid').style.display = 'none';
    applyFilters();
    renderRecent();
    renderBookmarks();
    renderRecommendations();
    if (CONTENTS.length >= MILESTONE_COUNT) {
      document.getElementById('milestone-banner').style.display = 'flex';
    }
    initBackToTop();
    initFadeIn();
    initLazyImages();
    initAntiInspect();
  }, 500);

  // Search
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { searchQuery = e.target.value; currentPage = 1; applyFilters(); }, 300);
  });

  // Category filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(8);
      const cat = btn.dataset.cat;
      if (cat === 'all') {
        activeCats = ['all'];
      } else {
        activeCats = activeCats.filter(c => c !== 'all');
        if (activeCats.includes(cat)) {
          activeCats = activeCats.filter(c => c !== cat);
          if (activeCats.length === 0) activeCats = ['all'];
        } else {
          activeCats.push(cat);
        }
      }
      document.querySelectorAll('.filter-btn').forEach(b => {
        const isActive = activeCats.includes(b.dataset.cat) || (activeCats.includes('all') && b.dataset.cat === 'all');
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive.toString());
      });
      currentPage = 1;
      applyFilters();
    });
  });

  // Load More
  document.getElementById('load-more-btn').addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(10);
    currentPage++;
    applyFilters();
  });

  // Theme toggle (header)
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Theme toggle (mobile nav)
  document.getElementById('nav-theme-btn')?.addEventListener('click', toggleTheme);

  // Bookmark nav (mobile)
  document.getElementById('nav-bookmark-btn')?.addEventListener('click', () => {
    const sec = document.getElementById('bookmark-section');
    if (sec.style.display !== 'none') sec.scrollIntoView({ behavior: 'smooth' });
    else showToast('📌 Nothing saved yet');
  });

  // Clear recently viewed
  document.getElementById('clear-recent-btn')?.addEventListener('click', () => {
    lsSet('pd_recent', []);
    renderRecent();
  });

  // Clear all bookmarks
  document.getElementById('clear-bookmark-btn')?.addEventListener('click', () => {
    lsSet('pd_bookmarks', []);
    renderBookmarks();
    renderRecommendations();
    showToast('🗑️ All saved items cleared');
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
  });
});

window.resetFilters = resetFilters;

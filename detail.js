/**
 * PixelDrop — detail.js
 * Detail page logic (full English)
 */

function lsGet(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function setText(e, t) { e.textContent = t; }

function isNew(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / (1000*60*60*24) <= 7;
}
function isOutdated(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / (1000*60*60*24*30) >= 6;
}
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }

/* ── TOAST ── */
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const toast = el('div', `toast${type ? ' ' + type : ''}`);
  toast.setAttribute('role', 'alert');
  const icon = el('span', 'toast-icon'); setText(icon, 'ℹ️');
  const text = el('span'); setText(text, msg);
  toast.appendChild(icon); toast.appendChild(text);
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ── BOOKMARKS ── */
function getBookmarks()   { return lsGet('pd_bookmarks', []); }
function isBookmarked(id) { return getBookmarks().includes(id); }
function toggleBookmark(id) {
  if (navigator.vibrate) navigator.vibrate(10);
  const bm = getBookmarks();
  const idx = bm.indexOf(id);
  if (idx === -1) { bm.push(id); showToast('📌 Added to Saved!'); }
  else            { bm.splice(idx, 1); showToast('🗑️ Removed from Saved'); }
  lsSet('pd_bookmarks', bm);
  updateBookmarkBtns(id);
}
function updateBookmarkBtns(id) {
  const bmed = isBookmarked(id);
  document.querySelectorAll(`[data-bm-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', bmed);
    btn.setAttribute('aria-pressed', bmed.toString());
    btn.setAttribute('aria-label', bmed ? 'Remove from saved' : 'Save content');
  });
}

/* ── RECENTLY VIEWED ── */
function addRecent(id) {
  let r = lsGet('pd_recent', []).filter(i => i !== id);
  r.unshift(id);
  if (r.length > 6) r = r.slice(0, 6);
  lsSet('pd_recent', r);
}

/* ── SEO TAGS ── */
function setMetaTags(item) {
  const base = 'https://musyaaa240-commits.github.io/pixeldrop/';
  const url  = `${base}detail.html?id=${item.id}`;
  const cat  = item.category === 'texture' ? 'Texture Pack' : 'Addon';
  const desc = (item.description?.substring(0, 155) || `Download ${item.name} for MCPE.`) + '...';

  document.title = `${item.name} — ${cat} MCPE | PixelDrop`;
  const setMeta = (sel, attr, val) => {
    let m = document.querySelector(sel);
    if (!m) { m = document.createElement('meta'); document.head.appendChild(m); }
    m.setAttribute(attr, val);
  };
  setMeta('meta[name="description"]',        'content', desc);
  setMeta('meta[property="og:title"]',        'content', `${item.name} — ${cat} MCPE | PixelDrop`);
  setMeta('meta[property="og:description"]',  'content', desc);
  setMeta('meta[property="og:image"]',        'content', item.thumbnail ? base + item.thumbnail : base + 'images/og-cover.jpg');
  setMeta('meta[property="og:url"]',          'content', url);
  setMeta('meta[name="twitter:title"]',       'content', item.name);
  setMeta('meta[name="twitter:description"]', 'content', desc);
  setMeta('meta[name="twitter:image"]',       'content', item.thumbnail ? base + item.thumbnail : '');

  let can = document.querySelector('link[rel="canonical"]');
  if (!can) { can = document.createElement('link'); can.rel = 'canonical'; document.head.appendChild(can); }
  can.href = url;

  const ld = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": item.name, "applicationCategory": "Game",
    "operatingSystem": "Android, iOS",
    "description": item.description,
    "softwareVersion": item.changelog?.[0]?.version || "1.0",
    "url": url,
    "image": item.thumbnail ? base + item.thumbnail : '',
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",  "item": base },
        { "@type": "ListItem", "position": 2, "name": cat,     "item": base + `?cat=${item.category}` },
        { "@type": "ListItem", "position": 3, "name": item.name, "item": url }
      ]
    }
  };
  let sc = document.getElementById('ld-json-detail');
  if (!sc) { sc = document.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'ld-json-detail'; document.head.appendChild(sc); }
  sc.textContent = JSON.stringify(ld);
}

/* ── LINK CLOAKING ── */
function decodeUrl(encoded) { try { return atob(encoded); } catch { return ''; } }

/* ── CONFETTI ── */
function fireConfetti() {
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e','#16a34a','#ffffff','#bbf7d0'] });
  }
}

/* ── QR CODE ── */
function generateQR(url) {
  const wrapper = document.getElementById('qr-wrapper');
  if (!wrapper) return;
  if (typeof QRCode !== 'undefined') {
    new QRCode(wrapper, { text: url, width: 140, height: 140, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  } else {
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`;
    img.alt = 'QR Code'; img.width = 140; img.height = 140;
    wrapper.appendChild(img);
  }
}

/* ── SWIPE GESTURE ── */
function initSwipe(currentId) {
  const allIds = CONTENTS.map(c => c.id);
  const idx    = allIds.indexOf(currentId);
  let startX = 0;
  document.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 60) return;
    if (dx < 0 && idx < allIds.length - 1) window.location.href = `detail.html?id=${allIds[idx + 1]}`;
    else if (dx > 0 && idx > 0)            window.location.href = `detail.html?id=${allIds[idx - 1]}`;
  }, { passive: true });
}

/* ── MINI CARD (Related) ── */
function buildMiniCard(item) {
  const card = el('a', 'content-card glass');
  card.href  = `detail.html?id=${item.id}`;
  card.setAttribute('aria-label', item.name);
  const thumb = el('div', 'card-thumb');
  const img   = el('img');
  img.setAttribute('loading', 'lazy');
  img.alt = item.name;
  img.src = item.thumbnail || '';
  img.onerror = function() { this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="112"><rect width="200" height="112" fill="%23222"/></svg>'; };
  const badges = el('div', 'card-badges');
  if (isNew(item.dateAdded)) { const nb = el('span','badge badge-new'); setText(nb,'✨ New'); badges.appendChild(nb); }
  thumb.appendChild(img); thumb.appendChild(badges);
  const body = el('div', 'card-body');
  const name = el('div', 'card-name'); setText(name, item.name);
  const catBadge = el('span', `badge badge-${item.category}`);
  setText(catBadge, item.category === 'texture' ? 'Texture Pack' : 'Addon');
  body.appendChild(name); body.appendChild(catBadge);
  card.appendChild(thumb); card.appendChild(body);
  return card;
}

/* ── RENDER DETAIL ── */
function renderDetail(item) {
  const pageUrl    = window.location.href;
  const cat        = item.category === 'texture' ? 'Texture Pack' : 'Addon';
  const bookmarked = isBookmarked(item.id);
  const wrapper    = el('div', 'detail-wrapper');

  // Breadcrumb
  const bc = el('nav', 'breadcrumb');
  bc.setAttribute('aria-label', 'Breadcrumb');
  bc.innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">›</span><a href="index.html?cat=${item.category}">${cat}</a><span aria-hidden="true">›</span><span aria-current="page"></span>`;
  setText(bc.querySelector('span[aria-current]'), item.name);
  wrapper.appendChild(bc);

  // Ad slot top
  const adTop = el('div', 'ad-slot');
  adTop.setAttribute('role', 'complementary');
  adTop.innerHTML = '<span>[ Ad ]</span>';
  wrapper.appendChild(adTop);

  // Outdated warning
  if (isOutdated(item.lastUpdated)) {
    const warn = el('div', 'outdated-warning fade-in');
    warn.setAttribute('role', 'alert');
    warn.innerHTML = `<span aria-hidden="true">⚠️</span>`;
    const wt = el('span');
    setText(wt, `This content hasn't been updated in over 6 months. It may not be compatible with the latest MCPE version.`);
    warn.appendChild(wt);
    wrapper.appendChild(warn);
  }

  // Screenshot
  const ssContainer = el('div', 'screenshot-container fade-in');
  ssContainer.setAttribute('role', 'button');
  ssContainer.setAttribute('aria-label', 'Zoom image');
  ssContainer.setAttribute('tabindex', '0');
  const ssImg = el('img');
  ssImg.src = item.screenshot || item.thumbnail || '';
  ssImg.alt = `Screenshot of ${item.name}`;
  ssImg.setAttribute('loading', 'eager');
  ssContainer.appendChild(ssImg);
  ssContainer.addEventListener('click', () => { ssContainer.classList.toggle('zoomed'); if (navigator.vibrate) navigator.vibrate(8); });
  ssContainer.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') ssContainer.click(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ssContainer.classList.remove('zoomed'); });
  wrapper.appendChild(ssContainer);

  // Header
  const header = el('div', 'detail-header fade-in');
  const dBadges = el('div', 'detail-badges');
  const catBadge = el('span', `badge badge-${item.category}`); setText(catBadge, cat); dBadges.appendChild(catBadge);
  if (item.featured) { const fb = el('span','badge badge-featured'); setText(fb,'⭐ Featured'); dBadges.appendChild(fb); }
  if (isNew(item.dateAdded)) { const nb = el('span','badge badge-new'); setText(nb,'✨ New'); dBadges.appendChild(nb); }
  const dName = el('h1', 'detail-name'); setText(dName, item.name);
  const dTags = el('div', 'detail-tags');
  (item.tags || []).forEach(tag => { const t = el('span', 'tag'); setText(t, tag); dTags.appendChild(t); });
  header.appendChild(dBadges); header.appendChild(dName); header.appendChild(dTags);
  wrapper.appendChild(header);

  // Info grid
  const infoGrid = el('div', 'info-grid fade-in');
  [
    { label: 'MCPE Version',       value: item.mcpeVersion  || '-' },
    { label: 'File Size',          value: item.fileSize     || '-' },
    { label: 'Download Time',      value: item.downloadTime || '-' },
    { label: 'Install Time',       value: item.installTime  || '-' },
  ].forEach(({ label, value }) => {
    const info = el('div', 'info-item glass');
    const lbl  = el('div', 'info-label'); setText(lbl, label);
    const val  = el('div', 'info-value'); setText(val, value);
    info.appendChild(lbl); info.appendChild(val); infoGrid.appendChild(info);
  });
  wrapper.appendChild(infoGrid);

  // Description
  const descWrap  = el('div', 'fade-in');
  const descTitle = el('div', 'section-header');
  const dt = el('h2', 'section-title'); setText(dt, 'Description');
  descTitle.appendChild(dt);
  const descBox = el('p', 'detail-description'); setText(descBox, item.description || '-');
  descWrap.appendChild(descTitle); descWrap.appendChild(descBox);
  wrapper.appendChild(descWrap);

  // Download section
  const dlSection = el('div', 'download-section glass fade-in');
  const dlBtn = el('button', 'btn btn-primary btn-download');
  dlBtn.setAttribute('aria-label', `Download ${item.name}`);
  dlBtn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`;
  const dlBtnText = el('span'); setText(dlBtnText, `Download ${item.name}`);
  dlBtn.appendChild(dlBtnText);
  dlBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(15);
    fireConfetti();
    const realUrl = decodeUrl(item.downloadUrl);
    if (realUrl) {
      showToast('🚀 Opening download link...');
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = realUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }, 400);
    } else {
      showToast('⚠️ Download link not available');
    }
  });

  // Share row
  const shareRow = el('div', 'share-row');

  const copyBtn = el('button', 'btn btn-secondary');
  copyBtn.setAttribute('aria-label', 'Copy page link');
  copyBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
  const copyText = el('span'); setText(copyText, 'Copy Link');
  copyBtn.appendChild(copyText);
  copyBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(10);
    navigator.clipboard?.writeText(pageUrl).then(() => showToast('🔗 Link copied!')).catch(() => showToast('Failed to copy link'));
  });

  const waBtn = el('a', 'btn btn-secondary');
  waBtn.setAttribute('aria-label', 'Share on WhatsApp');
  waBtn.href   = `https://wa.me/?text=${encodeURIComponent(item.name + ' — Download on PixelDrop: ' + pageUrl)}`;
  waBtn.target = '_blank'; waBtn.rel = 'noopener noreferrer';
  waBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.554 4.099 1.524 5.82L0 24l6.345-1.499C8.035 23.459 9.976 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`;
  const waText = el('span'); setText(waText, 'WhatsApp'); waBtn.appendChild(waText);

  const ttBtn = el('a', 'btn btn-secondary');
  ttBtn.setAttribute('aria-label', 'Share on TikTok');
  ttBtn.href   = `https://www.tiktok.com/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(item.name + ' — Download on PixelDrop!')}`;
  ttBtn.target = '_blank'; ttBtn.rel = 'noopener noreferrer';
  ttBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.78 1.52V7.14a4.85 4.85 0 01-1.01-.45z"/></svg>`;
  const ttText = el('span'); setText(ttText, 'TikTok'); ttBtn.appendChild(ttText);

  const bmBtn = el('button', `btn btn-secondary${bookmarked ? ' active' : ''}`);
  bmBtn.setAttribute('aria-label', bookmarked ? 'Remove from saved' : 'Save content');
  bmBtn.setAttribute('aria-pressed', bookmarked.toString());
  bmBtn.setAttribute('data-bm-id', item.id);
  bmBtn.innerHTML = bookmarked
    ? `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`
    : `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`;
  const bmText = el('span'); setText(bmText, bookmarked ? 'Saved' : 'Save');
  bmBtn.appendChild(bmText);
  bmBtn.addEventListener('click', () => toggleBookmark(item.id));

  shareRow.appendChild(copyBtn); shareRow.appendChild(waBtn); shareRow.appendChild(ttBtn); shareRow.appendChild(bmBtn);
  dlSection.appendChild(dlBtn); dlSection.appendChild(shareRow);
  wrapper.appendChild(dlSection);

  // QR Code
  const qrSection = el('div', 'fade-in');
  const qrTitle   = el('div', 'section-header');
  const qt = el('h2', 'section-title'); setText(qt, 'QR Code');
  qrTitle.appendChild(qt);
  const qrWrap = el('div', 'qr-wrapper'); qrWrap.id = 'qr-wrapper';
  qrSection.appendChild(qrTitle); qrSection.appendChild(qrWrap);
  wrapper.appendChild(qrSection);

  // Changelog
  if (item.changelog?.length > 0) {
    const clSection = el('div', 'fade-in');
    const clTitle   = el('div', 'section-header');
    const ct = el('h2', 'section-title'); setText(ct, 'Changelog');
    clTitle.appendChild(ct);
    const clList = el('ul', 'changelog-list');
    item.changelog.forEach(entry => {
      const li   = el('li', 'changelog-item');
      const ver  = el('span', 'changelog-version'); setText(ver, entry.version);
      const note = el('span', 'changelog-note');    setText(note, entry.note);
      li.appendChild(ver); li.appendChild(note); clList.appendChild(li);
    });
    clSection.appendChild(clTitle); clSection.appendChild(clList);
    wrapper.appendChild(clSection);
  }

  // Related Content
  const related = CONTENTS.filter(c => c.category === item.category && c.id !== item.id).slice(0, 4);
  if (related.length > 0) {
    const relSection = el('section', 'fade-in');
    relSection.style.marginTop = '40px';
    const relHeader = el('div', 'section-header');
    const rt = el('h2', 'section-title'); setText(rt, `More ${cat}`);
    relHeader.appendChild(rt);
    const relGrid = el('div', 'related-grid');
    related.forEach(r => relGrid.appendChild(buildMiniCard(r)));
    relSection.appendChild(relHeader); relSection.appendChild(relGrid);
    wrapper.appendChild(relSection);
  }

  // Ad slot bottom
  const adBot = el('div', 'ad-slot');
  adBot.setAttribute('role', 'complementary');
  adBot.style.marginTop = '32px';
  adBot.innerHTML = '<span>[ Ad ]</span>';
  wrapper.appendChild(adBot);

  // Inject into DOM
  const detailContent = document.getElementById('detail-content');
  detailContent.appendChild(wrapper);
  detailContent.style.display = 'block';
  document.getElementById('detail-loading').style.display = 'none';

  setTimeout(() => generateQR(pageUrl), 800);
  initFadeIn();
  initLazyImages();
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

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function initFadeIn() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
}
function initLazyImages() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { const img = e.target; if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; } obs.unobserve(img); } });
  }, { rootMargin: '200px' });
  document.querySelectorAll('img[loading="lazy"]').forEach(img => obs.observe(img));
}
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
  setTheme(lsGet('pd_theme', 'dark'));
  const id   = getParam('id');
  const item = CONTENTS.find(c => c.id === id);

  if (!item) {
    document.getElementById('detail-loading').style.display  = 'none';
    document.getElementById('detail-notfound').style.display = 'block';
    document.title = '404 — PixelDrop';
    return;
  }

  setMetaTags(item);
  addRecent(item.id);
  renderDetail(item);
  initSwipe(item.id);
  initBackToTop();
  initAntiInspect();

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('nav-theme-btn')?.addEventListener('click', toggleTheme);

  const navBmBtn = document.getElementById('detail-bookmark-nav');
  if (navBmBtn) {
    navBmBtn.setAttribute('data-bm-id', item.id);
    navBmBtn.addEventListener('click', () => toggleBookmark(item.id));
  }
});

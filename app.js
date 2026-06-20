/* ═══════════════════════════════════════════════════════════════════════════
   ProArena TV — Premium IPTV — Vanilla JS (No frameworks)
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────────────────────
const state = {
  channels: [],
  filtered: [],
  activeChannel: null,
  activeStreamIdx: 0,
  category: 'All',
  search: '',
  favorites: JSON.parse(localStorage.getItem('proarena-favs') || '[]'),
  hideBroken: true,
  hls: null,
  playerState: 'idle', // idle | loading | playing | error
};

// ─── SVG Icons (inline) ─────────────────────────────────────────────────────
const icons = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  heartFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  tv: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  star: `★`,
};

// ─── Categories ─────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Favorites', 'FIFA WC 2026', 'Sports', 'News', 'Entertainment', 'Music', 'Kids', 'Religious'];

// ─── Badge helpers ──────────────────────────────────────────────────────────
function badgeClass(badge) {
  if (!badge) return '';
  const b = badge.toLowerCase();
  if (b.includes('🏆') || b.includes('fifa')) return 'ch-badge-fifa-live';
  if (b === 'live') return 'ch-badge-live';
  if (b === 'news') return 'ch-badge-news';
  if (b === 'hd' || b === 'fhd') return 'ch-badge-hd';
  if (b === 'sports' || b === 'cricket') return 'ch-badge-sports';
  return 'ch-badge-default';
}

// ─── Load channels ──────────────────────────────────────────────────────────
async function loadChannels() {
  try {
    const resp = await fetch('./channels.json');
    state.channels = await resp.json();
    applyFilters();
    renderChannelList();
  } catch (e) {
    console.error('Failed to load channels:', e);
  }
}

// ─── Filtering ──────────────────────────────────────────────────────────────
function applyFilters() {
  let list = state.channels;

  // Hide broken
  if (state.hideBroken) {
    list = list.filter(c => c.isWorking !== false);
  }

  // Category
  if (state.category === 'Favorites') {
    list = list.filter(c => state.favorites.includes(c.id));
  } else if (state.category !== 'All') {
    list = list.filter(c => c.category === state.category);
  }

  // Search
  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  state.filtered = list;
}

// ─── Favorites ──────────────────────────────────────────────────────────────
function toggleFavorite(id) {
  const idx = state.favorites.indexOf(id);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    showToast('Removed from favorites');
  } else {
    state.favorites.push(id);
    showToast('Added to favorites ★');
  }
  localStorage.setItem('proarena-favs', JSON.stringify(state.favorites));
  renderChannelList();
}

function isFav(id) {
  return state.favorites.includes(id);
}

// ─── Render: Channel List ───────────────────────────────────────────────────
function renderChannelList() {
  applyFilters();

  const listEl = document.getElementById('channel-list');
  const countEl = document.getElementById('channel-count');

  countEl.textContent = `${state.category === 'All' ? 'All' : state.category} Channels (${state.filtered.length})`;

  if (state.filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        ${icons.search}
        <p>No channels found</p>
        <p class="hint">Try a different search or category</p>
      </div>`;
    return;
  }

  // Build HTML
  const frag = document.createDocumentFragment();

  state.filtered.forEach(ch => {
    const card = document.createElement('div');
    card.className = `channel-card${state.activeChannel?.id === ch.id ? ' active' : ''}`;
    card.dataset.id = ch.id;

    const favd = isFav(ch.id);

    card.innerHTML = `
      <div class="ch-logo">
        <img src="${ch.logo}" alt="${ch.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <span class="avatar" style="display:none;">${ch.name.charAt(0)}</span>
      </div>
      <div class="ch-info">
        <p class="ch-name">${ch.name}</p>
        <div class="ch-meta">
          ${ch.badge ? `<span class="ch-badge ${badgeClass(ch.badge)}">${ch.badge}</span>` : ''}
          <span class="ch-country">${ch.country || ''}</span>
        </div>
      </div>
      <span class="ch-number">CH ${ch.number}</span>
      <button class="ch-fav-btn${favd ? ' fav' : ''}" data-fav="${ch.id}" title="${favd ? 'Remove' : 'Add'} favorite">
        ${favd ? icons.heartFill : icons.plus}
      </button>
    `;

    // Play on click
    card.addEventListener('click', (e) => {
      if (e.target.closest('.ch-fav-btn')) return;
      playChannel(ch);
    });

    // Fav button
    card.querySelector('.ch-fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(ch.id);
    });

    frag.appendChild(card);
  });

  listEl.innerHTML = '';
  listEl.appendChild(frag);
}

// ─── Play Channel ───────────────────────────────────────────────────────────
function playChannel(ch, streamIdx = 0) {
  state.activeChannel = ch;
  state.activeStreamIdx = streamIdx;

  const url = ch.streams[streamIdx]?.url;
  if (!url) return;

  // Update UI active states
  renderChannelList();
  renderNowPlaying();

  // Start playback
  loadStream(url);
}

function loadStream(url) {
  const video = document.getElementById('player-video');
  const idleEl = document.getElementById('player-idle');
  const loadingEl = document.getElementById('player-loading');
  const errorEl = document.getElementById('player-error');
  const overlayTop = document.getElementById('player-overlay-top');
  const qualityBadge = document.getElementById('current-quality');
  const qualitySelector = document.getElementById('quality-selector');

  // Reset states
  if (overlayTop) overlayTop.style.display = 'none';
  if (qualityBadge) qualityBadge.textContent = 'Auto';
  if (qualitySelector) qualitySelector.innerHTML = '<option value="-1">Auto</option>';
  idleEl.style.display = 'none';
  errorEl.style.display = 'none';
  loadingEl.style.display = 'flex';

  // Destroy previous HLS instance
  if (state.hls) {
    state.hls.destroy();
    state.hls = null;
  }

  // HLS stream
  if (url.includes('.m3u8') && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
    });

    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      video.play().catch(() => {});
      loadingEl.style.display = 'none';
      state.playerState = 'playing';

      if (overlayTop && qualitySelector && qualityBadge) {
        overlayTop.style.display = 'flex';
        qualitySelector.innerHTML = '<option value="-1">Auto</option>';
        
        if (hls.levels && hls.levels.length > 1) {
          qualitySelector.parentElement.style.display = 'block';
          hls.levels.forEach((level, index) => {
            const height = level.height ? `${level.height}p` : `Level ${index}`;
            const option = document.createElement('option');
            option.value = index;
            option.textContent = height;
            qualitySelector.appendChild(option);
          });

          qualitySelector.onchange = (e) => {
            hls.currentLevel = parseInt(e.target.value);
          };
        } else {
          qualitySelector.parentElement.style.display = 'none';
        }
      }
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      if (qualityBadge) {
        if (hls.levels && hls.levels[data.level]) {
          const height = hls.levels[data.level].height;
          qualityBadge.textContent = height ? `${height}p` : 'Auto';
        } else {
          qualityBadge.textContent = 'Auto';
        }
      }
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
        state.playerState = 'error';
      }
    });

    state.hls = hls;
  }
  // Native HLS (Safari)
  else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(() => {});
      loadingEl.style.display = 'none';
      state.playerState = 'playing';
    }, { once: true });
    video.addEventListener('error', () => {
      loadingEl.style.display = 'none';
      errorEl.style.display = 'flex';
      state.playerState = 'error';
    }, { once: true });
  }
  // Direct URL
  else {
    video.src = url;
    video.addEventListener('loadeddata', () => {
      video.play().catch(() => {});
      loadingEl.style.display = 'none';
      state.playerState = 'playing';
    }, { once: true });
    video.addEventListener('error', () => {
      loadingEl.style.display = 'none';
      errorEl.style.display = 'flex';
      state.playerState = 'error';
    }, { once: true });
  }
}

// ─── Render: Now Playing Bar ────────────────────────────────────────────────
function renderNowPlaying() {
  const el = document.getElementById('now-playing');
  const ch = state.activeChannel;

  if (!ch) {
    el.style.display = 'none';
    return;
  }

  el.style.display = 'flex';

  const serverBtns = ch.streams.map((s, i) =>
    `<button class="server-btn${i === state.activeStreamIdx ? ' active' : ''}" data-stream="${i}">${s.name}</button>`
  ).join('');

  el.innerHTML = `
    <div class="now-playing-logo">
      <img src="${ch.logo}" alt="${ch.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <span class="fallback" style="display:none;">${ch.name.charAt(0)}</span>
    </div>
    <div class="now-playing-info">
      <h3>${ch.name}</h3>
      <div class="meta">
        <span class="badge-live">LIVE</span>
        <span>${ch.category}</span>
        <span>•</span>
        <span>${ch.quality || 'HD'}</span>
      </div>
    </div>
    <div class="now-playing-servers">${serverBtns}</div>
  `;

  // Server switch
  el.querySelectorAll('.server-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.stream);
      playChannel(ch, idx);
    });
  });
}

// ─── Render: Category Pills ─────────────────────────────────────────────────
function renderCategories() {
  const container = document.getElementById('category-pills');
  container.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    const isFifa = cat === 'FIFA WC 2026';
    btn.className = `pill${state.category === cat ? ' pill-active' : ''}${isFifa ? ' pill-fifa' : ''}`;
    btn.textContent = cat === 'Favorites' ? `★ ${cat}` : cat;
    btn.addEventListener('click', () => {
      state.category = cat;
      renderCategories();
      renderChannelList();
    });
    container.appendChild(btn);
  });
}

// ─── Clock ──────────────────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('header-clock');
  if (el) {
    el.textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  }
}

// ─── Toast ──────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  // Remove existing
  document.querySelectorAll('.toast').forEach(t => t.remove());
  clearTimeout(toastTimer);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  toastTimer = setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function retryStream() {
  if (state.activeChannel) {
    playChannel(state.activeChannel, state.activeStreamIdx);
  }
}

// ─── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Categories
  renderCategories();

  // Search
  const searchInput = document.getElementById('channel-search');
  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value;
    renderChannelList();
  });

  // Keyboard shortcut: /
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Online-only toggle
  const filterBtn = document.getElementById('filter-online');
  filterBtn.addEventListener('click', () => {
    state.hideBroken = !state.hideBroken;
    filterBtn.classList.toggle('active', state.hideBroken);
    filterBtn.textContent = state.hideBroken ? 'Online Only' : 'Show All';
    renderChannelList();
  });

  // Retry button
  document.getElementById('retry-btn').addEventListener('click', retryStream);

  // Import M3U Playlist
  const importBtn = document.getElementById('import-btn');
  const m3uUpload = document.getElementById('m3u-upload');
  
  // URL Import Modal
  const urlImportBtn = document.getElementById('url-import-btn');
  const urlModal = document.getElementById('url-modal');
  const urlInput = document.getElementById('url-input');
  const urlCancel = document.getElementById('url-cancel');
  const urlSubmit = document.getElementById('url-submit');

  function parseM3UContent(text, categoryName = "Imported") {
    const lines = text.split(/\r?\n/);
    let importedCount = 0;
    let lastNumber = state.channels.reduce((max, c) => Math.max(max, c.number || 0), 0);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const commaIdx = line.indexOf(',');
        if (commaIdx !== -1) {
          const name = line.substring(commaIdx + 1).trim();
          let url = '';
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            if (nextLine && !nextLine.startsWith('#')) {
              url = nextLine;
              break;
            }
          }
          if (url) {
            lastNumber++;
            state.channels.push({
              id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + lastNumber,
              name: name,
              number: lastNumber,
              category: categoryName,
              country: "Unknown",
              quality: "SD",
              logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.substring(0,2))}&background=1a1a2e&color=e94560&size=200&bold=true`,
              streams: [{ name: "Stream 1", url: url }],
              isLive: true,
              badge: "",
              isWorking: true
            });
            importedCount++;
          }
        }
      }
    }
    
    if (!CATEGORIES.includes(categoryName) && importedCount > 0) {
      CATEGORIES.push(categoryName);
      renderCategories();
    }
    
    if (importedCount > 0) {
      state.category = categoryName;
      renderCategories();
      renderChannelList();
      showToast(`Imported ${importedCount} channels!`);
    } else {
      showToast(`No channels found.`);
    }
  }

  importBtn.addEventListener('click', () => {
    m3uUpload.click();
  });

  m3uUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      parseM3UContent(event.target.result, "File Import");
      m3uUpload.value = ''; 
    };
    reader.readAsText(file);
  });

  urlImportBtn.addEventListener('click', () => {
    urlModal.style.display = 'flex';
    urlInput.focus();
  });

  urlCancel.addEventListener('click', () => {
    urlModal.style.display = 'none';
    urlInput.value = '';
  });

  urlSubmit.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;
    
    urlSubmit.textContent = 'Loading...';
    urlSubmit.disabled = true;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      parseM3UContent(text, "URL Import");
      urlModal.style.display = 'none';
      urlInput.value = '';
    } catch (error) {
      showToast('Error fetching URL. Check CORS or URL validity.');
      console.error(error);
    } finally {
      urlSubmit.textContent = 'Import';
      urlSubmit.disabled = false;
    }
  });

  // Load channels
  loadChannels();
});

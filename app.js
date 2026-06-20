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
  recent: JSON.parse(localStorage.getItem('proarena-recent') || '[]'),
  theme: localStorage.getItem('proarena-theme') || 'cyan',
  epgData: {}, // Map of tvg-id -> { now: {}, next: {} }
  hideBroken: true,
  renderCount: 50,
  hls: null,
  playerState: 'idle', // idle | loading | playing | error
};

// Apply Theme immediately
function applyTheme(color) {
  state.theme = color;
  localStorage.setItem('proarena-theme', color);
  const root = document.documentElement;
  const themes = {
    cyan: { neon: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    purple: { neon: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
    green: { neon: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    pink: { neon: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
    orange: { neon: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' }
  };
  const t = themes[color] || themes.cyan;
  root.style.setProperty('--neon', t.neon);
  root.style.setProperty('--neon-glow', t.glow);
}
applyTheme(state.theme);

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
const CATEGORIES = ['All', 'Recent', 'Favorites', 'FIFA WC 2026', 'Sports', 'News', 'Entertainment', 'Music', 'Kids', 'Religious'];

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
  } else if (state.category === 'Recent') {
    list = list.filter(c => state.recent.includes(c.id));
    // Sort to match recent order
    list.sort((a, b) => state.recent.indexOf(a.id) - state.recent.indexOf(b.id));
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
  
  // Update DOM directly for performance
  const btn = document.querySelector(`.ch-fav-btn[data-fav="${id}"]`);
  if (btn) {
    const isFavd = state.favorites.includes(id);
    btn.className = `ch-fav-btn${isFavd ? ' fav' : ''}`;
    btn.title = isFavd ? 'Remove favorite' : 'Add favorite';
    btn.innerHTML = isFavd ? icons.heartFill : icons.plus;
    
    // If we're currently viewing the Favorites category, remove the card visually
    if (state.category === 'Favorites' && !isFavd) {
      const card = btn.closest('.channel-card');
      if (card) card.remove();
      const countEl = document.getElementById('channel-count');
      state.filtered = state.filtered.filter(c => c.id !== id);
      countEl.textContent = `Favorites Channels (${state.filtered.length})`;
    }
  }
}

function isFav(id) {
  return state.favorites.includes(id);
}

function appendChannels(startIndex, count) {
  const listEl = document.getElementById('channel-list');
  const toRender = state.filtered.slice(startIndex, startIndex + count);
  
  if (toRender.length === 0) return;

  const html = toRender.map(ch => {
    const favd = isFav(ch.id);
    const isActive = state.activeChannel && state.activeChannel.id === ch.id;
    return `
      <div class="channel-card${isActive ? ' active' : ''}" data-id="${ch.id}">
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
      </div>
    `;
  }).join('');
  
  listEl.insertAdjacentHTML('beforeend', html);
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

  // Clear existing and lazy load first batch
  listEl.innerHTML = '';
  state.renderCount = 50;
  appendChannels(0, state.renderCount);
}

// ─── Play Channel ───────────────────────────────────────────────────────────
function playChannel(ch, streamIdx = 0) {
  state.activeChannel = ch;
  state.activeStreamIdx = streamIdx;

  const url = ch.streams[streamIdx]?.url;
  if (!url) return;

  // Track Recent
  state.recent = state.recent.filter(id => id !== ch.id);
  state.recent.unshift(ch.id);
  if (state.recent.length > 15) state.recent.pop();
  localStorage.setItem('proarena-recent', JSON.stringify(state.recent));

  // Update UI active states natively
  document.querySelectorAll('.channel-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === ch.id);
  });
  renderNowPlaying();

  // Start playback
  loadStream(url);
}

function renderNowPlaying() {
  const ch = state.activeChannel;
  if (!ch) return;

  const badgeEl = document.getElementById('player-badge');
  const titleEl = document.getElementById('player-title');
  const subtitleEl = document.getElementById('player-subtitle');
  const streamsEl = document.getElementById('stream-selector');

  if (ch.badge) {
    badgeEl.textContent = ch.badge;
    badgeEl.className = 'ch-badge ' + badgeClass(ch.badge);
    badgeEl.style.display = 'inline-block';
  } else {
    badgeEl.style.display = 'none';
  }

  titleEl.textContent = ch.name;
  subtitleEl.textContent = `${ch.category} • ${ch.country || 'Unknown'}`;

  // EPG
  const epgInfo = document.getElementById('epg-info');
  const nowTime = document.getElementById('epg-now-time');
  const nowTitle = document.getElementById('epg-now-title');
  const nextTime = document.getElementById('epg-next-time');
  const nextTitle = document.getElementById('epg-next-title');

  if (epgInfo) {
    if (ch.tvgId && state.epgData[ch.tvgId]) {
      const epg = state.epgData[ch.tvgId];
      epgInfo.style.display = 'block';
      nowTime.textContent = epg.now ? epg.now.start : '';
      nowTitle.textContent = epg.now ? epg.now.title : 'No data';
      nextTime.textContent = epg.next ? epg.next.start : '';
      nextTitle.textContent = epg.next ? epg.next.title : '';
    } else {
      epgInfo.style.display = 'none';
    }
  }

  // Streams
  if (ch.streams && ch.streams.length > 1) {
    streamsEl.innerHTML = ch.streams.map((s, idx) => `
      <button class="stream-chip${idx === state.activeStreamIdx ? ' active' : ''}" data-idx="${idx}">
        ${s.name || 'Stream ' + (idx + 1)}
      </button>
    `).join('');
    
    streamsEl.querySelectorAll('.stream-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        playChannel(ch, parseInt(btn.dataset.idx));
      });
    });
  } else {
    streamsEl.innerHTML = '';
  }
}

function loadStream(url) {
  const video = document.getElementById('player-video');
  const idleEl = document.getElementById('player-idle');
  const loadingEl = document.getElementById('player-loading');
  const errorEl = document.getElementById('player-error');
  const overlayTop = document.getElementById('player-overlay-top');
  const qualityBadge = document.getElementById('current-quality');
  const qualitySelector = document.getElementById('quality-selector');
  const ccBtn = document.getElementById('caption-btn');

  // Reset states
  if (overlayTop) overlayTop.style.display = 'none';
  if (qualityBadge) qualityBadge.textContent = 'Auto';
  if (qualitySelector) qualitySelector.innerHTML = '<option value="-1">Auto</option>';
  if (ccBtn) {
    ccBtn.style.display = 'none';
    ccBtn.style.background = 'rgba(0,0,0,0.5)';
    ccBtn.style.color = '#fff';
  }
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
        
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0 && ccBtn) {
          ccBtn.style.display = 'flex';
        }
      }
    });

    hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
      if (data.subtitleTracks.length > 0 && ccBtn) {
        ccBtn.style.display = 'flex';
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

// ─── Utils ────────────────────────────────────────────────────────────────────
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ─── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Categories
  renderCategories();

  // Search (Debounced)
  const searchInput = document.getElementById('channel-search');
  searchInput.addEventListener('input', debounce((e) => {
    state.search = e.target.value;
    renderChannelList();
  }, 300));

  // Channel List Event Delegation & Infinite Scroll
  const channelListEl = document.getElementById('channel-list');
  
  channelListEl.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.ch-fav-btn');
    if (favBtn) {
      e.stopPropagation();
      toggleFavorite(favBtn.dataset.fav);
      return;
    }
    
    const card = e.target.closest('.channel-card');
    if (card) {
      const chId = card.dataset.id;
      const ch = state.filtered.find(c => c.id === chId);
      if (ch) playChannel(ch);
    }
  });

  channelListEl.addEventListener('scroll', () => {
    if (channelListEl.scrollTop + channelListEl.clientHeight >= channelListEl.scrollHeight - 300) {
      if (state.renderCount < state.filtered.length) {
        appendChannels(state.renderCount, 50);
        state.renderCount += 50;
      }
    }
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;
    
    // Zap Up/Down
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!state.activeChannel || state.filtered.length === 0) return;
      const curIdx = state.filtered.findIndex(c => c.id === state.activeChannel.id);
      if (curIdx === -1) return;
      let nextIdx = e.key === 'ArrowDown' ? curIdx + 1 : curIdx - 1;
      if (nextIdx < 0) nextIdx = state.filtered.length - 1;
      if (nextIdx >= state.filtered.length) nextIdx = 0;
      playChannel(state.filtered[nextIdx]);
    }
    
    // Search
    if (e.key === '/') {
      e.preventDefault();
      searchInput.focus();
    }
    
    // Fullscreen (f)
    if (e.key === 'f') {
      const video = document.getElementById('player-video');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen().catch(() => {});
      }
    }
    
    // Mute (m)
    if (e.key === 'm') {
      const video = document.getElementById('player-video');
      video.muted = !video.muted;
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
          
          // Extract tvg-id
          let tvgId = "";
          const tvgIdMatch = line.match(/tvg-id="([^"]+)"/);
          if (tvgIdMatch) tvgId = tvgIdMatch[1];
          
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
              tvgId: tvgId,
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
    try {
      urlSubmit.textContent = 'Importing...';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('HTTP Error ' + resp.status);
      const text = await resp.text();
      parseM3UContent(text, "Imported");
      urlModal.style.display = 'none';
      urlInput.value = '';
    } catch (e) {
      alert('Failed to fetch M3U: ' + e.message + '\n\nIf this is a CORS error, you need a browser extension to bypass it.');
    } finally {
      urlSubmit.textContent = 'Import';
    }
  });

  // Settings Modal & Themes
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCancel = document.getElementById('settings-cancel');
  const settingsSave = document.getElementById('settings-save');
  const themeSwatches = document.querySelectorAll('.theme-swatch');
  const epgInput = document.getElementById('epg-input');
  const pipBtn = document.getElementById('pip-btn');
  const video = document.getElementById('player-video');
  const captionBtn = document.getElementById('caption-btn');

  if (video && video.textTracks) {
    video.textTracks.addEventListener('addtrack', () => {
      let hasCC = false;
      for (let i = 0; i < video.textTracks.length; i++) {
        if (['captions', 'subtitles'].includes(video.textTracks[i].kind)) hasCC = true;
      }
      if (hasCC && captionBtn) captionBtn.style.display = 'flex';
    });
  }

  if (captionBtn) {
    captionBtn.addEventListener('click', () => {
      let toggledOn = false;
      
      // HLS.js tracks
      if (state.hls && state.hls.subtitleTracks && state.hls.subtitleTracks.length > 0) {
        if (state.hls.subtitleTrack === -1) {
          state.hls.subtitleTrack = 0;
          toggledOn = true;
        } else {
          state.hls.subtitleTrack = -1;
        }
      } else if (video && video.textTracks) {
        // Native/Embedded tracks (CEA-608)
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          if (['captions', 'subtitles'].includes(track.kind)) {
            if (track.mode === 'hidden' || track.mode === 'disabled') {
              track.mode = 'showing';
              toggledOn = true;
            } else {
              track.mode = 'hidden';
            }
          }
        }
      }

      if (toggledOn) {
        captionBtn.style.background = 'var(--neon)';
        captionBtn.style.color = '#000';
        showToast('Captions Enabled');
      } else {
        captionBtn.style.background = 'rgba(0,0,0,0.5)';
        captionBtn.style.color = '#fff';
        showToast('Captions Disabled');
      }
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.style.display = 'flex';
      themeSwatches.forEach(s => {
        s.classList.toggle('active', s.dataset.color === state.theme);
      });
    });
  }
  
  if (settingsCancel) {
    settingsCancel.addEventListener('click', () => settingsModal.style.display = 'none');
  }

  themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      applyTheme(swatch.dataset.color);
      themeSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

  if (settingsSave) {
    settingsSave.addEventListener('click', () => {
      settingsModal.style.display = 'none';
      const url = epgInput.value.trim();
      if (url) {
        loadEPG(url);
        epgInput.value = '';
      }
    });
  }

  if (pipBtn && video) {
    pipBtn.addEventListener('click', async () => {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      } catch (err) {
        console.error('PiP Failed:', err);
      }
    });
  }

  // Load channels
  loadChannels();
});

// ─── EPG Logic ──────────────────────────────────────────────────────────────
async function loadEPG(url) {
  try {
    showToast('Fetching EPG...');
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const text = await resp.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const programs = xml.getElementsByTagName('programme');
    const now = new Date();
    
    state.epgData = {};
    for (let i = 0; i < programs.length; i++) {
      const prog = programs[i];
      const channel = prog.getAttribute('channel');
      const startStr = prog.getAttribute('start'); // "20240620180000 +0000"
      const stopStr = prog.getAttribute('stop');
      const titleNode = prog.getElementsByTagName('title')[0];
      const title = titleNode ? titleNode.textContent : 'Unknown';
      
      if (!startStr || !stopStr) continue;
      
      // Basic parse: YYYYMMDDHHMMSS
      const parseTime = (str) => {
        return new Date(
          str.substring(0,4),
          parseInt(str.substring(4,6))-1,
          str.substring(6,8),
          str.substring(8,10),
          str.substring(10,12),
          str.substring(12,14)
        );
      };
      
      const start = parseTime(startStr);
      const stop = parseTime(stopStr);
      const timeStr = start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      if (!state.epgData[channel]) state.epgData[channel] = {};
      
      if (now >= start && now <= stop) {
        state.epgData[channel].now = { start: timeStr, title };
      } else if (now < start && !state.epgData[channel].next) {
        state.epgData[channel].next = { start: timeStr, title };
      }
    }
    showToast('EPG Loaded successfully');
    renderNowPlaying();
  } catch (e) {
    showToast('Failed to load EPG');
    console.error('EPG Error:', e);
  }
}

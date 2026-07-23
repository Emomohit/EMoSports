// Declare Hls globally to make TypeScript happy since we loaded it via CDN script
declare var Hls: any;
declare var Plyr: any;

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'; // Public key for demo
const TMDB_BASE = 'https://api.tmdb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMG_LG = 'https://image.tmdb.org/t/p/original';

const $ = (sel: string) => document.querySelector(sel);
const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));
const PLAY_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const INFO_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

let allLoadedItems: any[] = []; // Cache to lookup items for modals
let myListIds = new Set<number>();

function showToast(msg: string) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function flashProgress() {
  const bar = $("#topProgress") as HTMLElement;
  if (!bar) return;
  bar.style.opacity = "1"; bar.style.width = "30%";
  setTimeout(() => { bar.style.width = "100%"; }, 120);
  setTimeout(() => { bar.style.opacity = "0"; setTimeout(()=>bar.style.width="0",350); }, 500);
}

const PALETTES = [
  ["#2b2d33","#0d0e10"], ["#3a3226","#100e0a"], ["#243330","#0b100f"],
  ["#332b3a","#100d13"], ["#2f2a24","#0f0d0a"], ["#26303a","#0b0e11"],
  ["#3a2b2b","#120b0b"], ["#2a3226","#0c0f0a"], ["#302a3a","#0f0d13"],
  ["#3a3430","#120f0c"], ["#293a3a","#0a1010"], ["#3a2f2b","#120e0b"],
];
function posterStyle(seed: number) {
  const [c1, c2] = PALETTES[seed % PALETTES.length];
  const angle = 100 + (seed * 11) % 70;
  return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
}

/* =========================================================================
   TMDB API FETCHERS
   ========================================================================= */
async function fetchMovies(genreId?: string, page = 1) {
  try {
    const today = new Date().toISOString().split('T')[0];
    let url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=${page}&language=en-US&primary_release_date.lte=${today}`;
    if (genreId) url += `&with_genres=${genreId}`;
    
    const res = await fetch(url);
    const data = await res.json();
    return formatTMDB(data.results, 'movie');
  } catch (err) {
    return [];
  }
}

async function fetchTVShows(page = 1) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=${page}&language=en-US&first_air_date.lte=${today}`);
    const data = await res.json();
    return formatTMDB(data.results, 'tv');
  } catch (err) {
    return [];
  }
}

async function searchTMDB(query: string) {
  try {
    const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
    const data = await res.json();
    return formatTMDB(data.results.filter((i: any) => i.media_type !== 'person'), '');
  } catch (err) {
    return [];
  }
}

function formatTMDB(results: any[], forceType: string) {
  if (!results) return [];
  const items = results.filter((m: any) => m.poster_path).map((m: any) => {
    const isTv = forceType === 'tv' || m.media_type === 'tv';
    return {
      id: m.id,
      title: m.title || m.name,
      year: (m.release_date || m.first_air_date || '2024').substring(0,4),
      rating: m.adult ? '18+' : '16+',
      genres: [isTv ? 'TV Show' : 'Movie'],
      match: Math.floor(Math.random() * 20) + 80,
      duration: isTv ? '1 Season' : 'Film',
      grad: posterStyle(m.id),
      desc: m.overview || "Experience the magic of cinema.",
      cast: "Cast info unavailable.",
      progress: 0,
      isNew: m.popularity > 1000,
      poster: `${TMDB_IMG}${m.poster_path}`,
      backdrop: m.backdrop_path ? `${TMDB_IMG_LG}${m.backdrop_path}` : `${TMDB_IMG}${m.poster_path}`,
      mediaType: isTv ? 'tv' : 'movie',
      iframeSrc: isTv ? `https://autoembed.co/tv/tmdb/${m.id}` : `https://www.2embed.cc/embed/${m.id}`
    };
  });
  
  // Update cache
  items.forEach((i: any) => {
    if (!allLoadedItems.find(x => x.id === i.id)) allLoadedItems.push(i);
  });
  return items;
}

let MOCK_CATALOG: any = { rows: [] };

/* =========================================================================
   UI RENDERING
   ========================================================================= */

export const initApp = async () => {
  renderShimmer();
  
  // Load data
  const [movies, action, tv, newTv] = await Promise.all([
    fetchMovies('', 1), fetchMovies('28', 1),
    fetchTVShows(1), fetchTVShows(2)
  ]);
  
  MOCK_CATALOG.rows = [
    { name: "Top 10 Today", key: "top10", items: movies.slice(0, 10) },
    { name: "Trending Movies", key: "movies", items: movies.slice(10, 20) },
    { name: "Binge-Worthy TV Shows", key: "series", items: tv.slice(0, 10) },
    { name: "Action & Adventure", key: "movies", items: action.slice(0, 10) },
    { name: "New Releases", key: "new", items: newTv.slice(0, 10) }
  ];

  renderHero(movies.slice(0, 5));
  
  setTimeout(() => {
    const loader = $("#loader") as HTMLElement;
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { loader.style.display = "none"; }, 700);
    }
    loadCatalog('home');
  }, 1000);
};

let heroIndex = 0, heroTimer: any = null;
let currentHeroes: any[] = [];

function renderHero(heroes: any[]) {
  currentHeroes = heroes;
  const heroContainer = $("#heroSection");
  if (!heroContainer) return;
  
  heroContainer.innerHTML = heroes.map((h, i) => `
    <div class="hero-slide ${i===0?'active':''}" data-i="${i}">
      <div class="hero-bg-layer" style="background-image:url('${h.backdrop}')"></div>
      <div class="hero-scrim-l"></div>
      <div class="hero-scrim-b"></div>
      <div class="hero-content">
        <div class="hero-eyebrow">emoplay Premium</div>
        <h1 class="hero-title">${h.title}</h1>
        <div class="hero-meta">
           <span>${h.year}</span><span class="dot"></span>
           <span>${h.rating}</span><span class="dot"></span>
           <span>HD</span>
        </div>
        <p class="hero-desc">${h.desc.length > 150 ? h.desc.substring(0, 150) + '...' : h.desc}</p>
        <div class="hero-actions">
          <button class="btn btn-play" onclick="playStream('${h.title.replace(/'/g, "\\'")}', undefined, '${h.iframeSrc}', '${h.backdrop}', '${h.id}', '${h.mediaType}')">${PLAY_SVG} Play</button>
          <button class="btn btn-info" onclick="openModal(${h.id})">${INFO_SVG} More Info</button>
        </div>
      </div>
    </div>
  `).join("") + `<div class="hero-dots">${heroes.map((_,i)=>`<div class="hero-dot ${i===0?'active':''}" data-i="${i}"></div>`).join("")}</div>`;

  $$(".hero-dot").forEach((dot: any) => dot.addEventListener("click", () => goToHero(+dot.dataset.i)));
  startHeroTimer();
}

function goToHero(i: number) {
  heroIndex = i;
  $$(".hero-slide").forEach((s: any) => s.classList.toggle("active", +s.dataset.i === i));
  $$(".hero-dot").forEach((d: any) => d.classList.toggle("active", +d.dataset.i === i));
  startHeroTimer();
}
function startHeroTimer() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goToHero((heroIndex + 1) % currentHeroes.length), 7500);
}

function renderShimmer() {
  const container = $("#rowsContainer");
  if (!container) return;
  container.innerHTML = Array.from({length:3}).map(() => `
    <div class="shimmer-row">
      <div class="shimmer-title"></div>
      <div class="shimmer-track">${Array.from({length:5}).map(()=>'<div class="shimmer-card"></div>').join("")}</div>
    </div>
  `).join("");
}

function loadCatalog(filterKey?: string) {
  flashProgress();
  renderRows(MOCK_CATALOG.rows, filterKey);
}

function renderRows(rows: any[], filterKey?: string) {
  const container = $("#rowsContainer");
  if (!container) return;
  container.innerHTML = "";

  let visibleRows = rows;
  if (filterKey === "mylist") {
    visibleRows = [{ name: "My List", key: "mylist", items: allLoadedItems.filter(t => myListIds.has(t.id)) }];
  } else if (filterKey && filterKey !== "home" && filterKey !== "search") {
    visibleRows = rows.filter(r => r.key === filterKey);
  }

  visibleRows.forEach((row: any) => {
    if (row.items.length === 0) {
      const empty = document.createElement("div");
      empty.style.padding = "0 5% 20px";
      empty.style.color = "var(--text-dim)";
      empty.textContent = filterKey === "mylist" ? "Your list is empty. Add titles with the + button." : "Nothing here yet.";
      container.appendChild(empty);
      return;
    }
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    const isTop10 = row.key === "top10";
    rowEl.innerHTML = `
      <div class="row-title">${row.name}</div>
      <div class="row-track-wrap">
        <button class="row-arrow left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div class="row-track" data-key="${row.key}"></div>
        <button class="row-arrow right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
    `;
    const track = rowEl.querySelector(".row-track");
    if (!track) return;
    
    row.items.forEach((item: any, idx: number) => {
      const card = buildCard(item);
      if (isTop10) {
        const wrap = document.createElement("div");
        wrap.className = "rank-wrap";
        wrap.innerHTML = `<div class="rank-num">${idx+1}</div>`;
        wrap.appendChild(card);
        track.appendChild(wrap);
      } else {
        track.appendChild(card);
      }
    });
    
    rowEl.querySelector(".left")?.addEventListener("click", () => track.scrollBy({left:-820, behavior:"smooth"}));
    rowEl.querySelector(".right")?.addEventListener("click", () => track.scrollBy({left:820, behavior:"smooth"}));
    container.appendChild(rowEl);
  });
}

function buildCard(item: any) {
  const wrap = document.createElement("div");
  wrap.className = "card-wrap";
  wrap.innerHTML = `
    <div class="card-thumb">
      <div class="art-bg" style="background-image:url('${item.poster}')"></div>
      <div class="art-scrim"></div>
      ${item.isNew ? `<div class="pill-tag">New</div>` : ""}
      <div class="play-glass"><span>${PLAY_SVG}</span></div>
    </div>
    <div class="card-info">
      <div>
        <div class="card-title">${item.title}</div>
        <div class="card-meta">${item.rating} · ${item.genres[0]}</div>
      </div>
      <button class="card-add" title="Add to My List">${myListIds.has(item.id) ? "&#10003;" : "+"}</button>
    </div>
  `;
  wrap.querySelector(".card-thumb")?.addEventListener("click", () => openModal(item.id));
  wrap.querySelector(".card-title")?.addEventListener("click", () => openModal(item.id));
  wrap.querySelector(".play-glass")?.addEventListener("click", (e) => { 
    e.stopPropagation(); 
    playStream(item.title, undefined, item.iframeSrc, item.poster, item.id, item.mediaType);
  });
  wrap.querySelector(".card-add")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (myListIds.has(item.id)) { myListIds.delete(item.id); showToast(`Removed "${item.title}" from My List`); }
    else { myListIds.add(item.id); showToast(`Added "${item.title}" to My List`); }
    (e.currentTarget as HTMLElement).innerHTML = myListIds.has(item.id) ? "&#10003;" : "+";
  });
  return wrap;
}

/* =========================================================================
   MODAL LOGIC
   ========================================================================= */
function openModal(id: number) {
  const item = allLoadedItems.find(x => x.id === id);
  if (!item) return;
  const similar = allLoadedItems.filter(x => x.id !== id && x.mediaType === item.mediaType).slice(0, 6);
  
  const modalContent = $("#modalContent");
  if (!modalContent) return;
  
  modalContent.innerHTML = `
    <div class="modal-hero">
      <div class="art-bg" style="background-image:url('${item.backdrop}')"></div>
      <div class="hero-scrim-b"></div>
      <button class="modal-close" id="modalCloseBtn">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-title">${item.title}</div>
      <div class="modal-meta">
        <span>${item.year}</span><span class="dot"></span>
        <span>${item.rating}</span><span class="dot"></span>
        <span>${item.duration}</span><span class="dot"></span>
        <span>${item.match}% Match</span>
      </div>
      <div class="modal-actions">
        <button class="btn btn-play" id="modalPlay">${PLAY_SVG} Play</button>
        <button class="btn btn-info" id="modalList">${myListIds.has(item.id) ? "&#10003; In My List" : "+ My List"}</button>
      </div>
      <p class="modal-desc">${item.desc}</p>
      <p class="modal-cast"><b>Genres </b>${item.genres.join(", ")}</p>
    </div>
    ${similar.length ? `
    <div class="modal-similar">
      <div class="modal-similar-title">More Like This</div>
      <div class="modal-similar-grid">
        ${similar.map(s => `<div class="modal-mini" data-id="${s.id}"><div class="modal-mini-thumb"><div class="art-bg" style="background-image:url('${s.poster}')"></div></div><span>${s.title}</span></div>`).join("")}
      </div>
    </div>` : ""}
  `;
  
  const modalOverlay = $("#modalOverlay") as HTMLElement;
  if (modalOverlay) modalOverlay.style.display = "flex";
  
  $("#modalCloseBtn")?.addEventListener("click", closeModal);
  $("#modalPlay")?.addEventListener("click", () => {
      closeModal();
      playStream(item.title, undefined, item.iframeSrc, item.backdrop, item.id, item.mediaType);
  });
  $("#modalList")?.addEventListener("click", () => {
    if (myListIds.has(item.id)) myListIds.delete(item.id); else myListIds.add(item.id);
    const mlist = $("#modalList");
    if (mlist) mlist.innerHTML = myListIds.has(item.id) ? "&#10003; In My List" : "+ My List";
  });
  $$(".modal-mini").forEach((el: any) => el.addEventListener("click", () => openModal(+el.dataset.id)));
}

function closeModal() { 
    const o = $("#modalOverlay") as HTMLElement;
    if (o) o.style.display = "none"; 
}
$("#modalOverlay")?.addEventListener("click", (e) => { if ((e.target as HTMLElement).id === "modalOverlay") closeModal(); });

/* =========================================================================
   NAV & SEARCH LOGIC
   ========================================================================= */
window.addEventListener("scroll", () => {
  $("#mainNav")?.classList.toggle("scrolled", window.scrollY > 40);
});

$$(".nav-links a").forEach((link: any) => {
  link.addEventListener("click", (e: Event) => {
    e.preventDefault();
    $$(".nav-links a").forEach((a: any) => a.classList.remove("active"));
    link.classList.add("active");
    loadCatalog(link.dataset.cat);
    window.scrollTo({top: 0, behavior:"smooth"});
  });
});

$("#searchToggle")?.addEventListener("click", () => {
  $("#searchBox")?.classList.toggle("open");
  ($("#searchInput") as HTMLInputElement)?.focus();
});

let searchTimeout: any = null;
$("#searchInput")?.addEventListener("input", async (e) => {
  const q = (e.target as HTMLInputElement).value.trim();
  if (searchTimeout) clearTimeout(searchTimeout);
  
  if (!q) { 
      loadCatalog('home'); 
      return; 
  }
  
  searchTimeout = setTimeout(async () => {
    flashProgress();
    const results = await searchTMDB(q);
    renderRows([{ name: `Results for "${q}"`, key:"search", items: results }], "search");
  }, 600);
});

/* =========================================================================
   VIDEO PLAYER LOGIC (EXISTING)
   ========================================================================= */
const clipViewer = document.getElementById('clipViewer');
const clipImg = document.getElementById('clipImg') as HTMLImageElement;
const clipVideo = document.getElementById('clipVideo') as HTMLVideoElement;
const clipName = document.getElementById('clipName');
let hlsInstance: any = null;
let plyrPlayer: any = null;

let currentTmdbId = '';
let currentMediaType = '';

function initPlyr() {
  if (!plyrPlayer && clipVideo) {
    plyrPlayer = new Plyr(clipVideo, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'fullscreen'],
      settings: ['quality', 'speed'],
      autoplay: true,
    });
  }
}

function closeClip() {
  if (clipViewer) clipViewer.classList.add('hidden');
  if (clipVideo) {
    if (plyrPlayer) plyrPlayer.stop();
    else clipVideo.pause();
    clipVideo.src = '';
  }
  const plyrContainer = document.querySelector('.plyr') as HTMLElement;
  if (plyrContainer) plyrContainer.style.display = 'none';
  if (clipImg) clipImg.style.display = 'block';
  const clipIframe = document.getElementById('clipIframe') as HTMLIFrameElement;
  if (clipIframe) {
    clipIframe.src = '';
    clipIframe.style.display = 'none';
  }
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

document.getElementById('clipClose')?.addEventListener('click', closeClip);

function playStream(title: string, streamUrl?: string, iframeSrc?: string, imgSrc?: string, tmdbId?: string, mediaType?: string) {
  if (!clipViewer) return;
  clipViewer.classList.remove('hidden');
  if (clipName) clipName.textContent = title;
  
  const playerSettingsBtn = document.getElementById('playerSettingsBtn');
  if (tmdbId && mediaType) {
    currentTmdbId = tmdbId;
    currentMediaType = mediaType;
    if (playerSettingsBtn) playerSettingsBtn.style.display = 'block';
    document.querySelectorAll('.server-btn').forEach((b, i) => {
      if(i === 0) b.classList.add('active');
      else b.classList.remove('active');
    });
  } else {
    currentTmdbId = '';
    currentMediaType = '';
    if (playerSettingsBtn) playerSettingsBtn.style.display = 'none';
  }

  const clipMini = document.getElementById('clipMini') as HTMLImageElement;
  if (clipMini && imgSrc) {
    clipMini.src = imgSrc;
    clipMini.style.display = 'block';
  } else if (clipMini) {
    clipMini.style.display = 'none';
  }
  
  const clipIframe = document.getElementById('clipIframe') as HTMLIFrameElement;

  if (iframeSrc) {
    if (clipImg) clipImg.style.display = 'none';
    if (clipVideo) {
      clipVideo.pause();
      clipVideo.style.display = 'none';
    }
    const plyrContainer = document.querySelector('.plyr') as HTMLElement;
    if (plyrContainer) plyrContainer.style.display = 'none';
    
    if (clipIframe) {
      if (tmdbId) {
         const activeServerBtn = document.querySelector('.server-btn.active') as HTMLElement;
         if (activeServerBtn) activeServerBtn.click();
      } else {
         clipIframe.src = iframeSrc;
      }
      clipIframe.style.display = 'block';
    }
  } else if (streamUrl && clipVideo) {
    if (clipImg) clipImg.style.display = 'none';
    if (clipIframe) {
      clipIframe.src = '';
      clipIframe.style.display = 'none';
    }
    initPlyr(); 
    const plyrContainer = document.querySelector('.plyr') as HTMLElement;
    if (plyrContainer) plyrContainer.style.display = 'block';

    if (Hls.isSupported()) {
      if (hlsInstance) hlsInstance.destroy();
      hlsInstance = new Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(clipVideo);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        if (plyrPlayer) plyrPlayer.play().catch((e: any) => console.log('Autoplay prevented:', e));
        else clipVideo.play().catch(e => console.log('Autoplay prevented:', e));
      });
      hlsInstance.on(Hls.Events.ERROR, function (_event: any, data: any) {
        if (data.fatal) closeClip();
      });
    } else if (clipVideo.canPlayType('application/vnd.apple.mpegurl')) {
      clipVideo.src = streamUrl;
      clipVideo.addEventListener('loadedmetadata', function () {
        clipVideo.play().catch(e => console.log('Autoplay prevented:', e));
      });
    }
  }
}

/* ---------------- PLAYER SETTINGS & LANGUAGE LOGIC ---------------- */
document.querySelectorAll('.server-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const server = btn.getAttribute('data-server');
    const clipIframe = document.getElementById('clipIframe') as HTMLIFrameElement;
    if (!clipIframe) return;
    
    let url = '';
    if (server === '2embed') {
       url = currentMediaType === 'tv' ? `https://www.2embed.cc/embedtv/${currentTmdbId}&s=1&e=1` : `https://www.2embed.cc/embed/${currentTmdbId}`;
    } else if (server === 'autoembed') {
       url = `https://autoembed.co/${currentMediaType}/tmdb/${currentTmdbId}`;
    } else if (server === 'vidsrccc') {
       url = `https://vidsrc.cc/v2/embed/${currentMediaType}/${currentTmdbId}`;
    } else if (server === 'vidlink') {
       url = `https://vidlink.pro/${currentMediaType}/${currentTmdbId}?primaryColor=0a84ff&autoplay=false`;
    }
    
    clipIframe.src = url;
  });
});

const playerSettingsBtn = document.getElementById('playerSettingsBtn');
const playerSettingsMenu = document.getElementById('playerSettingsMenu');
if (playerSettingsBtn && playerSettingsMenu) {
  playerSettingsBtn.addEventListener('click', () => {
    playerSettingsMenu.classList.toggle('hidden');
  });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const lang = btn.getAttribute('data-lang');
    const langHint = document.getElementById('langHint');
    
    if (lang === 'hi') {
      if (langHint) langHint.style.display = 'block';
      const vidlinkBtn = document.querySelector('.server-btn[data-server="vidlink"]') as HTMLElement;
      if (vidlinkBtn) vidlinkBtn.click();
    } else {
      if (langHint) langHint.style.display = 'none';
      const twoembedBtn = document.querySelector('.server-btn[data-server="2embed"]') as HTMLElement;
      if (twoembedBtn) twoembedBtn.click();
    }
  });
});

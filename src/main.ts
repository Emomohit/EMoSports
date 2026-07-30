// Declare Hls globally to make TypeScript happy since we loaded it via CDN script
declare var Hls: any;
declare var Plyr: any;

import { fetchMovies, fetchTVShows, searchTMDB } from './services/tmdb';
import { allLoadedItems, myListIds, toggleMyList } from './services/store';
import { $, $$, PLAY_SVG, INFO_SVG, showToast, flashProgress } from './utils/ui-helpers';

let MOCK_CATALOG: any = { rows: [] };

/* =========================================================================
   UI RENDERING
   ========================================================================= */

export const initApp = async () => {
  renderShimmer();
  
  // Load data from TMDB service
  const [movies, action, tv, newTv] = await Promise.all([
    fetchMovies('', 1), fetchMovies('28', 1),
    fetchTVShows(1), fetchTVShows(2)
  ]);
  
  // India's Got Latent Custom Mock Data
  const latentEpisodes: any[] = [
    {
      id: 999901,
      title: "India's Got Latent - EP 1",
      year: "2026",
      rating: "9.9",
      match: "99% Match",
      duration: "1h 45m",
      desc: "The very first episode of India's Got Latent Season 2 featuring Alia Bhatt, Sharvari, and Ashish Solanki.",
      poster: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
      backdrop: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
      iframeSrc: "https://www.youtube.com/embed/eHTXQW58WhA?autoplay=1",
      mediaType: "tv",
      genres: ["Comedy", "Reality"],
      cast: ["Samay Raina", "Alia Bhatt", "Ashish Solanki"],
      director: "Samay Raina",
      grad: "linear-gradient(135deg, #2b2d33 0%, #0d0e10 100%)",
      videoUrl: ""
    },
    {
      id: 999902,
      title: "India's Got Latent - EP 2",
      year: "2026",
      rating: "9.8",
      match: "98% Match",
      duration: "1h 30m",
      desc: "Episode 2 of Season 2 featuring Chandan Prabhakar, Kiku Sharda, and Haarsh Limbachiyaa.",
      poster: "https://i.ytimg.com/vi/1r_090_0O2M/maxresdefault.jpg",
      backdrop: "https://i.ytimg.com/vi/1r_090_0O2M/maxresdefault.jpg",
      iframeSrc: "https://www.youtube.com/embed/1r_090_0O2M?autoplay=1",
      mediaType: "tv",
      genres: ["Comedy", "Reality"],
      cast: ["Samay Raina", "Kiku Sharda"],
      director: "Samay Raina",
      grad: "linear-gradient(135deg, #2b2d33 0%, #0d0e10 100%)",
      videoUrl: ""
    },
    {
      id: 999903,
      title: "India's Got Latent - EP 3",
      year: "2026",
      rating: "9.7",
      match: "97% Match",
      duration: "1h 25m",
      desc: "Episode 3 of Season 2 full of comedy and latent talent.",
      poster: "https://i.ytimg.com/vi/vBw9jQp749k/maxresdefault.jpg",
      backdrop: "https://i.ytimg.com/vi/vBw9jQp749k/maxresdefault.jpg",
      iframeSrc: "https://www.youtube.com/embed/vBw9jQp749k?autoplay=1",
      mediaType: "tv",
      genres: ["Comedy", "Reality"],
      cast: ["Samay Raina", "Various"],
      director: "Samay Raina",
      grad: "linear-gradient(135deg, #2b2d33 0%, #0d0e10 100%)",
      videoUrl: ""
    },
    {
      id: 999904,
      title: "India's Got Latent - EP 4",
      year: "2026",
      rating: "9.8",
      match: "99% Match",
      duration: "1h 40m",
      desc: "The highly anticipated Episode 4 of Season 2 featuring more chaotic talent evaluations.",
      poster: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg", // Using EP1 thumbnail as placeholder since EP4 is unreleased
      backdrop: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
      iframeSrc: "https://www.youtube.com/embed/eHTXQW58WhA?autoplay=1",
      mediaType: "tv",
      genres: ["Comedy", "Reality"],
      cast: ["Samay Raina", "Guest Judges"],
      director: "Samay Raina",
      grad: "linear-gradient(135deg, #2b2d33 0%, #0d0e10 100%)",
      videoUrl: ""
    },
    {
      id: 999905,
      title: "India's Got Latent - Bonus EP 1",
      year: "2026",
      rating: "9.9",
      match: "99% Match",
      duration: "1h 50m",
      desc: "Members Only Bonus Episode featuring Raghav Juyal, Munawar Faruqui, Niharika NM, and Rohan Joshi.",
      poster: "https://i.ytimg.com/vi/1r_090_0O2M/maxresdefault.jpg", // Placeholder thumbnail
      backdrop: "https://i.ytimg.com/vi/1r_090_0O2M/maxresdefault.jpg",
      iframeSrc: "https://www.youtube.com/embed/1r_090_0O2M?autoplay=1",
      mediaType: "tv",
      genres: ["Comedy", "Reality", "Exclusive"],
      cast: ["Samay Raina", "Raghav Juyal", "Munawar Faruqui", "Niharika NM", "Rohan Joshi"],
      director: "Samay Raina",
      grad: "linear-gradient(135deg, #2b2d33 0%, #0d0e10 100%)",
      videoUrl: ""
    }
  ];

  // Populate items cache for modal lookups
  const allFetched = [...movies, ...action, ...tv, ...newTv, ...latentEpisodes];
  allFetched.forEach(item => {
    if (!allLoadedItems.find(x => x.id === item.id)) allLoadedItems.push(item);
  });

  MOCK_CATALOG.rows = [
    { name: "Top 10 Today", key: "top10", items: movies.slice(0, 10) },
    { name: "Trending Movies", key: "movies", items: movies.slice(10, 20) },
    { name: "India's Got Latent 🔥", key: "latent", items: latentEpisodes },
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

  // Initialize event listeners
  setupEventListeners();
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
    const isAdded = toggleMyList(item.id);
    showToast(isAdded ? `Added "${item.title}" to My List` : `Removed "${item.title}" from My List`);
    (e.currentTarget as HTMLElement).innerHTML = isAdded ? "&#10003;" : "+";
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
      playStream(item.title, undefined, item.iframeSrc, item.backdrop, String(item.id), item.mediaType);
  });
  $("#modalList")?.addEventListener("click", () => {
    const isAdded = toggleMyList(item.id);
    const mlist = $("#modalList");
    if (mlist) mlist.innerHTML = isAdded ? "&#10003; In My List" : "+ My List";
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
function setupEventListeners() {
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

  document.getElementById('clipClose')?.addEventListener('click', closeClip);

  document.querySelectorAll('.server-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const server = btn.getAttribute('data-server');
      const clipIframe = document.getElementById('clipIframe') as HTMLIFrameElement;
      if (!clipIframe) return;
      
      let url = '';
      if (server === 'vidsrcto') {
         url = `https://vidsrc.to/embed/${currentMediaType}/${currentTmdbId}`;
      } else if (server === 'vidsrcme') {
         url = currentMediaType === 'tv' ? `https://vidsrc.me/embed/tv?tmdb=${currentTmdbId}&season=1&episode=1` : `https://vidsrc.me/embed/movie?tmdb=${currentTmdbId}`;
      } else if (server === 'multiembed') {
         url = `https://multiembed.mov/?video_id=${currentTmdbId}&tmdb=1`;
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
}

/* =========================================================================
   VIDEO PLAYER LOGIC (EXISTING)
   ========================================================================= */
const getClipElements = () => ({
  clipViewer: document.getElementById('clipViewer'),
  clipImg: document.getElementById('clipImg') as HTMLImageElement,
  clipVideo: document.getElementById('clipVideo') as HTMLVideoElement,
  clipName: document.getElementById('clipName')
});
let hlsInstance: any = null;
let plyrPlayer: any = null;

let currentTmdbId = '';
let currentMediaType = '';

function initPlyr() {
  const { clipVideo } = getClipElements();
  if (!plyrPlayer && clipVideo) {
    plyrPlayer = new Plyr(clipVideo, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'fullscreen'],
      settings: ['quality', 'speed'],
      autoplay: true,
    });
  }
}

function closeClip() {
  const { clipViewer, clipVideo, clipImg } = getClipElements();
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

function playStream(title: string, streamUrl?: string, iframeSrc?: string, imgSrc?: string, tmdbId?: string, mediaType?: string) {
  const { clipViewer, clipName, clipImg, clipVideo } = getClipElements();
  
  if (!clipViewer) return;
  clipViewer.classList.remove('hidden');
  if (clipName) clipName.textContent = title;
  
  const playerSettingsBtn = document.getElementById('playerSettingsBtn');
  // Check if tmdbId is valid (not a mock custom ID)
  const isRealTmdb = tmdbId && parseInt(tmdbId) < 900000;

  if (isRealTmdb && mediaType) {
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
      if (isRealTmdb) {
         const activeServerBtn = document.querySelector('.server-btn.active') as HTMLElement;
         if (activeServerBtn) activeServerBtn.click();
      } else if (iframeSrc) {
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

// Expose functions globally for inline HTML onclick handlers
(window as any).playStream = playStream;
(window as any).openModal = openModal;

/* ---------------- PLAYER SETTINGS & LANGUAGE LOGIC ---------------- */


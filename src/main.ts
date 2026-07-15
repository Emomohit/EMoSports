
// Declare Hls globally to make TypeScript happy since we loaded it via CDN script
declare var Hls: any;

/* ---------------- NAV SCROLL SHADOW ---------------- */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
}

/* ---------------- PAGE ROUTING ---------------- */
const pages = ['home', 'movies', 'tvshows', 'sports', 'originals', 'search'];
const navLinks = document.getElementById('navLinks');
if (navLinks) {
  navLinks.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('button[data-page]') as HTMLElement;
    if (!btn) return;
    goToPage(btn.dataset.page!);
  });
}
function goToPage(name: string) {
  pages.forEach(p => {
    const pageEl = document.getElementById('page-' + p);
    if (pageEl) pageEl.classList.toggle('hidden', p !== name);
  });
  document.querySelectorAll('#navLinks button').forEach(b => {
    b.classList.toggle('active', (b as HTMLElement).dataset.page === name);
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'; // Public key for demo
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

/* ---------------- SEARCH LOGIC (LIVE DEBOUNCE) ---------------- */
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const searchBtn = document.getElementById('searchBtn');
let searchTimeout: any = null;

async function performSearch() {
  if (!searchInput) return;
  const query = searchInput.value.trim();
  if (!query) {
    goToPage('home');
    return;
  }
  
  goToPage('search');
  const searchTitle = document.getElementById('searchTitle');
  if (searchTitle) searchTitle.textContent = `Searching for "${query}"...`;
  
  const el = document.getElementById('searchResults');
  if (el) el.innerHTML = '<div style="padding: 40px; color: var(--slate); text-align: center; grid-column: 1 / -1;"><div class="spinner"></div></div>';
  
  try {
    const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
    const data = await res.json();
    
    let results = [];
    if (data && data.results) {
      results = data.results.filter((item: any) => {
        if (item.media_type === 'person' || !item.poster_path) return false;
        const releaseDate = item.release_date || item.first_air_date;
        if (!releaseDate || new Date(releaseDate) > new Date()) return false;
        return true;
      }).map((m: any) => ({
        title: m.title || m.name,
        tag: (m.media_type === 'tv' ? 'TV Show' : 'Movie') + ` · ${m.vote_average ? m.vote_average.toFixed(1) : 'NR'} ★`,
        live: false,
        iframeSrc: `https://autoembed.co/${m.media_type === 'tv' ? 'tv' : 'movie'}/tmdb/${m.id}`,
        imgSrc: `${TMDB_IMG}${m.poster_path}`
      }));
    }
    
    if (results.length === 0) {
      if (el) el.innerHTML = '<div style="padding: 40px; color: var(--slate); text-align: center; grid-column: 1 / -1;">No results found. Try another search.</div>';
      if (searchTitle) searchTitle.textContent = `No results for "${query}"`;
    } else {
      if (searchTitle) searchTitle.textContent = `Results for "${query}"`;
      renderCards('searchResults', results); 
    }
  } catch (e) {
    if (el) el.innerHTML = '<div style="padding: 40px; color: var(--hype); text-align: center; grid-column: 1 / -1;">Error fetching search results.</div>';
  }
}

if (searchBtn) searchBtn.addEventListener('click', performSearch);
if (searchInput) {
  searchInput.addEventListener('input', () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500); // 500ms debounce
  });
}

/* ---------------- STREAK / XP ---------------- */
let streak = 12;
const streakEl = document.getElementById('streakCount');
if (streakEl) streakEl.textContent = streak.toString();

/* ---------------- LIVE WATCHING TICKER ---------------- */
let watching = 12400;
const watchingEl = document.getElementById('watchingCount');
if (watchingEl) {
  setInterval(() => {
    watching += Math.floor(Math.random() * 90) - 20;
    watchingEl.textContent = (watching / 1000).toFixed(1) + 'K';
  }, 2500);
}

/* ---------------- DROP COUNTDOWN ---------------- */
let dropSeconds = 2 * 3600 + 14 * 60 + 33;
const dropEl = document.getElementById('dropTimer');
if (dropEl) {
  setInterval(() => {
    if (dropSeconds > 0) dropSeconds--;
    const h = String(Math.floor(dropSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((dropSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(dropSeconds % 60).padStart(2, '0');
    dropEl.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

/* ---------------- HERO ROTATION ---------------- */
let heroes: any[] = [];
let heroIdx = 0;
const heroBg = document.getElementById('heroBg');
const heroTitle = document.getElementById('heroTitle');
const heroEyebrow = document.getElementById('heroEyebrow');
const heroSynopsis = document.getElementById('heroSynopsis');
const heroMeta = document.getElementById('heroMeta');
const heroDots = document.getElementById('heroDots');

function setupHeroes() {
  if (heroDots && heroBg && heroes.length > 0) {
    heroDots.innerHTML = '';
    heroes.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => setHero(i));
      heroDots.appendChild(dot);
    });
    setHero(0);
  }
}

function setHero(i: number) {
  if (heroes.length === 0) return;
  heroIdx = i;
  const heroData = heroes[i];
  if (heroBg) {
    heroBg.style.opacity = '0';
    setTimeout(() => {
      heroBg.style.backgroundImage = `url('${heroData.img}')`;
      if (heroTitle) heroTitle.textContent = heroData.title;
      if (heroEyebrow) heroEyebrow.textContent = heroData.eyebrow;
      if (heroSynopsis) heroSynopsis.textContent = heroData.synopsis;
      if (heroMeta) {
        heroMeta.innerHTML = heroData.meta.map((m: string) => `<span class="badge">${m}</span>`).join('');
      }
      heroBg.style.opacity = '1';
    }, 250);
  }
  if (heroDots) {
    [...heroDots.children].forEach((d, idx) => d.classList.toggle('active', idx === i));
  }
}
setInterval(() => setHero((heroIdx + 1) % heroes.length), 7000);

/* ---------------- REACTION BAR ---------------- */
const reactions = [
  { emo: '🔥', count: 842 }, { emo: '😭', count: 311 }, { emo: '💀', count: 203 }, { emo: '👀', count: 127 }
];
const reactionBar = document.getElementById('reactionBar');
function renderReactions() {
  if (reactionBar) {
    reactionBar.innerHTML = reactions.map((r, i) => `
      <button class="reaction" data-i="${i}"><span class="emo">${r.emo}</span><span class="rcount">${r.count}</span></button>
    `).join('');
  }
}
renderReactions();
if (reactionBar) {
  reactionBar.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('.reaction') as HTMLElement;
    if (!btn) return;
    const i = +btn.dataset.i!;
    reactions[i].count++;
    btn.querySelector('.rcount')!.textContent = reactions[i].count.toString();
    const p = document.createElement('span');
    p.className = 'particle'; p.textContent = reactions[i].emo;
    btn.appendChild(p);
    setTimeout(() => p.remove(), 800);
  });
}

// Stories logic removed.


/* ---------------- VIDEO PLAYER / CLIP VIEWER OVERLAY ---------------- */
const clipViewer = document.getElementById('clipViewer');
const clipImg = document.getElementById('clipImg') as HTMLImageElement;
const clipVideo = document.getElementById('clipVideo') as HTMLVideoElement;
const clipName = document.getElementById('clipName');
let hlsInstance: any = null;
let plyrPlayer: any = null;

let currentTmdbId = '';
let currentMediaType = '';

// Ensure Plyr is available
declare var Plyr: any;
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

// Generic function to play a stream
function playStream(title: string, streamUrl?: string, iframeSrc?: string, imgSrc?: string, tmdbId?: string, mediaType?: string) {
  if (!clipViewer) return;
  clipViewer.classList.remove('hidden');
  if (clipName) clipName.textContent = title;
  
  const serverSwitcher = document.getElementById('serverSwitcher');
  if (serverSwitcher) {
    if (tmdbId && mediaType) {
      currentTmdbId = tmdbId;
      currentMediaType = mediaType;
      serverSwitcher.style.display = 'flex';
      document.querySelectorAll('.server-btn').forEach((b, i) => {
        if(i === 0) b.classList.add('active');
        else b.classList.remove('active');
      });
    } else {
      serverSwitcher.style.display = 'none';
    }
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
      clipIframe.src = iframeSrc;
      clipIframe.style.display = 'block';
    }
  } else if (streamUrl && clipVideo) {
    if (clipImg) clipImg.style.display = 'none';
    if (clipIframe) {
      clipIframe.src = '';
      clipIframe.style.display = 'none';
    }
    initPlyr(); // Ensure Plyr is created before manipulating DOM!
    const plyrContainer = document.querySelector('.plyr') as HTMLElement;
    if (plyrContainer) plyrContainer.style.display = 'block';

  if (Hls.isSupported()) {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
    hlsInstance = new Hls();
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(clipVideo);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      if (plyrPlayer) {
        plyrPlayer.play().catch((e: any) => console.log('Autoplay prevented:', e));
      } else {
        clipVideo.play().catch(e => console.log('Autoplay prevented:', e));
      }
    });
    
    // Server Error / Broken link fallback
    hlsInstance.on(Hls.Events.ERROR, function (_event: any, data: any) {
      if (data.fatal) {
        // Silently close the clip on fatal error, do not show irritating alert
        console.warn('Stream failed or geo-blocked, closing player quietly.');
        closeClip();
      }
    });
  } else if (clipVideo.canPlayType('application/vnd.apple.mpegurl')) {
    clipVideo.src = streamUrl;
    clipVideo.addEventListener('loadedmetadata', function () {
      clipVideo.play().catch(e => console.log('Autoplay prevented:', e));
    });
  }
}
}

document.getElementById('playBtn')?.addEventListener('click', () => {
  const h = heroes[heroIdx];
  playStream(h.title, undefined, h.iframeSrc, h.img);
});

/* ---------------- BACKEND LOGIC: FETCH FRESH APIs ---------------- */
let currentRegion = 'IN';

const regionSelect = document.getElementById('contentRegion') as HTMLSelectElement;
if (regionSelect) {
  regionSelect.addEventListener('change', (e) => {
    currentRegion = (e.target as HTMLSelectElement).value;
    document.querySelectorAll('.row-scroll').forEach(el => el.innerHTML = '<div style="padding:40px; color: var(--slate); text-align:center;"><div class="spinner" style="margin:0 auto;"></div></div>');
    init();
  });
}

// 1. Fetch Indian Movies from TMDB API
async function fetchMovies(genreId?: string, page = 1) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const regionParam = currentRegion === 'IN' ? '&with_origin_country=IN' : '&with_original_language=en';
    let url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}${regionParam}&sort_by=popularity.desc&page=${page}&language=en-US&primary_release_date.lte=${today}`;
    if (genreId) url += `&with_genres=${genreId}`;
    
    const res = await fetch(url);
    const data = await res.json();
    if (!data || !data.results) return [];
    
    return data.results.filter((m: any) => m.poster_path).map((m: any) => ({
      title: m.title,
      tag: `Movie · ${m.vote_average ? m.vote_average.toFixed(1) : 'NR'} ★`,
      live: false,
      iframeSrc: `https://autoembed.co/movie/tmdb/${m.id}`,
      imgSrc: `${TMDB_IMG}${m.poster_path}`,
      raw: m
    }));
  } catch (err) {
    console.error('Movie fetch failed', err);
    return [];
  }
}

// 2. Fetch Indian TV Shows from TMDB API
async function fetchTVShows(page = 1) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const regionParam = currentRegion === 'IN' ? '&with_origin_country=IN' : '&with_original_language=en';
    const res = await fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}${regionParam}&sort_by=popularity.desc&page=${page}&language=en-US&first_air_date.lte=${today}`);
    const data = await res.json();
    if (!data || !data.results) return [];
    
    return data.results.filter((s: any) => s.poster_path).map((s: any) => ({
      title: s.name,
      tag: `TV Show · ${s.vote_average ? s.vote_average.toFixed(1) : 'NR'} ★`,
      live: false,
      iframeSrc: `https://autoembed.co/tv/tmdb/${s.id}`,
      imgSrc: `${TMDB_IMG}${s.poster_path}`,
      raw: s
    }));
  } catch (err) {
    console.error('TV Show fetch failed', err);
    return [];
  }
}

/* ---------------- CARD RENDERING LOGIC ---------------- */
function renderCards(targetId: string, data: any[], _type?: string) {
  const el = document.querySelector(`[data-scroll="${targetId}"]`) || document.getElementById(targetId);
  if (!el) return;
  
  el.innerHTML = data.map((d, i) => {
    const streamAttr = d.streamUrl ? `data-stream="${d.streamUrl}"` : '';
    const iframeAttr = d.iframeSrc ? `data-iframe="${d.iframeSrc}"` : '';
    const imgUrl = d.imgSrc || `https://picsum.photos/seed/${d.img || (d.title.replace(/\s+/g,'').toLowerCase() + i)}/440/248`;
    const tag = d.tag || '';
    
    const tmdbIdAttr = d.raw?.id ? `data-tmdbid="${d.raw.id}"` : '';
    const mediaTypeAttr = `data-mediatype="${d.raw?.media_type || (tag.includes('TV') ? 'tv' : 'movie')}"`;
    const clickAttrs = `${streamAttr} ${iframeAttr} ${tmdbIdAttr} ${mediaTypeAttr} data-title="${d.title}" data-img="${imgUrl}"`;

    // All cards are now clickable with fallback image handler
    return `<div class="card live-card-playable" ${clickAttrs}>
      <div class="card-edge"></div>
      ${d.live ? `<div class="live-badge"><span class="pulse-dot"></span>LIVE</div>` : ''}
      <img class="card-img" loading="lazy" src="${imgUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${d.title.charAt(0)}&background=131a2e&color=2fe6c4&size=440'" alt="">
      <div class="card-info"><div class="card-title">${d.title}</div><div class="card-tags mono">${tag}</div></div>
    </div>`;
  }).join('');
}

// Add event listener to play live cards when clicked
document.body.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const card = target.closest('.live-card-playable') as HTMLElement;
  if (!card) return;
  const streamUrl = card.dataset.stream;
  const iframeSrc = card.dataset.iframe;
  const title = card.dataset.title;
  const imgSrc = card.dataset.img;
  const tmdbId = card.dataset.tmdbid;
  const mediaType = card.dataset.mediatype;
  if (title && (streamUrl || iframeSrc)) {
    playStream(title, streamUrl, iframeSrc, imgSrc, tmdbId, mediaType);
  }
});

/* ---------------- INITIALIZE DATA ---------------- */
async function init() {
  // Load dynamic Backend data from TMDB APIs
  const [
    trendingMovies, actionMovies, romanceMovies,
    tvShows, newTvShows
  ] = await Promise.all([
    fetchMovies('', 1),         // Trending (All Genres)
    fetchMovies('28', 1),       // Action
    fetchMovies('10749', 1),    // Romance
    fetchTVShows(1),            // Trending TV
    fetchTVShows(2)             // More TV
  ]);

  // Setup Dynamic Heroes
  if (trendingMovies.length > 0) {
    heroes = trendingMovies.slice(0, 5).filter((m: any) => m.raw.backdrop_path).map((m: any) => ({
      title: m.title,
      eyebrow: m.tag,
      img: `https://image.tmdb.org/t/p/original${m.raw.backdrop_path}`,
      synopsis: m.raw.overview || "Experience the magic of cinema.",
      iframeSrc: m.iframeSrc,
      meta: [m.raw.release_date?.split('-')[0] || "2024", m.raw.original_language?.toUpperCase() || "HI", "HD"]
    }));
    setupHeroes();
  }

  // Populate UI Rows
  renderCards('trending-row', trendingMovies.slice(0, 8), 'trending');
  renderCards('continue-row', tvShows.slice(0, 4), 'continue');

  // Movies Page
  renderCards('movies-new', trendingMovies.slice(8, 14), 'movies');
  renderCards('movies-action', actionMovies.slice(0, 8), 'movies');
  renderCards('movies-romcom', romanceMovies.slice(0, 8), 'movies');

  // TV Shows Page
  renderCards('tv-binge', tvShows.slice(4, 10), 'tv');
  renderCards('tv-new', newTvShows.slice(0, 6), 'tv');
  renderCards('tv-fan', newTvShows.slice(6, 12), 'tv');

  // Originals - EmoLearners Instagram Embeds
  const emolearnersOriginals = [
    { title: "EmoLearners - Web Dev", tag: "Original · Reel", live: false, iframeSrc: "https://www.instagram.com/p/CrLd5r9I014/embed", imgSrc: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80" },
    { title: "EmoLearners - JavaScript", tag: "Original · Reel", live: false, iframeSrc: "https://www.instagram.com/p/Cp0cR6rI7lq/embed", imgSrc: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80" },
    { title: "EmoLearners - Tech Hacks", tag: "Original · Reel", live: false, iframeSrc: "https://www.instagram.com/p/Co8R6bZIu3a/embed", imgSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" }
  ];
  
  renderCards('originals-row', emolearnersOriginals, 'originals');
  renderCards('originals-full', emolearnersOriginals, 'originals');
  renderCards('originals-soon', trendingMovies.slice(15, 18), 'originals');
}

init();

/* ---------------- ROW ARROW SCROLL ---------------- */
document.body.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest('.row-nav button') as HTMLElement;
  if (!btn) return;
  const targetRow = btn.dataset.target;
  const dir = parseInt(btn.dataset.dir || '1', 10);
  const row = document.querySelector(`[data-scroll="${targetRow}"]`);
  if (row) row.scrollBy({ left: dir * 480, behavior: 'smooth' });
});

/* ---------------- SERVER SWITCHER ---------------- */
document.querySelectorAll('.server-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const server = btn.getAttribute('data-server');
    const clipIframe = document.getElementById('clipIframe') as HTMLIFrameElement;
    if (!clipIframe) return;
    
    if (server === 'autoembed') {
       clipIframe.src = `https://autoembed.co/${currentMediaType}/tmdb/${currentTmdbId}`;
    } else if (server === 'multiembed') {
       clipIframe.src = `https://multiembed.mov/?video_id=${currentTmdbId}&tmdb=1`;
    } else if (server === 'embedsu') {
       clipIframe.src = `https://embed.su/embed/${currentMediaType}/${currentTmdbId}`;
    }
  });
});

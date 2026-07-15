
// Declare Hls globally to make TypeScript happy since we loaded it via CDN script
declare var Hls: any;

/* ---------------- NAV SCROLL SHADOW ---------------- */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
}

/* ---------------- PAGE ROUTING ---------------- */
const pages = ['home', 'movies', 'tvshows', 'sports', 'originals'];
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
const heroes = [
  { title: "Aaj Tak Live (Proxied)", eyebrow: "Hindi · News", img: "https://upload.wikimedia.org/wikipedia/commons/2/28/Aaj_tak_logo.png", synopsis: "Watch Aaj Tak Live 24x7 for the latest breaking news.", streamUrl: "https://corsproxy.io/?url=https%3A%2F%2Ffeeds.intoday.in%2Faajtak%2Fmaster.m3u8" },
  { title: "Red Bull TV", eyebrow: "Action · Sports", img: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png", synopsis: "Experience the world of Red Bull with live action sports and events.", streamUrl: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8" },
  { title: "Bloomberg TV", eyebrow: "Global · Finance", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Bloomberg_Television_logo.svg/1200px-Bloomberg_Television_logo.svg.png", synopsis: "24-hour global business and financial news.", streamUrl: "https://live.bloomberg.tv/hls/live/608358/a/index.m3u8" }
];
let heroIdx = 0;
const heroBg = document.getElementById('heroBg');
const heroTitle = document.getElementById('heroTitle');
const heroEyebrow = document.getElementById('heroEyebrow');
const heroSynopsis = document.getElementById('heroSynopsis');
const heroDots = document.getElementById('heroDots');

if (heroDots && heroBg) {
  heroes.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => setHero(i));
    heroDots.appendChild(dot);
  });
}
function setHero(i: number) {
  heroIdx = i;
  const heroData = heroes[i];
  if (heroBg) {
    heroBg.style.opacity = '0';
    setTimeout(() => {
      heroBg.style.backgroundImage = `url('${heroData.img}')`;
      if (heroTitle) heroTitle.textContent = heroData.title;
      if (heroEyebrow) heroEyebrow.textContent = heroData.eyebrow;
      if (heroSynopsis) heroSynopsis.textContent = heroData.synopsis;
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
function playStream(title: string, streamUrl?: string, iframeSrc?: string, imgSrc?: string) {
  if (!clipViewer) return;
  clipViewer.classList.remove('hidden');
  if (clipName) clipName.textContent = title;
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
    if (clipVideo) clipVideo.pause();
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
  playStream(h.title, h.streamUrl, undefined, h.img);
});


/* ---------------- BACKEND LOGIC: FETCH FRESH APIs ---------------- */

// 1. Fetch Pluto TV Live Channels (100% Working, No CORS)
async function fetchPlutoTV() {
  try {
    const response = await fetch('https://i.mjh.nz/PlutoTV/us.m3u8');
    const text = await response.text();
    const lines = text.split('\\n');
    let channels = [];
    let currentChannel: any = {};
    for (let line of lines) {
      if (line.startsWith('#EXTINF')) {
        const titleMatch = line.match(/tvg-name="([^"]+)"/);
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        currentChannel = {
          title: titleMatch ? titleMatch[1] : 'Unknown Channel',
          imgSrc: logoMatch ? logoMatch[1] : '',
          tag: 'Live TV',
          live: true
        };
      } else if (line.startsWith('http')) {
        currentChannel.streamUrl = line.trim();
        channels.push(currentChannel);
        currentChannel = {};
      }
    }
    // Filter out empty or bad ones and return
    return channels.filter(c => c.streamUrl).slice(0, 100); 
  } catch (err) {
    console.error('Pluto TV fetch failed', err);
    return [];
  }
}

// 2. Fetch Fresh Movies from YTS API
async function fetchMovies() {
  try {
    const res = await fetch('https://yts.mx/api/v2/list_movies.json?sort_by=download_count&limit=20');
    const data = await res.json();
    if (!data || !data.data || !data.data.movies) return [];
    
    return data.data.movies.map((m: any) => ({
      title: m.title,
      tag: (m.genres?.[0] || 'Action') + ' · Movie',
      live: false,
      iframeSrc: `https://vidsrc.to/embed/movie/${m.imdb_code}`,
      imgSrc: m.medium_cover_image
    }));
  } catch (err) {
    console.error('Movie fetch failed', err);
    return [];
  }
}

// 3. Fetch Top TV Shows from TVMaze API
async function fetchTVShows() {
  try {
    const res = await fetch('https://api.tvmaze.com/shows');
    const shows = await res.json();
    return shows.slice(0, 20).map((s: any) => ({
      title: s.name,
      tag: (s.genres?.[0] || 'Drama') + ' · TV Show',
      live: false,
      iframeSrc: `https://vidsrc.to/embed/tv/${s.externals?.imdb || ''}`,
      imgSrc: s.image?.medium || `https://picsum.photos/seed/${s.id}/440/248`
    }));
  } catch (err) {
    console.error('TV Show fetch failed', err);
    return [];
  }
}

/* ---------------- CARD RENDERING LOGIC ---------------- */
function renderCards(targetId: string, data: any[], _type?: string) {
  const el = document.querySelector(`[data-scroll="${targetId}"]`);
  if (!el) return;
  
  el.innerHTML = data.map((d, i) => {
    const streamAttr = d.streamUrl ? `data-stream="${d.streamUrl}"` : '';
    const iframeAttr = d.iframeSrc ? `data-iframe="${d.iframeSrc}"` : '';
    const imgUrl = d.imgSrc || `https://picsum.photos/seed/${d.img || (d.title.replace(/\s+/g,'').toLowerCase() + i)}/440/248`;
    const clickAttrs = `${streamAttr} ${iframeAttr} data-title="${d.title}" data-img="${imgUrl}"`;
    const tag = d.tag || '';

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
  if (title && (streamUrl || iframeSrc)) {
    playStream(title, streamUrl, iframeSrc, imgSrc);
  }
});

/* ---------------- INITIALIZE DATA ---------------- */
async function init() {
  // Load dynamic Backend data from fresh APIs
  const [plutoChannels, ytsMovies, tvShows] = await Promise.all([
    fetchPlutoTV(),
    fetchMovies(),
    fetchTVShows()
  ]);

  // Helper to slice channels sequentially so they never shuffle on refresh
  const getSequential = (arr: any[], start: number, count: number) => {
    if (!arr || arr.length === 0) return [];
    return arr.slice(start, start + count);
  };

  // Populate UI Rows
  renderCards('live-row', getSequential(plutoChannels, 0, 8), 'live');
  renderCards('trending-row', getSequential(ytsMovies, 0, 8), 'trending');
  renderCards('continue-row', getSequential(tvShows, 0, 4), 'continue');

  // Movies Page
  renderCards('movies-new', getSequential(ytsMovies, 8, 5), 'movies');
  renderCards('movies-action', getSequential(ytsMovies, 13, 4), 'movies');
  renderCards('movies-romcom', getSequential(ytsMovies, 17, 3), 'movies');

  // TV Shows Page
  renderCards('tv-binge', getSequential(tvShows, 4, 4), 'tv');
  renderCards('tv-new', getSequential(tvShows, 8, 4), 'tv');
  renderCards('tv-fan', getSequential(tvShows, 12, 4), 'tv');

  // Sports Page (using remaining Pluto TV live channels)
  renderCards('sports-highlights', getSequential(plutoChannels, 8, 8), 'sports');

  // Originals - EmoLearners Instagram Embeds
  const emolearnersOriginals = [
    { title: "EmoLearners - Web Dev", tag: "Original · Reel", live: false, iframeSrc: "https://www.instagram.com/p/CrLd5r9I014/embed", imgSrc: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80" },
    { title: "EmoLearners - JavaScript", tag: "Original · Reel", live: false, iframeSrc: "https://www.instagram.com/p/Cp0cR6rI7lq/embed", imgSrc: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80" },
    { title: "EmoLearners - Tech Hacks", tag: "Original · Reel", live: false, iframeSrc: "https://www.instagram.com/p/Co8R6bZIu3a/embed", imgSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" }
  ];
  
  renderCards('originals-row', emolearnersOriginals, 'originals');
  renderCards('originals-full', emolearnersOriginals, 'originals');
  renderCards('originals-soon', getSequential(ytsMovies, 0, 3), 'originals');
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

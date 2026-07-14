import './style.css';

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
  { title: "The Last Ember", eyebrow: "EmoSports Original · Fantasy", img: "https://picsum.photos/seed/ember1/1600/900", synopsis: "When the last flame-keeper of a dying kingdom goes missing, a reluctant smuggler must cross a war-torn coastline to find her — before the ember she carries goes out for good.", streamUrl: "https://feeds.intoday.in/aajtak/master.m3u8" },
  { title: "Crimson Tide City", eyebrow: "EmoSports Original · Crime Drama", img: "https://picsum.photos/seed/crimson2/1600/900", synopsis: "A dockside inspector uncovers a smuggling ring that reaches the top of the city's council — and into her own family.", streamUrl: "https://abp-i.akamaihd.net/hls/live/765529/abphindi/master.m3u8" },
  { title: "Whispers of Malabar", eyebrow: "New Season · Drama", img: "https://picsum.photos/seed/malabar3/1600/900", synopsis: "Three generations of a spice-trading family navigate love, land disputes, and a coastline that keeps changing beneath their feet.", streamUrl: "https://m-ddsports.akamaized.net/hls/live/2018881/DDSports/master.m3u8" }
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

function initPlyr(qualityOptions?: any) {
  if (plyrPlayer) {
    plyrPlayer.destroy();
  }
  const defaultOptions: any = {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'fullscreen'],
    settings: ['quality', 'speed'],
    autoplay: true,
  };
  if (qualityOptions) {
    defaultOptions.quality = qualityOptions;
  }
  plyrPlayer = new Plyr(clipVideo, defaultOptions);
}

function closeClip() {
  if (clipViewer) clipViewer.classList.add('hidden');
  if (clipVideo) {
    if (plyrPlayer) plyrPlayer.stop();
    else clipVideo.pause();
    clipVideo.src = '';
    clipVideo.style.display = 'none';
  }
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
    if (clipVideo) {
      clipVideo.pause();
      clipVideo.style.display = 'none';
    }
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
    clipVideo.style.display = 'block';

  if (Hls.isSupported()) {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
    hlsInstance = new Hls();
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(clipVideo);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      // Map available qualities to Plyr
      const availableQualities = hlsInstance.levels.map((l: any) => l.height);
      const qualityOptions = {
        default: availableQualities[0],
        options: availableQualities,
        forced: true,
        onChange: (e: any) => updateQuality(e)
      };
      
      initPlyr(qualityOptions);
      
      if (plyrPlayer) {
        plyrPlayer.play().catch((e: any) => console.log('Autoplay prevented:', e));
      } else {
        clipVideo.play().catch(e => console.log('Autoplay prevented:', e));
      }
    });
    
    // Server Error / Broken link fallback
    hlsInstance.on(Hls.Events.ERROR, function (_: any, data: any) {
      if (data.fatal) {
        alert("Server Error: This channel stream is currently down or geo-blocked. Please try another one.");
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

// Function to handle quality switch from Plyr to Hls.js
function updateQuality(newQuality: number) {
  if (hlsInstance) {
    hlsInstance.levels.forEach((level: any, levelIndex: number) => {
      if (level.height === newQuality) hlsInstance.currentLevel = levelIndex;
    });
  }
}

document.getElementById('playBtn')?.addEventListener('click', () => {
  const h = heroes[heroIdx];
  playStream(h.title, h.streamUrl);
});


/* ---------------- BACKEND LOGIC: FETCHING INDIAN IPTV STREAMS ---------------- */
async function fetchIndianChannels() {
  try {
    const channelsUrl = import.meta.env.VITE_API_CHANNELS_URL || 'https://iptv-org.github.io/api/channels.json';
    const streamsUrl = import.meta.env.VITE_STREAMS_API_URL || 'https://iptv-org.github.io/api/streams.json';

    const [channelsRes, streamsRes] = await Promise.all([
      fetch(channelsUrl),
      fetch(streamsUrl)
    ]);

    const channels = await channelsRes.json();
    const streams = await streamsRes.json();

    const streamMap = new Map();
    streams.forEach((stream: any) => {
      if (stream.status !== 'error' && stream.url) {
        streamMap.set(stream.channel, stream.url);
      }
    });

    const indianChannels = [];
    for (const channel of channels) {
      // Magic Filter: Country Code IN (India)
      if (channel.country === 'IN') {
        const streamUrl = streamMap.get(channel.id);
        if (streamUrl) {
          indianChannels.push({
            title: channel.name,
            tag: channel.categories?.[0] || 'Live TV',
            imgSrc: channel.logo || `https://picsum.photos/seed/${channel.id}/440/248`,
            streamUrl: streamUrl,
            live: true
          });
        }
      }
      if (indianChannels.length >= 100) break; // Limit to 100 for UI presentation
    }
    return indianChannels;
  } catch (error) {
    console.error('Failed to fetch Indian channels:', error);
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
  // Load dynamic Indian Backend data
  let allIndianChannels = await fetchIndianChannels();
  
  const verifiedChannels = [
    { title: "Aaj Tak", tag: "Hindi · News", live: true, streamUrl: "https://feeds.intoday.in/aajtak/master.m3u8", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/2/28/Aaj_tak_logo.png" },
    { title: "ABP News", tag: "Hindi · News", live: true, streamUrl: "https://abp-i.akamaihd.net/hls/live/765529/abphindi/master.m3u8", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/ABP_News_logo.svg/1024px-ABP_News_logo.svg.png" },
    { title: "DD Sports", tag: "Hindi · Sports", live: true, streamUrl: "https://m-ddsports.akamaized.net/hls/live/2018881/DDSports/master.m3u8", imgSrc: "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/DD_Sports.png/250px-DD_Sports.png" }
  ];
  
  if (allIndianChannels.length === 0) {
    allIndianChannels = verifiedChannels;
  } else {
    allIndianChannels = [...verifiedChannels, ...allIndianChannels];
  }

  // Helper to get random channels for rows
  const getRandom = (arr: any[], n: number) => {
    let result = new Array(n), len = arr.length, taken = new Array(len);
    if (n > len) return arr;
    while (n--) {
      let x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  };

  // Populate UI Rows with real playable channels
  renderCards('live-row', getRandom(allIndianChannels, 6), 'live');
  renderCards('trending-row', getRandom(allIndianChannels, 6), 'trending');
  renderCards('continue-row', getRandom(allIndianChannels, 4), 'continue');

  // Movies Page
  const movieChannels = allIndianChannels.filter(c => c.tag.toLowerCase().includes('movie') || c.tag.toLowerCase().includes('entertainment'));
  renderCards('movies-new', movieChannels.length > 0 ? movieChannels : getRandom(allIndianChannels, 5), 'trending');
  renderCards('movies-action', getRandom(allIndianChannels, 4), 'trending');
  renderCards('movies-romcom', getRandom(allIndianChannels, 4), 'trending');

  // TV Shows Page
  renderCards('tv-binge', getRandom(allIndianChannels, 4), 'trending');
  renderCards('tv-new', getRandom(allIndianChannels, 4), 'trending');
  renderCards('tv-fan', getRandom(allIndianChannels, 4), 'trending');

  // Sports Page
  const sportsChannels = allIndianChannels.filter(c => c.tag.toLowerCase().includes('sport'));
  renderCards('sports-highlights', sportsChannels.length > 0 ? sportsChannels : getRandom(allIndianChannels, 4), 'trending');

  // Originals - EmoLearners Instagram Embeds
  const emolearnersOriginals = [
    { title: "EmoLearners - Web Dev", tag: "Original · Reel", iframeSrc: "https://www.instagram.com/p/CrLd5r9I014/embed", imgSrc: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80" },
    { title: "EmoLearners - JavaScript", tag: "Original · Reel", iframeSrc: "https://www.instagram.com/p/Cp0cR6rI7lq/embed", imgSrc: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80" },
    { title: "EmoLearners - Tech Hacks", tag: "Original · Reel", iframeSrc: "https://www.instagram.com/p/Co8R6bZIu3a/embed", imgSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" }
  ];
  
  renderCards('originals-row', emolearnersOriginals, 'originals');
  renderCards('originals-full', emolearnersOriginals, 'originals');
  renderCards('originals-soon', getRandom(allIndianChannels, 3), 'trending');
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

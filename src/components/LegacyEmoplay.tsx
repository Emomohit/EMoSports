import { useEffect, useRef } from 'react';

const LegacyEmoplay = () => {
  const isLoaded = useRef(false);

  useEffect(() => {
    // Only load the script once the component mounts
    if (!isLoaded.current) {
      isLoaded.current = true;
      import('../../src/main.ts').catch(err => console.error("Failed to load legacy script", err));
    }
  }, []);

  return (
    <>
      <div id="vignette"></div>
      <div id="topProgress"></div>

      {/* LOADER */}
      <div id="loader">
        <div className="brand-mark">emoplay<span className="plus">+</span></div>
        <div className="loader-bar"><i></i></div>
      </div>

      {/* ===================== BROWSE SCREEN ===================== */}
      <section id="browseScreen">
        <nav className="nav" id="mainNav">
          <div className="nav-left">
            <div className="logo" id="navLogo">emoplay<span className="plus">+</span></div>
            <div className="nav-links" id="navLinks">
              <a href="#" className="active" data-cat="home">Home</a>
              <a href="#" data-cat="series">Shows</a>
              <a href="#" data-cat="movies">Movies</a>
              <a href="#" data-cat="new">New &amp; Popular</a>
              <a href="#" data-cat="mylist">My List</a>
            </div>
          </div>
          <div className="nav-right">
            <div className="search-box" id="searchBox">
              <button className="icon-btn" id="searchToggle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <input type="text" id="searchInput" placeholder="Search movies or TV shows..." />
            </div>
            <button className="icon-btn" title="Notifications">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="notif-dot"></span>
            </button>
            <div className="profile-trigger" id="profileTrigger">
              <div className="avatar" id="avatarBtn" style={{ background: '#2c2c2e' }}>E</div>
              <span className="caret">&#9660;</span>
              <div className="profile-menu" id="profileMenu">
                <div className="profile-row" data-profile="E" data-color="#2c2c2e"><div className="avatar" style={{ background: '#2c2c2e' }}>E</div> Emo</div>
                <div className="profile-row" data-profile="R" data-color="#243440"><div className="avatar" style={{ background: '#243440' }}>R</div> Riya</div>
                <div className="profile-row" data-profile="K" data-color="#33262f"><div className="avatar" style={{ background: '#33262f' }}>K</div> Kids</div>
                <hr />
                <div className="profile-row">Manage Profiles</div>
                <div className="profile-row">Account</div>
                <div className="profile-row">Help Centre</div>
              </div>
            </div>
          </div>
        </nav>

        <div className="hero" id="heroSection"></div>

        <div className="rows" id="rowsContainer"></div>

        <footer className="footer">
          <p>Questions? Call 000-800-919-0000</p>
          <div className="footer-links">
            <a href="#">FAQ</a><a href="#">Help Centre</a><a href="#">Account</a><a href="#">Media Centre</a>
            <a href="#">Investor Relations</a><a href="#">Jobs</a><a href="#">Ways to Watch</a><a href="#">Terms of Use</a>
            <a href="#">Privacy</a><a href="#">Cookie Preferences</a><a href="#">Corporate Information</a><a href="#">Contact Us</a>
          </div>
          <p>emoplay — A premium streaming UI integrated with TMDB.</p>
        </footer>
      </section>

      {/* ===================== MODAL ===================== */}
      <div id="modalOverlay">
        <div className="modal" id="modalContent"></div>
      </div>

      <div id="toast"></div>

      {/* Clip viewer overlay (existing video player) */}
      <div className="clip-viewer hidden" id="clipViewer">
        <div className="clip-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="clip-segments" id="clipSegments"></div>
          <div className="clip-head"><img className="mini" id="clipMini" src="" onError={(e) => (e.currentTarget.style.display = 'none')} /><span id="clipName"></span></div>
          
          <button className="player-settings-btn" id="playerSettingsBtn" title="Audio & Settings">⚙️</button>
          <div className="player-settings-menu hidden" id="playerSettingsMenu">
            <h4>AUDIO & LANGUAGE</h4>
            <div className="lang-switcher" id="langSwitcher">
              <button className="lang-btn active" data-lang="hi">🎙️ Hindi Dubbed</button>
              <button className="lang-btn" data-lang="en">🎙️ English</button>
              <button className="lang-btn" data-lang="orig">🎙️ Original</button>
            </div>
            <p id="langHint" style={{ fontSize: '11px', color: 'var(--accent)', margin: '6px 0 12px', display: 'none' }}>*Click ⚙️ CC inside player to confirm Hindi audio track.</p>
            <h4>SERVER OPTIONS (IF VIDEO FAILS)</h4>
            <div className="server-switcher">
              <button className="server-btn active" data-server="2embed">Server 1 (2embed - Recommended)</button>
              <button className="server-btn" data-server="autoembed">Server 2 (AutoEmbed)</button>
              <button className="server-btn" data-server="vidsrccc">Server 3 (VidSrc.cc)</button>
              <button className="server-btn" data-server="vidlink">Server 4 (VidLink - Dual Audio)</button>
            </div>
          </div>
          <button className="clip-close" id="clipClose">✕</button>
          <div id="videoContainer" style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <video id="clipVideo" playsInline controls style={{ width: '100%', height: '100%', display: 'none' }}></video>
            <iframe id="clipIframe" style={{ width: '100%', height: '100%', border: 'none', display: 'none' }} allowFullScreen></iframe>
            <img id="clipImg" src="" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'none' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LegacyEmoplay;

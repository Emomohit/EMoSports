const VideoPlayer = () => {
  return (
    <div className="clip-viewer hidden" id="clipViewer">
      <div className="clip-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="clip-segments" id="clipSegments"></div>
        <div className="clip-head">
          <img className="mini" id="clipMini" src="" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span id="clipName"></span>
        </div>
        
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
  );
};

export default VideoPlayer;

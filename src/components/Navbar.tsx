

const Navbar = () => {
  return (
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
  );
};

export default Navbar;

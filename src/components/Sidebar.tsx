import { Home, Tv, Trophy, Film, Search, User, Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const navItems = [
    { icon: <User size={24} />, label: 'My Space', path: '/myspace' },
    { icon: <Search size={24} />, label: 'Search', path: '/search' },
    { icon: <Home size={24} />, label: 'Home', path: '/' },
    { icon: <Tv size={24} />, label: 'Live TV', path: '/livetv' },
    { icon: <Trophy size={24} />, label: 'Sports', path: '/sports' },
    { icon: <Film size={24} />, label: 'Movies', path: '/movies' },
    { icon: <Compass size={24} />, label: 'Explore', path: '/explore' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">EMo</span><span className="logo-highlight">Sports</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="premium-btn">Subscribe</button>
      </div>
    </aside>
  );
}

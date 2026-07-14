import { Home, Tv, Trophy, Film, Search, User, Compass } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const navItems = [
    { icon: <User size={24} />, label: 'My Space', path: '#' },
    { icon: <Search size={24} />, label: 'Search', path: '#' },
    { icon: <Home size={24} />, label: 'Home', path: '#', active: true },
    { icon: <Tv size={24} />, label: 'Live TV', path: '#' },
    { icon: <Trophy size={24} />, label: 'Sports', path: '#' },
    { icon: <Film size={24} />, label: 'Movies', path: '#' },
    { icon: <Compass size={24} />, label: 'Explore', path: '#' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">EMo</span><span className="logo-highlight">Sports</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={item.path}
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="premium-btn">Subscribe</button>
      </div>
    </aside>
  );
}

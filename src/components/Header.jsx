import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="site-header">
      <div className="site-title">
        <Link to="/">Edward Zhu 123</Link>
      </div>
      <nav className="main-nav">
        <ul>
          <li><Link to="/">Gallery</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header; 
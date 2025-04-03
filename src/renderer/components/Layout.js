import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

function Layout({ children, settings }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <nav>
          <Link to="/" className="nav-item">
            <span className="icon">🏠</span>
            <span className="text">首页</span>
          </Link>
          <Link to="/settings" className="nav-item">
            <span className="icon">⚙️</span>
            <span className="text">设置</span>
          </Link>
        </nav>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout; 
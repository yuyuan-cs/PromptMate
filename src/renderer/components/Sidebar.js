import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">PromptMate</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/') ? 'active' : ''}>
            <Link to="/">
              <span className="icon">📝</span>
              <span className="text">提示语</span>
            </Link>
          </li>
          <li className={isActive('/favorites') ? 'active' : ''}>
            <Link to="/favorites">
              <span className="icon">⭐</span>
              <span className="text">收藏夹</span>
            </Link>
          </li>
          <li className={isActive('/categories') ? 'active' : ''}>
            <Link to="/categories">
              <span className="icon">📂</span>
              <span className="text">分类</span>
            </Link>
          </li>
          <li className={isActive('/settings') ? 'active' : ''}>
            <Link to="/settings">
              <span className="icon">⚙️</span>
              <span className="text">设置</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <span className="version">v1.0.0</span>
      </div>
    </aside>
  );
}

export default Sidebar; 
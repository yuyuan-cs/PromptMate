import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import './Layout.css';

function Layout({ children, settings }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout; 
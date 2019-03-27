import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default () => (
  <nav>
    <div className="side-bar">
      <h1>Pretty proptypes</h1>
      <div className="header-controls">
        <label>
          Type system:
          <select>
            <option value="flow">Flow</option>
            <option value="typescript">TypeScript</option>
          </select>
        </label>
        <Link to="/">Home</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/repl">Try it out</Link>
      </div>
    </div>
  </nav>
);

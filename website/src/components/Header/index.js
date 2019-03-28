import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default ({ location }) => {
  const ifPathNameEqualTo = pathName => {
    console.log(location);
    return location && location.pathname === pathName;
  };
  return (
    <nav>
      <h1>Extract React Types</h1>
      <div className="header-controls">
        {/* <label>
          Type system:
          <select>
            <option value="flow">Flow</option>
            <option value="typescript">TypeScript</option>
          </select>
        </label> */}
        {/* <Link to="/" className={ifPathNameEqualTo('/') ? 'active' : ''}>
          Home
        </Link> */}
        <Link to="/" className={ifPathNameEqualTo('/') ? 'active' : ''}>
          Packages
        </Link>
        <Link to="/repl" className={ifPathNameEqualTo('/repl') ? 'active' : ''}>
          Try it out
        </Link>
      </div>
    </nav>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default () => (
  <nav>
    <Link to="/">Home</Link>
    <Link to="/packages">Packages</Link>
    <Link to="/repl">Try it out</Link>
  </nav>
);

import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { HashRouter as Router, Route, Link } from 'react-router-dom';

import docs from '../DOCS';
import Header from './components/Header';
import Home from './pages/home';
import PackageDoc from './pages/PackageDoc';
import Repl from './pages/Repl';

const App = () => (
  <Router>
    <Header />
    <Route path="/" exact component={Home} />
    <Route path="/packages" component={PackageDoc} />
    <Route path="/repl" component={Repl} />
  </Router>
);

/**Sample code to print markdown from html */
/*
{Object.keys(docs).map(doc => (
  <ReactMarkdown source={docs[doc]} />
))}
*/

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

ReactDOM.render(<App />, document.getElementById('root'));

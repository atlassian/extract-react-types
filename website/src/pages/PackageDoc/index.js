import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import docs from '../../../DOCS';
import './style.css';

export default function PackageDoc({ location }) {
  let params = new URLSearchParams(location.search);
  let docName = params.get('package');
  return (
    <main>
      <sidebar>
        <ul>
          {Object.keys(docs).map(docTitle => (
            <li className={docName && docName === docTitle ? 'active' : ''}>
              <Link to={{ pathname: '/packages', search: `package=${docTitle}` }}>{docTitle}</Link>
            </li>
          ))}
        </ul>
      </sidebar>
      <article>
        <ReactMarkdown source={docs[docName || Object.keys(docs)[0]]} />
      </article>
    </main>
  );
}

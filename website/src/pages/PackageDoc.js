import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import docs from '../../DOCS';

export default function PackageDoc({ location }) {
  let params = new URLSearchParams(location.search);
  let docName = params.get('package');
  return (
    <div>
      <ul>
        {Object.keys(docs).map(docTitle => (
          <li>
            <Link to={{ pathname: '/packages', search: `package=${docTitle}` }}>{docTitle}</Link>
          </li>
        ))}
      </ul>
      <div>
        <div>
          <ReactMarkdown source={docs[docName || Object.keys(docs)[0]]} />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown/with-html';
import { AkCodeBlock } from '@atlaskit/code';
// import * as Documentation from '../../../docs';
import docs from '../../../DOCS';
import './style.css';

const kebabToCamelCase = string => string.replace(/-([a-z])/g, s => ` ${s[1]}`);
const kebabToTitleCase = string =>
  string
    .replace(/.md$/, '')
    .replace(/^[0-9]*/, '')
    .replace(/-([a-z])/g, s => ` ${s[1]}`);

const CodeBlock = ({ value }) => <AkCodeBlock text={value} />;

export default function PackageDoc({ location }) {
  let params = new URLSearchParams(location.search);
  let docName = params.get('package');
  const { packageDocs, staticDocs } = docs;
  return (
    <div className="package-documentation">
      <main>
        <section>
          <h2>Documentation</h2>
          <ul>
            {Object.keys(staticDocs).map(docTitle => (
              <li key={docTitle} className={docName && docName === docTitle ? 'active' : ''}>
                <Link to={{ pathname: '/', search: `package=${docTitle}` }}>
                  {kebabToTitleCase(docTitle)}
                </Link>
              </li>
            ))}
          </ul>
          <h2>Packages</h2>
          <ul>
            {Object.keys(packageDocs).map(docTitle => (
              <li key={docTitle} className={docName && docName === docTitle ? 'active' : ''}>
                <Link to={{ pathname: '/', search: `package=${docTitle}` }}>
                  {kebabToCamelCase(docTitle)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <article>
          <ReactMarkdown
            source={
              staticDocs[docName] || packageDocs[docName] || staticDocs[Object.keys(staticDocs)[0]]
            }
            renderers={{ code: CodeBlock }}
          />
        </article>
      </main>
    </div>
  );
}

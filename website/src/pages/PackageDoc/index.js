import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown/with-html';
import { AkCodeBlock } from '@atlaskit/code';
import docs from '../../../DOCS';
import './style.css';

const kebabToCamelCase = string => string.replace(/-([a-z])/g, s => ` ${s[1]}`);

const CodeBlock = ({ value }) => <AkCodeBlock text={value} />;

export default function PackageDoc({ location }) {
  let params = new URLSearchParams(location.search);
  let docName = params.get('package');
  return (
    <div className="package-documentation">
      <main>
        <section>
          <ul>
            {Object.keys(docs).map(docTitle => (
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
            source={docs[docName || Object.keys(docs)[0]]}
            renderers={{ code: CodeBlock }}
          />
        </article>
      </main>
    </div>
  );
}

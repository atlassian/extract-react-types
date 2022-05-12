/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { PropsTable } from 'pretty-proptypes';
import TypeScriptComponent from '../TypeScriptComponent';

const Template = args => args.component;

export const Example = Template.bind({});

const linksStyles = css`
  background: black;
  color: white;
  display: flex;
  gap: 0 10px;
  left: 0;
  margin: 0;
  padding: 15px;
  position: fixed;
  right: 0;
  bottom: 0;
  > a {
    color: white;
  }
`;

Example.args = {
  component: (
    <div>
      <h3>
        <span role="img" aria-label="Hint!">
          💡
        </span>{' '}
        See navigation bar at the bottom
      </h3>
      <p css={linksStyles}>
        <strong>Permalinks: </strong>
        <a href="#TypeScriptComponent-booleanProp" target="_self">
          booleanProp
        </a>
        &bull;
        <a href="#TypeScriptComponent-functionProp" target="_self">
          functionProp
        </a>
        &bull;
        <a href="#TypeScriptComponent-unknownProp" target="_self">
          unknownProp
        </a>
        &bull;
        <a href="#TypeScriptComponent-stringProp" target="_self">
          stringProp
        </a>
      </p>
      <div>
        <PropsTable component={TypeScriptComponent} heading="Primitive types" />
      </div>
    </div>
  )
};

export default {
  title: 'Example/Permalinks',
  component: Example
};

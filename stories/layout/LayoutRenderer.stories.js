/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import md from 'react-markings';
import { LayoutRenderer } from 'pretty-proptypes';

import TypeScriptComponent from '../TypeScriptComponent';
import {
  Heading,
  HeadingDefault,
  HeadingRequired,
  HeadingType
} from '../../packages/pretty-proptypes/src/Prop/Heading';
import { colors } from '../../packages/pretty-proptypes/src/components/constants';

export default {
  title: 'Example/Layouts/LayoutRenderer',
  component: LayoutRenderer
};

const Template = args => args.component;

export const Base = Template.bind({});

const rowStyles = css`
  width: 100%;
  border-collapse: collapse;
  margin-top: 40px;

  th {
    text-align: left;
    padding: 4px 16px 4px 8px;
    white-space: nowrap;
    vertical-align: top;
  }

  td {
    padding: 4px 0 4px 8px;
    width: 100%;
  }

  tbody {
    border-bottom: none;
  }

  &:target {
    background: #fffae6;
  }
`;

const headingStyles = css`
  font-size: 1em;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.N30};
  margin-bottom: 4px;
`;

const captionStyles = css`
  text-align: left;
  margin: 0;
  font-size: 1em;
`;

const headingCodeStyles = css`
  background-color: ${colors.N20};
  color: ${colors.N800};
  border-radius: 3px;
  padding: 4px 8px;
  line-height: 20px;
  display: inline-block;
`;

const headingRequiredStyles = css`
  margin-left: 1em;
  color: ${colors.R400};
`;

Base.args = {
  component: (
    <div>
      <h2>Primitive types</h2>
      <LayoutRenderer
        component={TypeScriptComponent}
        renderType={({
          typeValue,
          defaultValue,
          description,
          required,
          name,
          type,
          components,
          componentDisplayName
        }) => (
          <table
            css={rowStyles}
            {...(componentDisplayName ? { id: `${componentDisplayName}-${name}` } : null)}
          >
            <caption css={captionStyles}>
              <Heading css={headingStyles}>
                <code css={headingCodeStyles}>{name}</code>
                {required && defaultValue === undefined && (
                  <HeadingRequired css={headingRequiredStyles}>required</HeadingRequired>
                )}
              </Heading>
            </caption>
            <tbody>
              <tr>
                <th scope="row">Description</th>
                <td>
                  <components.Description>{md([description])}</components.Description>
                </td>
              </tr>
              {defaultValue !== undefined && (
                <tr>
                  <th scope="row">Default</th>
                  <td>
                    <HeadingDefault>{defaultValue}</HeadingDefault>
                  </td>
                </tr>
              )}
              <tr>
                <th scope="row">Type</th>
                <td
                  css={css`
                    display: flex;
                    flex-direction: column;
                  `}
                >
                  <span>
                    <HeadingType>{type}</HeadingType>
                  </span>
                  <span>
                    <components.PropType typeValue={typeValue} components={components} />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      />
    </div>
  )
};

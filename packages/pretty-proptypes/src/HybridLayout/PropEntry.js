// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, Component, type ComponentType, type Node } from 'react';
import md from 'react-markings';
import PrettyPropType from '../PrettyConvert';
import { HeadingType, HeadingDefault } from '../Prop/Heading';
import type { CommonProps } from '../types';

type PropProps = CommonProps & {
  shapeComponent: ComponentType<CommonProps>
};

export default class Prop extends Component<PropProps> {
  static defaultProps = {
    shapeComponent: (props: CommonProps) => <PrettyPropType {...props} />
  };

  render() {
    let { shapeComponent: ShapeComponent, ...commonProps } = this.props;

    let { defaultValue, description, name, required, type, components } = commonProps;

    return (
      <Fragment>
        <table>
          <caption
            css={css`
              text-align: left;
              font-weight: 500;
              font-size: 1.4285714285714286em;
              margin-top: 28px;
              margin-bottom: 8px;
            `}
          >
            <code>{name}</code>
          </caption>
          <tbody>
            <tr>
              <RowLabel>Description</RowLabel>
              <td>
                {description && (
                  <components.Description>{md([description])}</components.Description>
                )}
              </td>
            </tr>
            <tr>
              <RowLabel>Default</RowLabel>
              <td>
                {defaultValue !== undefined && <HeadingDefault>{defaultValue}</HeadingDefault>}
              </td>
            </tr>
            <tr>
              <RowLabel>Type</RowLabel>
              <td
                css={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <span>
                  <HeadingType>{type}</HeadingType>
                </span>
                <span>
                  <ShapeComponent {...commonProps} />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Fragment>
    );
  }
}

const RowLabel = ({ children }) => (
  <th
    css={css`
      text-align: left;
      padding: 4px 8px 4px 0;
    `}
  >
    {children}
  </th>
);

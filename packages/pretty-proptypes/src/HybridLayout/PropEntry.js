// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, Component, type ComponentType, type Node } from 'react';
import md from 'react-markings';
import PrettyPropType from '../PrettyConvert';
import { HeadingType, HeadingDefault, Heading } from '../Prop/Heading';
import type { CommonProps } from '../types';
import { colors } from '../components/constants';

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
        <table
          css={css`
            width: 100%;
            border-collapse: collapse;

            th {
              text-align: left;
              padding: 4px 8px 4px 0;
              white-space: nowrap;
              vertical-align: top;
            }

            td {
              padding: 4px 0 4px 8px;
              width: 100%;
            }
          `}
        >
          <caption
            css={css`
              text-align: left;
              font-weight: 500;
              font-size: 1.4285714285714286em;
              margin-top: 28px;
              margin-bottom: 0;
            `}
          >
            <Heading
              css={css`
                font-size: inherit;
                margin-bottom: 0;
              `}
            >
              <code>{name}</code>
            </Heading>
          </caption>
          <tbody
            css={css`
              border-bottom: 2px solid ${colors.N20};
            `}
          >
            <tr>
              <th>Description</th>
              <td>
                {description && (
                  <components.Description>{md([description])}</components.Description>
                )}
              </td>
            </tr>
            <tr>
              <th>Default</th>
              <td>
                {defaultValue !== undefined && <HeadingDefault>{defaultValue}</HeadingDefault>}
              </td>
            </tr>
            <tr>
              <th>Type</th>
              <td
                css={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <span>
                  <HeadingType>{type}</HeadingType>
                  {/* <HeadingRequired
                    css={css`
                      margin-left: 1em;
                      font-size: 0.9rem;
                    `}
                  >
                    required
                  </HeadingRequired> */}
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
// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, Component, type ComponentType } from 'react';
import md from 'react-markings';
import PrettyPropType from '../PrettyConvert';
import { HeadingType, HeadingDefault, Heading, HeadingRequired } from '../Prop/Heading';
import type { CommonProps } from '../types';
import { colors } from '../components/constants';

type PropProps = CommonProps & {
  shapeComponent: ComponentType<CommonProps>
};

export default class PropEntry extends Component<PropProps> {
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
          `}
        >
          <caption
            css={css`
              text-align: left;
              margin: 0;
              font-size: 1em;
            `}
          >
            <Heading
              css={css`
                font-size: 1em;
                padding-bottom: 8px;
                border-bottom: 1px solid ${colors.N30};
                margin-bottom: 4px;
              `}
            >
              <code
                css={css`
                  background-color: ${colors.N20};
                  color: ${colors.N800};
                  border-radius: 3px;
                  padding: 4px 8px;
                  line-height: 20px;
                  display: inline-block;
                `}
              >
                {name}
              </code>
              {required && defaultValue === undefined && (
                <HeadingRequired
                  css={css`
                    margin-left: 1em;
                    color: ${colors.R400};
                  `}
                >
                  required
                </HeadingRequired>
              )}
            </Heading>
          </caption>
          <tbody
            css={css`
              border-bottom: none;
            `}
          >
            <tr>
              <th scope="row">Description</th>
              <td>
                {description && (
                  <components.Description>{md([description])}</components.Description>
                )}
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

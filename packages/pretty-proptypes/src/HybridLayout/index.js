// @flow

/* eslint-disable no-underscore-dangle */

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Component, type Node } from 'react';

import md from 'react-markings';
import PropsWrapper from '../Props/Wrapper';
import LayoutRenderer, { type LayoutRendererProps } from '../LayoutRenderer';
import { HeadingType, HeadingDefault, Heading, HeadingRequired } from '../Prop/Heading';
import { colors } from '../components/constants';

type DynamicPropsProps = LayoutRendererProps & {
  heading?: string,
  shouldCollapseProps?: boolean
};

const Description = ({ children }: { children: Node }) => (
  <div
    css={css`
      p:first-of-type {
        margin-top: 0px;
      }
      p:last-of-type {
        margin-bottom: 0px;
      }
    `}
  >
    {children}
  </div>
);

export default class HybridLayout extends Component<DynamicPropsProps> {
  render() {
    const { props, heading, component, shouldCollapseProps } = this.props;

    return (
      <PropsWrapper heading={heading}>
        <LayoutRenderer
          component={component}
          props={props}
          renderType={({
            typeValue,
            defaultValue,
            description,
            required,
            name,
            type,
            components: Comp
          }) => (
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

                tbody {
                  border-bottom: none;
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
              <tbody>
                <tr>
                  <th scope="row">Description</th>
                  <td>{description && <Description>{md([description])}</Description>}</td>
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
                      <Comp.PropType
                        typeValue={typeValue}
                        components={Comp}
                        shouldCollapse={shouldCollapseProps}
                      />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        />
      </PropsWrapper>
    );
  }
}

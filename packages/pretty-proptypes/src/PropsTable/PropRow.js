// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, Component, type ComponentType, type Node } from 'react';
import md from 'react-markings';
import PrettyPropType from '../PrettyConvert';
import { HeadingName, HeadingType, HeadingDefault } from '../Prop/Heading';
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
        <tbody>
          <tr valign="top" css={{
            '& > td': { 
              padding: '14px 0px',
            }
          }}>
            <td>
              <HeadingName>
                {name}
              </HeadingName>
            </td>
            <td css={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              <span>
                <HeadingType>
                  {type}
                </HeadingType>
              </span>
              <span>
                <ShapeComponent {...commonProps}/>
              </span>
            </td>
            <td>
              {defaultValue !== undefined && (
                <HeadingDefault>
                  {defaultValue}
                </HeadingDefault>
                )}
            </td>
            <td>
              {description && 
                (<components.Description>
                  {md([description])}
                </components.Description>)
              }
            </td>
          </tr>
        </tbody>
      </Fragment>
    );
  }
}



// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, Component, type ComponentType } from 'react';
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

    /**
     * TODO: extract + use `required` to display whether the prop is required.
     * Other layouts already do.
     * https://github.com/atlassian/extract-react-types/issues/192
     */
    let { defaultValue, description, name, type, components, componentDisplayName } = commonProps;

    return (
      <Fragment>
        <tbody>
          <tr
            {...(componentDisplayName ? { id: `${componentDisplayName}-${name}` } : null)}
            valign="top"
            css={{
              '& > td': {
                padding: '14px 0px'
              },
              '&:target': {
                background: '#FFFAE6'
              }
            }}
          >
            <td>
              <HeadingName>{name}</HeadingName>
            </td>
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
            <td>{defaultValue !== undefined && <HeadingDefault>{defaultValue}</HeadingDefault>}</td>
            <td>
              {description && <components.Description>{md([description])}</components.Description>}
            </td>
          </tr>
        </tbody>
      </Fragment>
    );
  }
}

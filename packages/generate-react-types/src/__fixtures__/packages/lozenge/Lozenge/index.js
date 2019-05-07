// @flow
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */

import { type ThemeProp } from '@atlaskit/theme';
import React, { PureComponent, type Node } from 'react';
import { type ThemeAppearance, type ThemeProps, type ThemeTokens } from '../theme';

type Props = {
  /** The appearance type. */
  appearance: ThemeAppearance,
  /** Elements to be rendered inside the lozenge. This should ideally be just a word or two. */
  children?: Node,
  /** Determines whether to apply the bold style or not. */
  isBold: boolean,
  /** max-width of lozenge container. Default to 200px. */
  maxWidth: number | string,
  /** The theme the component should use. */
  theme?: ThemeProp<ThemeTokens, ThemeProps>
};

export default class Lozenge extends PureComponent<Props> {
  static defaultProps = {
    isBold: false,
    appearance: 'default',
    maxWidth: 200
  };

  render() {
    return 'noop';
  }
}

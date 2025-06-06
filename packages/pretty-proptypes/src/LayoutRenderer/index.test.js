// @flow

import { render, screen } from '@testing-library/react';
import React from 'react';
import { extractReactTypes } from 'extract-react-types';
import LayoutRenderer from './index';

const assembleComponent = (propTypes, defaultProps, type = 'typescript') => {
  let file = `
  class Component extends React.Component<${propTypes}> {
    defaultProps = ${defaultProps}
  }`;
  return extractReactTypes(file, type);
};

test('requiredPropsFirst should place required props in front of other props', () => {
  const propTypes = assembleComponent(
    `{
      /**
       * Required, but with a default value. Should be rendered second
       */
      a: number,
      /**
       * Optional, should be rendered third
       */
      b?: string,
      /**
       * Required, no default. Should be rendered first
       */
      c: boolean,
    }`,
    `{a: 1}`
  );

  const order = [];

  render(
    <LayoutRenderer
      props={propTypes}
      requiredPropsFirst
      renderType={props => {
        order.push(props.name);
        return <div data-testid={props.name} />;
      }}
    />
  );

  expect(order[0]).toEqual('c');
});

test('sortProps should run sort function before applying requiredPropsFirst', () => {
  const propTypes = assembleComponent(
    `{
      c?: number,
      b?: string,
      a?: boolean,
      e: string,
      d: string,
    }`,
    `{a: 1}`
  );

  const order = [];

  render(
    <LayoutRenderer
      props={propTypes}
      sortProps={(propA, propB) => propA.key.name.localeCompare(propB.key.name)}
      requiredPropsFirst
      renderType={props => {
        order.push(props.name);
        return <div data-testid={props.name} />;
      }}
    />
  );

  expect(order[0]).toEqual('d');
});

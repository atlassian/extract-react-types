// @flow

/* eslint-disable react/no-unused-prop-types */

import React from 'react';

type FlowComponentProps = {
  // This prop is required as it is not optional and has no default

  requiredProp: any,
  // This prop is a string
  // @ts-ignore
  stringProp: string,
  // This prop is a number
  numberProp: number,
  // This prop is a boolean
  booleanProp: boolean,
  // This prop is a array<string>
  arrayStringProp: Array<string>,
  // This prop is a array<number>
  arrayNumberProp: Array<number>,
  // This prop is a array<boolean>
  arrayBooleanProp: Array<boolean>,
  // This prop is a function
  functionProp: (name: string, age: number) => void,
  // This prop is an any
  anyProp: any,
  // This prop is a mixed
  mixedProp: mixed,
  // This prop is a union
  unionProp: 'hello' | 'world',
  // @internal
  hideProp: Boolean
};

const FlowComponent = (props: FlowComponentProps) => <p>Hello World</p>;

FlowComponent.defaultProps = {
  stringProp: 'hello',
  numberProp: 0,
  booleanProp: true,
  arrayStringProp: ['foo', 'bar', 'baz'],
  arrayNumberProp: [0, 1, 2, 3],
  arrayBooleanProp: [true, false, true, false],
  functionProp: (name: string, age: number) => {
    // eslint-disable-next-line no-console
    console.log(name, age);
  },
  anyProp: 'any',
  mixedProp: 'mixed',
  unionProp: 'hello'
};

export default FlowComponent;

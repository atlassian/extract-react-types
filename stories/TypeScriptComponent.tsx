/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-prop-types */

import React from 'react';

interface DummyInterface {
  id: number;
  text: string;
  due: Date;
}

type TypeScriptComponentProps = {
  // This prop is required as it is not optional and has no default
  // eslint-disable-next-line
  requiredProp: any;
  // This prop is a string
  // @ts-ignore
  stringProp: string;
  // This prop is a number
  numberProp: number;
  // This prop is a boolean
  booleanProp: boolean;
  // This prop is a array<string>
  arrayStringProp: Array<string>;
  // This prop is a array<number>
  arrayNumberProp: Array<number>;
  // This prop is a array<boolean>
  arrayBooleanProp: Array<boolean>;
  // This prop is a function
  functionProp: (name: string, age: number) => void;
  // This prop is an any
  anyProp: any;
  // This prop is a union
  unionProp: 'hello' | 'world';
  // This prop uses typescripts the unknown type
  unknownProp: unknown;
  // This prop uses an unknown typescript keyword "keyof" and so will result in a bail-out
  unsupportedProp: keyof DummyInterface;
  // This prop uses hyphens, so the type uses quotations around the key
  'quoted-prop': any;
  // @internal
  hideProp: Boolean;
  nocomment: boolean;
  /**
   * @deprecated
   * This prop is deprecated
   */
  deprecatedProp: boolean;
};

const TypeScriptComponent = (props: TypeScriptComponentProps) => <p>Hello World</p>;

TypeScriptComponent.defaultProps = {
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
  unionProp: 'hello',
  unknownProp: 'hello',
  unsupportedProp: 'text',
  deprecatedProp: true
};

export default TypeScriptComponent;

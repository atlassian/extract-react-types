// @flow

import React from 'react';
import { render } from '@testing-library/react';
import { extractReactTypes } from 'extract-react-types';
import components from '../components';
import prettyConvert from './converters';

const simpleStringKind = { kind: 'string', value: 'here it is' };
let getSimplePropKind = (obj = {}) => ({
  kind: 'property',
  key: { kind: 'id', name: 'prop1' },
  value: simpleStringKind,
  ...obj
});

const assembleERTAST = (propTypes, defaultProps, type = 'flow') => {
  let file = `
  class Component extends React.Component<${propTypes}> {
    defaultProps = ${defaultProps}
  }`;
  let res = extractReactTypes(file, type);
  return res.component.members;
};

const getSingleDefault = defaultPropVal => {
  return assembleERTAST(`{ a: any }`, `{ a: ${defaultPropVal} }`)[0].default;
};

const getSingleProp = defaultPropType => {
  const propTypes = assembleERTAST(`{ a: ${defaultPropType} }`, `{}`)[0];
  return propTypes.value;
};

test('return an empty string when no type is given', () => {
  // $FlowFixMe - deliberately passing in undefined here
  let res = prettyConvert(undefined, components);
  expect(res).toBe('');
});

test('fallback to kind2string type when no converter is found', () => {
  // $FlowFixMe - we are deliberately testing a null case here
  const { container: wrapper } = render(prettyConvert({ kind: 'sunshine' }, components));
  const { container: other } = render(<components.Type />);

  expect(wrapper.innerHTML).toBe(other.innerHTML);
});

test('prettyConvert string value type', () => {
  let kind = simpleStringKind;
  const { container: wrapper } = render(prettyConvert(kind, components));
  const { container: other } = render(
    <components.StringType>"{kind.value}"</components.StringType>
  );

  expect(wrapper.innerHTML).toBe(other.innerHTML);
});

test('prettyConvert string type type', () => {
  const { container: wrapper } = render(prettyConvert({ kind: 'string' }, components));
  const { container: other } = render(<components.Type>string</components.Type>);

  expect(wrapper.innerHTML).toBe(other.innerHTML);
});

test('prettyConvert nullable value', () => {
  let kind = {
    kind: 'nullable',
    arguments: { kind: 'string' }
  };
  const { container: wrapper } = render(prettyConvert(kind, components));
  const { container: other } = render(<components.Type>string</components.Type>);
  expect(wrapper.innerHTML).toBe(other.innerHTML);
});

test('prettyConvert simple property', () => {
  let simplePropKind = getSimplePropKind();
  const { container: wrapper } = render(prettyConvert(simplePropKind, components));

  expect(wrapper.textContent).toContain(simplePropKind.key.name);
  expect(wrapper.textContent).toContain(simplePropKind.value.kind);
});

test('optional property', () => {
  const { container: wrapper } = render(
    prettyConvert(getSimplePropKind({ optional: true }), components)
  );
  expect(wrapper.querySelector('[data-testid="required"]')).toBeFalsy();
});

test('simple object', () => {
  let values = getSingleDefault(`{ a: 'something', b: 'elsewhere' }`);
  const { container: wrapper } = render(prettyConvert(values, components));

  expect(wrapper.textContent).toContain('a');
  expect(wrapper.textContent).toContain('b');
});

test('object with nested object', () => {
  let values = getSingleDefault(`{ a: 'something', b: { c: 'elsewhere' }}`);
  const { container: wrapper } = render(prettyConvert(values, components));
  expect(wrapper.textContent).toContain('c');
});

test('resolve generic of array', () => {
  let values = getSingleProp(`Array<string>`);
  const { container } = render(prettyConvert(values, components));
  expect(container.textContent).toContain('Array');
  expect(container.textContent).toContain('string');
});

test('objects with null members do not throw', () => {
  const type = {
    kind: 'object',
    members: [
      {
        kind: 'property',
        optional: false,
        key: {
          kind: 'id',
          name: 'children'
        },
        value: {
          kind: 'generic',
          value: {
            kind: 'id',
            name: 'React.ReactNode'
          }
        }
      },
      null
    ],
    referenceIdName: 'LabelTextProps'
  };
  expect(() => prettyConvert(type, components)).not.toThrow();
});

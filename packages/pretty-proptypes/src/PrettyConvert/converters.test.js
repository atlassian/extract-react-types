// @flow

import { shallow, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { extractReactTypes } from 'extract-react-types';
import components from '../components';
import prettyConvert, { TypeMinWidth } from './converters';

configure({ adapter: new Adapter() });

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
  let wrapper = shallow(prettyConvert({ kind: 'sunshine' }, components));

  // $FlowFixMe - deliberately no children
  let other = shallow(<components.Type />);

  expect(wrapper.html()).toBe(other.html());
});

test('prettyConvert string value type', () => {
  let kind = simpleStringKind;
  let wrapper = shallow(prettyConvert(kind, components));
  /* eslint-disable-next-line react/no-unescaped-entities */
  let other = shallow(<components.StringType>"{kind.value}"</components.StringType>);

  expect(wrapper.html()).toBe(other.html());
});

test('prettyConvert string type type', () => {
  let wrapper = shallow(prettyConvert({ kind: 'string' }, components));
  let other = shallow(<components.Type>string</components.Type>);

  expect(wrapper.html()).toBe(other.html());
});

test('prettyConvert nullable value', () => {
  let kind = {
    kind: 'nullable',
    arguments: { kind: 'string' }
  };
  let wrapper = shallow(prettyConvert(kind, components));
  let other = shallow(<components.Type>string</components.Type>);
  expect(wrapper.html()).toBe(other.html());
});

test('prettyConvert simple property', () => {
  let simplePropKind = getSimplePropKind();
  let wrapper = shallow(prettyConvert(simplePropKind, components));

  expect(wrapper.find(components.Required).length).toBe(1);
  expect(
    wrapper.containsMatchingElement(<components.Type>{simplePropKind.key.name}</components.Type>)
  ).toBeTruthy();
  expect(wrapper.text().includes(simplePropKind.value.kind)).toBeTruthy();
});

test('optional property', () => {
  let wrapper = shallow(prettyConvert(getSimplePropKind({ optional: true }), components));
  expect(wrapper.find(components.Required).length).toBeFalsy();
});

test('simple object', () => {
  let values = getSingleDefault(`{ a: 'something', b: 'elsewhere' }`);
  let wrapper = shallow(prettyConvert(values, components));

  let indent = wrapper.find(components.Indent);
  expect(indent.length).toBe(1);
  expect(indent.find(TypeMinWidth).length).toBe(2);
});

test('object with nested object', () => {
  let values = getSingleDefault(`{ a: 'something', b: { c: 'elsewhere' }}`);
  let wrapper = shallow(prettyConvert(values, components));
  let indent = wrapper.find(components.Indent);
  expect(indent.length).toBe(2);
});

test('resolve generic of array', () => {
  let values = getSingleProp(`Array<string>`);
  let wrapper = shallow(prettyConvert(values, components));
  expect(
    wrapper
      .find(components.TypeMeta)
      .at(0)
      .html()
      .includes('Array')
  ).toBeTruthy();
  expect(wrapper.html().includes('string')).toBeTruthy();
});

test.skip('object with spread object', () => {
  let values = getSingleDefault(`{ ...something, c: 'something' }`);
  let wrapper = shallow(prettyConvert(values, components));
  expect(wrapper).toBe('something');
});
test.skip('resolve generic of array with complex type', () => {
  let values = getSingleProp(`Array<{ b: string, c: number }>`);
  let wrapper = shallow(prettyConvert(values, components));
  let members = wrapper.find(components.Indent).at(0);
  expect(members).toBe('something');
});

// test.todo('intersection');
// test.todo('union');

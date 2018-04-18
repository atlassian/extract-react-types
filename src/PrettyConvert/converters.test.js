// @flow
import test from 'ava';
import { shallow, mount, configure } from 'enzyme';
import React from 'react';
import prettyConvert, { TypeMinWidth } from './converters';
import components from '../components';
import Adapter from 'enzyme-adapter-react-16';
import extractReactTypes from 'extract-react-types';
import convert from 'kind2string';

configure({ adapter: new Adapter() });

const simpleStringKind = { kind: 'string', value: 'here it is' };
let getSimplePropKind = (obj = {}) => ({
  kind: 'property',
  key: { kind: 'id', name: 'prop1' },
  value: simpleStringKind,
  ...obj,
});

const assembleERTAST = (propTypes, defaultProps, type = 'flow') => {
  let file = `
  class Component extends React.Component<${propTypes}> {
    defaultProps = ${defaultProps}
  }`;
  let res = extractReactTypes(file, type);
  return res.classes[0].members;
};

const getSingleDefault = defaultPropVal => {
  return assembleERTAST(`{ a: any }`, `{ a: ${defaultPropVal} }`)[0].default;
};

const getSingleProp = defaultPropType => {
  const propTypes = assembleERTAST(`{ a: ${defaultPropType} }`, `{}`)[0];
  return propTypes.value;
};

test('return an empty string when no type is given', t => {
  // $FlowFixMe - deliberately passing in undefined here
  let res = prettyConvert(undefined, components);
  t.is(res, '');
});

test('fallback to kind2string type when no converter is found', t => {
  // $FlowFixMe - we are deliberately testing a null case here
  let wrapper = shallow(prettyConvert({ kind: 'sunshine' }, components));

  // $FlowFixMe - deliberately no children
  let other = shallow(<components.Type />);

  t.is(wrapper.html(), other.html());
});

test('prettyConvert string value type', t => {
  let kind = simpleStringKind;
  let wrapper = shallow(prettyConvert(kind, components));
  let other = shallow(
    <components.StringType>"{kind.value}"</components.StringType>,
  );

  t.is(wrapper.html(), other.html());
});

test('prettyConvert string type type', t => {
  let wrapper = shallow(prettyConvert({ kind: 'string' }, components));
  let other = shallow(<components.Type>string</components.Type>);

  t.is(wrapper.html(), other.html());
});

test('prettyConvert nullable value', t => {
  let kind = {
    kind: 'nullable',
    arguments: { kind: 'string' },
  };
  let wrapper = shallow(prettyConvert(kind, components));
  let other = shallow(<components.Type>string</components.Type>);
  t.is(wrapper.html(), other.html());
});

test('prettyConvert simple property', t => {
  let simplePropKind = getSimplePropKind();
  let wrapper = shallow(prettyConvert(simplePropKind, components));

  t.is(wrapper.find(components.Required).length, 1);
  t.true(
    wrapper.containsMatchingElement(
      <components.Type>{simplePropKind.key.name}</components.Type>,
    ),
  );
  t.true(wrapper.text().includes(simplePropKind.value.kind));
});

test('optional property', t => {
  let wrapper = shallow(
    prettyConvert(getSimplePropKind({ optional: true }), components),
  );
  t.falsy(wrapper.find(components.Required).length);
});

test('optional property', t => {
  let wrapper = shallow(
    prettyConvert(getSimplePropKind({ optional: true }), components),
  );
  t.falsy(wrapper.find(components.Required).length);
});

test('simple object', t => {
  let values = getSingleDefault(`{ a: 'something', b: 'elsewhere' }`);
  let wrapper = shallow(prettyConvert(values, components));

  let outlines = wrapper.find(components.Outline);
  t.is(outlines.length, 2);
  t.true(outlines.at(0).containsMatchingElement('{'));
  t.true(outlines.at(1).containsMatchingElement('}'));
  let indent = wrapper.find(components.Indent);
  t.is(indent.length, 1);
  t.is(indent.find(TypeMinWidth).length, 2);
});

test('object with nested object', t => {
  let values = getSingleDefault(`{ a: 'something', b: { c: 'elsewhere' }}`);
  let wrapper = shallow(prettyConvert(values, components));
  let indent = wrapper.find(components.Indent);
  t.is(indent.length, 2);

  let firstIndent = indent.at(0);
  let outlines = firstIndent.find(components.Outline);
  t.is(outlines.length, 2);
  t.true(outlines.at(0).containsMatchingElement('{'));
  t.true(outlines.at(1).containsMatchingElement('}'));
});

test('resolve generic of array', t => {
  let values = getSingleProp(`Array<string>`);
  let wrapper = shallow(prettyConvert(values, components));
  t.true(
    wrapper
      .find(components.TypeMeta)
      .at(0)
      .html()
      .includes('Array'),
  );
  t.true(
    wrapper
      .find(components.Indent)
      .html()
      .includes('string'),
  );
});

test.skip('object with spread object', t => {
  let values = getSingleDefault(`{ ...something, c: 'something' }`);
  let wrapper = shallow(prettyConvert(values, components));
});
test.skip('resolve generic of array with complex type', t => {
  let values = getSingleProp(`Array<{ b: string, c: number }>`);
  let wrapper = shallow(prettyConvert(values, components));
  let members = wrapper.find(components.Indent).at(0);
});

test.todo('intersection');
test.todo('union');

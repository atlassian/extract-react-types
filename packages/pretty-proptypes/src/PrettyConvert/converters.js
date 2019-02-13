// @flow

// TODO: Remove this eslint-disable
/* eslint-disable */
import React, { type Node } from 'react';
import convert, { resolveFromGeneric } from 'kind2string';
import type { Components } from '../components';
import AddBrackets from './AddBrackets';
import { colors } from '../components/constants';
/*::
import * as K from 'extract-react-types'
*/

export const SIMPLE_TYPES = [
  'array',
  'boolean',
  'number',
  'string',
  'symbol',
  'node',
  'element',
  'custom',
  'any',
  'void',
  'mixed'
];

function printComplexType(type, components, depth) {
  if (typeof type === 'object' && !SIMPLE_TYPES.includes(type.kind)) {
    return prettyConvert(type, components, depth);
  }
  return null;
}

export const TypeMinWidth = (props: { children: Node }) => (
  <span
    css={`
      display: inline-block;
      min-width: 60px;
    `}
    {...props}
  />
);

const Arrow = () => (
  <span
    css={`
      color: ${colors.G500};
    `}
  >
    {' => '}
  </span>
);

export const converters: { [string]: ?Function } = {
  intersection: (type: K.Intersection, components: Components) =>
    type.types.reduce(
      (acc, intersectionType, index) =>
        index < type.types.length - 1
          ? [
              ...acc,
              <span key={index}>{prettyConvert(intersectionType, components)}</span>,
              <div key={`divider-${index}`}>&</div>
            ]
          : [...acc, <span key={index}>{prettyConvert(intersectionType, components)}</span>],
      []
    ),
  string: (type: K.String, components: Components) => {
    if (type.value != null) {
      return <components.StringType>{convert(type)}</components.StringType>;
    }
    return <components.Type>{convert(type)}</components.Type>;
  },
  // nullable types are currently stripping infromation, as we show 'required'
  // when it is required. This may be incorrect, and should be reconsidered.
  nullable: (type: K.Nullable, components: Components, depth: number) => {
    return prettyConvert(type.arguments, components, depth);
  },
  generic: (type: K.Generic, components: Components, depth: number) => {
    if (type.value && type.typeParams) {
      // As Flow does not know what the keyword Array<T> means, we're doing a
      // check here for generic types with a nominal value of 'Array'
      // If a type meets this criteria, we print out its contents as per below.
      return (
        <span>
          <components.TypeMeta>{convert(type.value)}</components.TypeMeta>
          <AddBrackets openBracket="<" closeBracket=">">
            {type.typeParams &&
              type.typeParams.params.map((param, index, array) => (
                <span key={index}>
                  {prettyConvert(param, components, depth)}
                  {type.typeParams && index === array.length - 1 ? '' : ', '}
                </span>
              ))}
          </AddBrackets>
        </span>
      );
    }
    return prettyConvert(resolveFromGeneric(type), components);
  },
  object: (type: K.Obj, components: Components, depth: number) => {
    if (type.members.length === 0) {
      return <components.Type>Object</components.Type>;
    }
    let simpleObj = type.members.filter(mem => !SIMPLE_TYPES.includes(mem.kind)).length === 0;

    if (simpleObj) {
      return <components.Type>{convert(type)}</components.Type>;
    }

    return (
      <span>
        <AddBrackets BracketStyler={components.TypeMeta} openBracket="{" closeBracket="}">
          <components.Indent>
            {type.members.map(prop => {
              if (prop.kind === 'spread') {
                const nestedObj = resolveFromGeneric(prop.value);
                // Spreads almost always resolve to an object, but they can
                // also resolve to an import. We just allow it to fall through
                // to prettyConvert if there are no members
                if (nestedObj.members) {
                  return nestedObj.members.map(newProp =>
                    prettyConvert(newProp, components, depth)
                  );
                }
              }
              return prettyConvert(prop, components, depth);
            })}
          </components.Indent>
        </AddBrackets>
      </span>
    );
  },
  arrayType: (type: K.ArrayType, components: Components, depth: number) => {
    return (
      <span>
        <components.TypeMeta>Array</components.TypeMeta>
        <AddBrackets BracketStyler={components.TypeMeta} openBracket="<" closeBracket=">">
          <components.Indent>{prettyConvert(type.type, components, depth)}</components.Indent>
        </AddBrackets>
      </span>
    );
  },
  property: (type: K.Property, components: Components, depth: number) => (
    <div key={convert(type.key)}>
      {type.key && (
        <TypeMinWidth>
          <components.Type>{convert(type.key)}</components.Type>
        </TypeMinWidth>
      )}
      {type.value.kind !== 'generic' ? ` ${type.value.kind}` : ' '}
      {type.optional ? null : <components.Required> required</components.Required>}{' '}
      {printComplexType(type.value, components, depth)}
    </div>
  ),
  union: (type: K.Union, components: Components, depth: number) => (
    <span>
      <components.TypeMeta>One of </components.TypeMeta>
      <AddBrackets BracketStyler={components.TypeMeta} openBracket="<" closeBracket=">">
        <components.Indent>
          {type.types.map((t, index, array) => (
            <div key={index}>
              {prettyConvert(t, components, depth + 1)}
              {array.length - 1 === index ? '' : ', '}
            </div>
          ))}
        </components.Indent>
      </AddBrackets>
    </span>
  ),
  function: (type: K.Func, components: Components, depth: number) => {
    let simpleReturn = type.returnType && SIMPLE_TYPES.includes(type.returnType.kind);

    let simpleParameters =
      type.parameters.filter(param => SIMPLE_TYPES.includes(param.value.kind)).length ===
      type.parameters.length;

    if (simpleParameters && simpleReturn) {
      return (
        <span>
          {`(${type.parameters.map(convert).join(', ')})`}
          <Arrow />
          {`${convert(type.returnType)}`}
        </span>
      );
    } else if (simpleParameters || type.parameters.length < 2) {
      return (
        <span>
          <AddBrackets BracketStyler={components.FunctionType}>
            {type.parameters.map((param, index, array) => [
              prettyConvert(param, components, depth),
              array.length - 1 === index ? '' : ', '
            ])}
          </AddBrackets>
          <Arrow />
          {type.returnType ? prettyConvert(type.returnType, components, depth) : 'undefined'}
        </span>
      );
    } else {
      return (
        <span>
          <components.TypeMeta>function </components.TypeMeta>
          <AddBrackets BracketStyler={components.FunctionType}>
            <components.Indent>
              {type.parameters.map((param, index, array) => (
                <div key={convert(param.value)}>
                  {prettyConvert(param, components, depth + 1)}
                  {array.length - 1 === index ? '' : ', '}
                </div>
              ))}
            </components.Indent>
          </AddBrackets>
          <Arrow />
          {type.returnType ? prettyConvert(type.returnType, components, depth) : 'undefined'}
        </span>
      );
    }
  },
  param: (type: K.Param, components, depth) => {
    return <span key={convert(type.value)}>{prettyConvert(type.value, components, depth)}</span>;
  },
  typeof: (type: K.Typeof, components, depth) => prettyConvert(type.type, components, depth)
};

const prettyConvert = (type: K.AnyKind, components: Components, depth: number = 1) => {
  if (!type) {
    return '';
  }

  const converter = converters[type.kind];
  if (!converter) {
    const stringType = convert(type);
    return <components.Type key={stringType}>{stringType}</components.Type>;
  }
  return converter(type, components, depth);
};

export default prettyConvert;

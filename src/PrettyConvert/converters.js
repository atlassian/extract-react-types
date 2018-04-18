// @flow
import React, { type Node } from 'react';
import convert, { resolveFromGeneric } from 'kind2string';
import type { Components } from '../components';
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
  'mixed',
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

export const converters: { [string]: ?Function } = {
  intersection: (type: K.Intersection, components: Components) =>
    type.types.reduce(
      (acc, intersectionType, index) =>
        index < type.types.length - 1
          ? [
              ...acc,
              <span key={index}>
                {prettyConvert(intersectionType, components)}
              </span>,
              <div key={`divider-${index}`}>&</div>,
            ]
          : [
              ...acc,
              <span key={index}>
                {prettyConvert(intersectionType, components)}
              </span>,
            ],
      [],
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
      // As Flow does not know what the keyword Array<T> means, we're doing a check here for generic types with a nominal value of 'Array'
      // If a type meets this criteria, we print out its contents as per below.
      return (
        <span>
          <components.TypeMeta>
            {convert(type.value)} <components.Outline>{'<'}</components.Outline>
          </components.TypeMeta>
          <components.Indent>
            {type.typeParams &&
              type.typeParams.params.map((param, i) => (
                <span key={i}>{prettyConvert(param, components, depth)}</span>
              ))}
          </components.Indent>
          <components.TypeMeta>
            <components.Outline>{'>'}</components.Outline>
          </components.TypeMeta>
        </span>
      );
    }
    return prettyConvert(resolveFromGeneric(type), components);
  },
  object: (type: K.Obj, components: Components, depth: number) => (
    <span>
      <components.TypeMeta>
        Shape <components.Outline>{'{'}</components.Outline>
      </components.TypeMeta>
      <components.Indent>
        {type.members.map(prop => {
          if (prop.kind === 'spread') {
            const nestedObj = resolveFromGeneric(prop.value);
            return nestedObj.members.map(newProp =>
              prettyConvert(newProp, components, depth),
            );
          }
          return prettyConvert(prop, components, depth);
        })}
      </components.Indent>
      <components.TypeMeta>
        <components.Outline>{'}'}</components.Outline>
      </components.TypeMeta>
    </span>
  ),
  property: (type: K.Property, components: Components, depth: number) => (
    <div key={convert(type.key)}>
      <TypeMinWidth>
        <components.Type>{convert(type.key)}</components.Type>
      </TypeMinWidth>{' '}
      {type.value.kind !== 'generic' ? type.value.kind : ''}
      {type.optional ? null : (
        <components.Required> required</components.Required>
      )}{' '}
      {printComplexType(type.value, components, depth)}
    </div>
  ),
  union: (type: K.Union, components: Components, depth: number) => (
    <span>
      <components.TypeMeta>
        One of <components.Outline>{'('}</components.Outline>
      </components.TypeMeta>
      <components.Indent>
        {type.types.map((t, i) => (
          <span
            css={`
              display: block;
            `}
            key={i}
          >
            {prettyConvert(t, components, depth + 1)}
          </span>
        ))}
      </components.Indent>
      <components.TypeMeta>
        <components.Outline>{')'}</components.Outline>
      </components.TypeMeta>
    </span>
  ),
};

const prettyConvert = (
  type: K.AnyKind,
  components: Components,
  depth: number = 1,
) => {
  if (!type) {
    return '';
  }

  const converter = converters[type.kind];
  if (!converter) {
    return <components.Type>{convert(type)}</components.Type>;
  }
  return converter(type, components, depth);
};

export default prettyConvert;

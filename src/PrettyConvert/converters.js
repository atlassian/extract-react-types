// @flow
import React, { type Node } from "react";
import convert, { resolveFromGeneric } from "kind2string";

export const SIMPLE_TYPES = [
  "array",
  "boolean",
  "number",
  "string",
  "symbol",
  "node",
  "element",
  "custom",
  "any",
  "void",
  "mixed"
];

function printComplexType(type, components, depth) {
  if (typeof type === "object" && !SIMPLE_TYPES.includes(type.kind)) {
    return prettyConvert(type, components, depth);
  }
  return null;
}

const TypeMinWidth = (props: { children: Node }) => (
  <span
    css={`
      display: inline-block;
      min-width: 60px;
    `}
    {...props}
  />
);

const converters = {
  intersection: (type, components) =>
    type.types.reduce(
      (acc, intersectionType, index) =>
        index < type.types.length - 1
          ? [
              ...acc,
              <span key={index}>
                {prettyConvert(intersectionType, components)}
              </span>,
              <div key={`divider-${index}`}>&</div>
            ]
          : [
              ...acc,
              <span key={index}>
                {prettyConvert(intersectionType, components)}
              </span>
            ],
      []
    ),
  string: (type, components) => {
    if (type.value != null) {
      return <components.StringType>{convert(type)}</components.StringType>;
    }
    return <components.Type>{convert(type)}</components.Type>;
  },
  nullable: (type, components, depth) => {
    return prettyConvert(type.arguments, components, depth);
  },
  generic: (type, components, depth) => {
    if (type.value && type.typeParams) {
      // As Flow does not know what the keyword Array<T> means, we're doing a check here for generic types with a nominal value of 'Array'
      // If a type meets this criteria, we print out its contents as per below.
      return (
        <span>
          <components.TypeMeta>
            {convert(type.value)} <components.Outline>{"<"}</components.Outline>
          </components.TypeMeta>
          <components.Indent>
            {type.typeParams.params.map((param, i) => (
              <span key={i}>{prettyConvert(param, components, depth)}</span>
            ))}
          </components.Indent>
          <components.TypeMeta>
            <components.Outline>{">"}</components.Outline>
          </components.TypeMeta>
        </span>
      );
    }
    return prettyConvert(resolveFromGeneric(type), components);
  },
  object: (type, components, depth) => (
    <span>
      <components.TypeMeta>
        Shape <components.Outline>{"{"}</components.Outline>
      </components.TypeMeta>
      <components.Indent>
        {type.members.map(prop => {
          if (prop.kind === "spread") {
            const nestedObj = resolveFromGeneric(prop.value);
            return nestedObj.members.map(newProp =>
              prettyConvert(newProp, components, depth)
            );
          }
          return prettyConvert(prop, components, depth);
        })}
      </components.Indent>
      <components.TypeMeta>
        <components.Outline>{"}"}</components.Outline>
      </components.TypeMeta>
    </span>
  ),
  property: (type, components, depth) => (
    <div key={convert(type.key)}>
      <TypeMinWidth>
        <components.Type>{convert(type.key)}</components.Type>
      </TypeMinWidth>{" "}
      {type.value.kind !== "generic" ? type.value.kind : ""}
      {type.optional ? null : (
        <components.Required> required</components.Required>
      )}{" "}
      {printComplexType(type.value, components, depth)}
    </div>
  ),
  union: (type, components, depth) => (
    <span>
      <components.TypeMeta>
        One of <components.Outline>{"("}</components.Outline>
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
        <components.Outline>{")"}</components.Outline>
      </components.TypeMeta>
    </span>
  )
};

const prettyConvert = (type, components: Object, depth = 1) => {
  if (!type) {
    return "";
  }

  if (!components) console.log(type);

  const converter = converters[type.kind];
  if (!converter) {
    return <components.Type>{convert(type)}</components.Type>;
  }
  return converter(type, components, depth);
};

export default prettyConvert;

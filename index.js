// @flow

/*::
import type {
  String,
  Param,
  TemplateElement,
  TypeParam,
  Id,
  TemplateLiteral,
  TemplateExpression,
  AssignmentPattern,
  ObjectPattern,
  Obj,
  ClassKind,
  Spread,
  Unary,
  JSXAttribute,
  JSXExpressionContainer,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXOpeningElement,
  Property,
  Call,
  New,
  Typeof,
  Exists,
  Number,
  Null,
  Boolean,
  ArrayExpression,
  BinaryExpression,
  MemberExpression,
  Func,
  Union,
  Generic,
  Initial,
  Variable,
  Intersection,
  Void,
  Mixed,
  Any,
  Nullable,
  Literal,
  Tuple,
  Import,
  Program,
  AnyTypeKind,
  AnyValueKind,
  AnyKind,
} from 'ert-types';

const converters = {};

/*
  If the value here is undefined, we can safely assume that we're dealing with
  a BooleanTypeAnnotation and not a BooleanLiteralTypeAnnotation.
*/
converters.boolean = (type: Boolean): string => type.value ? type.value.toString() : 'boolean';
/*
  If the value here is undefined, we can safely assume that we're dealing with
  a NumberTypeAnnotation and not a NumberLiteralTypeAnnotation.
*/
converters.number = (type: Number): string => type.value ? type.value.toString() : 'number';
/*
  If the value here is undefined, we can safely assume that we're dealing with
  a StringTypeAnnotation and not a StringLiteralTypeAnnotation.
*/
converters.string = (type: any): string => `"${type.value.toString()}"`;
converters.custom = (type: any): string => type.value.toString();
converters.any = (type: AnyValueKind): string => type.value.toString();
converters.void = (): string => 'undefined';
converters.mixed = (type: Mixed): string => type.value.toString();
converters.null = (): string => 'null';
converters.unary = (type: Unary): string =>
  `${type.operator}${convert(type.argument)}`;

converters.id = (type: Id): string => {
  if (type.resolvedVal) {
    return convert(type.resolvedVal);
  }
  return type.name;
};

converters.JSXMemberExpression = (type: any): string => {
  return `${convert(type.object)}.${convert(type.property)}`;
};
converters.JSXExpressionContainer = (type: any): string => {
  return `{ ${convert(type.expression)} }`;
};

converters.JSXElement = (type: any): string => {
  return `<${convert(type.value.name)} ${type.value.attributes.map(attribute =>
    convert(attribute),
  )} />`;
};

converters.JSXIdentifier = (type: any): string => {
  return `${type.value}`;
};

converters.JSXAttribute = (type: any): string => {
  return `${convert(type.name)}= ${convert(type.value)}`;
};

converters.binary = (type: BinaryExpression): string => {
  const left = convert(type.left);
  const right = convert(type.right);
  return `${left} ${type.operator} ${right}`;
};

converters.function = (type: Func): string => {
  return `(${type.parameters.map(p => convert(p.value)).join(', ')}) => ${
    type.returnType
  }`;
};

converters.array = (type: ArrayExpression): string => {
  return `[${mapConvertAndJoin(type.elements)}]`;
};

converters.object = (type: Obj): string => {
  return `{ ${type.members
    .map(m => `${convert(m.key)}: ${m.value.defaultValue || convert(m.value)}`)
    .join(', ')} }`;
};

converters.memberExpression = (type: MemberExpression): string => {
  const property = type.property.name;
  const object = convert(type.object);
  if (object.members) {
    const mem = type.object.members.find(m => m.key.name === property);
    if (mem) {
      return convert(mem.value);
    }
  };
  return property;
};

converters.call = (type: Call): string => {
  return `${convert(type.callee)}(${mapConvertAndJoin(type.args)})`;
};

const mapConvertAndJoin = (array, joiner = ',') => {
  if (!Array.isArray(array)) return '';
  return array.map(convert).join(joiner);
};

converters.new = (type: New): string => {
  const callee = convert(type.callee);
  const args = mapConvertAndJoin(type.args);
  return `new ${callee}(${args})`;
};

converters.external = (type: any): string => {
  if (type.importKind === 'value') {
    return `${type.moduleSpecifier}.${type.name}`;
  }
  // eslint-disable-next-line no-console
  console.warn('could not convert external', type);
  return '';
};

converters.variable = (type: Variable): string => {
  const val = type.declarations[type.declarations.length - 1];
  if (val.value) {
    return convert(val.value);
  }
  return convert(val.id);
};

converters.templateExpression = ({ tag }) => {
  return `${convert(tag)}`;
};

export default function convert(type: { kind: string }) {
  const converter = converters[type.kind];
  if (!converter) {
    // eslint-disable-next-line no-console
    console.warn('could not find converter for', type.kind);
  } else {
    return converter(type);
  }
  return '';
}

export converters;

// @flow
export type String = { kind: "string", value?: string };
export type Param = { kind: "param", value: Array<AnyKind>, type: AnyKind | null };
export type TypeParam = { kind: "typeParam", type: AnyTypeKind };
export type Id = { kind: "id", name: string, type?: $Diff<AnyKind, Id> | null };
export type TemplateLiteral = {
  kind: "templateLiteral",
  expressions: Array<AnyValueKind>,
  quasis: Array<TemplateElement>
};

export type TemplateExpression = { kind: "templateExpression", tag: Id };
export type AssignmentPattern = {
  kind: "AssignmentPattern",
  left: AnyKind,
  right: AnyKind
};
/* *** */ export type ObjectPattern = {
  kind: "ObjectPattern",
  members: Array<Property>
};
/* *** */ export type Obj = { kind: "object", members: Array<Property> };
export type ClassKind = { kind: "class", name: Id } | Generic;
/* *** */ export type Spread = {
  kind: "spread",
  value: Array<Property | Generic>
};
/* *** */ export type Unary = {
  kind: "unary",
  operator: string,
  argument: AnyValueKind
};
export type JSXAttribute = { kind: "JSXAttribute", name: string, value: any };
export type JSXExpressionContainer = {
  kind: "JSXExpressionContainer",
  value: any
};
export type JSXElement = { kind: "JSXElement", value: any };
export type JSXIdentifier = { kind: "JSXIdentifier", value: any };
/* *** */ export type JSXMemberExpression = {
  kind: "JSXMemberExpression",
  object: any,
  property: any
};
export type JSXOpeningElement = {
  kind: "JSXOpeningElement",
  name: any,
  attributes: any
};
export type Property = {
  kind: "property",
  key: Id | String,
  value: AnyKind,
  optional?: boolean
};
/* *** */ export type Call = {
  kind: "call",
  callee: Id,
  args: Array<AnyValueKind>
};
/* *** */ export type New = {
  kind: "new",
  callee: Id,
  args: Array<AnyValueKind>
};
export type Typeof = { kind: "typeof", name: string };
export type Exists = { kind: "exists" };
export type Number = {
  kind: "number",
  value?: number
};
export type Null = { kind: "null" };
export type TemplateElement = { kind: "templateElement", value: { raw: string, cooked: string } };
export type Boolean = { kind: "boolean", value?: boolean };
/* *** */ export type ArrayExpression = { kind: "array", elements: AnyKind };
/* rename for confusion */
export type BinaryExpression = {
  kind: "binary",
  operator: string,
  left: AnyValueKind,
  right: AnyValueKind
};
/* &&& */ export type MemberExpression = {
  kind: "memberExpression",
  object: Id | MemberExpression | Obj,
  property: Id
};
export type Func = {
  kind: "function",
  id?: Id | null,
  async?: boolean,
  generator?: boolean,
  parameters: Param,
  returnType: AnyTypeKind | null
};
/* *** */ export type Union = { kind: "union", types: Array<AnyTypeKind> };
/* ~~~ */ export type Generic = { kind: "generic", value: AnyTypeKind };
export type Initial = { kind: "initial", id: Id, value: AnyValueKind };
export type Variable = { kind: "variable", declarations: Array<Initial> };
/* *** */ export type Intersection = {
  kind: "intersection",
  types: Array<AnyTypeKind>
};
export type Void = { kind: "void" };
export type Mixed = { kind: "mixed" };
export type Any = { kind: "any" };
export type Nullable = { kind: "nullable", arguments: AnyKind };
export type Literal = { kind: "literal" };
export type Tuple = { kind: "tuple", types: AnyKind };
export type Import = {
  kind: "import",
  importKind: "value" | "type",
  name: string,
  moduleSpecifier: string,
  external?: boolean,
};

/* ? */ export type Program = { kind: "program", classes: Array<Property> };

export type AnyTypeKind =
  | String
  | Id
  | AssignmentPattern
  | ObjectPattern
  | Obj
  | ClassKind
  | Unary
  | Property
  | Exists
  | Null
  | TypeParam
  | Number
  | Boolean
  | Func
  | Union
  | Generic
  | Void
  | Intersection
  | Mixed
  | Any
  | Nullable
  | Literal
  | Spread
  | Tuple;
export type AnyValueKind =
  | String
  | Spread
  | Param
  | Id
  | TemplateLiteral
  | ArrayExpression
  | Variable
  | JSXMemberExpression
  | TemplateExpression
  | AssignmentPattern
  | ObjectPattern
  | JSXAttribute
  | JSXExpressionContainer
  | JSXElement
  | JSXIdentifier
  | JSXOpeningElement
  | Property
  | Call
  | New
  | Typeof
  | Number
  | Null
  | Boolean
  | BinaryExpression
  | MemberExpression
  | Func
  | Import;
export type AnyKind = AnyTypeKind | AnyValueKind | Program;

// @flow
/*::
export type String = { kind: "string", value?: string };
export type Param = {
  kind: "param",
  value: AnyKind,
  type: AnyKind | null
};
export type TypeParams = { kind: "typeParams", params: Array<AnyTypeKind> };
export type TypeParam = { kind: "typeParam", name: string };
export type TypeParamsDeclaration = {
  kind: "typeParamsDeclaration",
  params: Array<AnyTypeKind>
};
export type Id = { kind: "id", name: string, type?: ?$Diff<AnyKind, Id>, referenceIdName?: string };
export type TemplateLiteral = {
  kind: "templateLiteral",
  expressions: Array<AnyValueKind>,
  quasis: Array<TemplateElement>
};
export type Rest = {
  kind: "rest",
  argument: Id
};
export type TemplateExpression = { kind: "templateExpression", tag: Id };
export type AssignmentPattern = {
  kind: "assignmentPattern",
  left: AnyKind,
  right: AnyKind
};
export type ObjectPattern = {
  kind: "objectPattern",
  members: Array<Property>
};

export type ArrayType = {
  kind: "arrayType",
  type: AnyTypeKind,
}

export type Obj = { kind: "object", members: Array<Property> };
export type Property = {
  kind: "property",
  key: Id | String,
  value: AnyKind,
  optional?: boolean
};
export type ClassKind = { kind: "class", name: Id };
export type Spread = {
  kind: "spread",
  value: Property | Generic
};
export type Unary = {
  kind: "unary",
  operator: string,
  argument: AnyKind
};
export type JSXAttribute = {
  kind: "JSXAttribute",
  name: JSXIdentifier,
  value: any
};
export type JSXExpressionContainer = {
  kind: "JSXExpressionContainer",
  expression: any
};
export type JSXElement = { kind: "JSXElement", value: any };
export type JSXIdentifier = { kind: "JSXIdentifier", value: any };
export type JSXOpeningElement = {
  kind: "JSXOpeningElement",
  name: any,
  attributes: any
};
export type JSXMemberExpression = {
  kind: "JSXMemberExpression",
  object: any,
  property: any
};
export type Call = {
  kind: "call",
  callee: Id | Func,
  args: Array<AnyValueKind>
};
export type New = {
  kind: "new",
  callee: Id,
  args: Array<AnyValueKind>
};
export type Typeof = { kind: "typeof", name: string, type: AnyKind };
export type Exists = { kind: "exists" };
export type Number = {
  kind: "number",
  value?: number
};
export type Null = { kind: "null" };
export type TemplateElement = {
  kind: "templateElement",
  value: { raw: string, cooked: string }
};
export type Boolean = { kind: "boolean", value?: boolean };
export type ArrayExpression = { kind: "array", elements: any };
export type BinaryExpression = {
  kind: "binary",
  operator: string,
  left: AnyValueKind,
  right: AnyValueKind
};
export type MemberExpression = {
  kind: "memberExpression",
  object: Id | MemberExpression | Obj,
  property: Id
};
export type Func = {
  kind: "function",
  id?: Id | null,
  async?: boolean,
  generator?: boolean,
  parameters: Array<Param>,
  returnType: AnyTypeKind | null
};
export type Union = { kind: "union", types: Array<AnyTypeKind> };
export type Generic = {
  kind: "generic",
  value: AnyTypeKind,
  typeParams?: TypeParams
};
export type Initial = { kind: "initial", id: Id, value: AnyValueKind };
export type Variable = { kind: "variable", declarations: Array<Initial> };
export type Intersection = {
  kind: "intersection",
  types: Array<AnyTypeKind>
};
export type Void = { kind: "void" };
export type Mixed = { kind: "mixed" };
export type Any = { kind: "any" };
export type Nullable = { kind: "nullable", arguments: AnyTypeKind };
export type Literal = { kind: "literal" };
export type Tuple = { kind: "tuple", types: AnyTypeKind };
export type Import = {
  kind: "import",
  importKind: "value" | "type",
  name: string,
  moduleSpecifier: string,
  external?: boolean
};

export type Program = { kind: "program", component?: Property };

export type ExportSpecifier = { kind: "exportSpecifier", local: Id, exported: Id };
export type Export = { kind: "export", exports: Array<Id>, source?: String };

export type This = {
  kind: "custom",
  value: "this"
};

export type AnyTypeKind =
  | Any
  | AssignmentPattern
  | Boolean
  | ClassKind
  | Exists
  | Func
  | Generic
  | Id
  | Intersection
  | Literal
  | Mixed
  | Null
  | Nullable
  | Number
  | Obj
  | ObjectPattern
  | Property
  | Spread
  | String
  | Tuple
  | Typeof
  | TypeParams
  | Unary
  | Union
  | Void;
export type AnyValueKind =
  | TemplateElement
  | ArrayExpression
  | AssignmentPattern
  | BinaryExpression
  | Boolean
  | Call
  | Func
  | Id
  | Import
  | JSXAttribute
  | JSXElement
  | JSXExpressionContainer
  | JSXIdentifier
  | JSXMemberExpression
  | JSXOpeningElement
  | MemberExpression
  | New
  | Null
  | Number
  | ObjectPattern
  | Param
  | Property
  | Spread
  | String
  | TemplateExpression
  | TemplateLiteral
  | Variable;
export type AnyKind = AnyTypeKind | AnyValueKind | Program;
*/
